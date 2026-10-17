"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveNews } from "@/app/studio/actions";
import NewsBanner from "@/components/news-banner";
import NewsBar from "@/components/news-bar";
import { createClient } from "@/lib/supabase/client";
import { resizeImage } from "@/lib/resize-image";
import {
  NEWS_MAX_LENGTH,
  NEWS_TITLE_MAX_LENGTH,
  formatNewsDate,
  newsHasMore,
  type News,
} from "@/lib/news";

export default function NewsForm({
  initialTitle,
  initialBody,
  initialImageUrl,
  publishedAt,
}: {
  initialTitle: string;
  initialBody: string;
  initialImageUrl: string | null;
  publishedAt: string | null;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [show, setShow] = useState(publishedAt !== null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const unchanged =
    title.trim() === initialTitle.trim() &&
    body.trim() === initialBody.trim() &&
    imageUrl === initialImageUrl;
  const previewDate = publishedAt && unchanged ? publishedAt : new Date().toISOString();

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const original = e.target.files?.[0];
    e.target.value = "";
    if (!original) return;
    setUploading(true);
    setNotice(null);
    const file = await resizeImage(original);
    const ext = file.name.split(".").pop();
    const path = `news/${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("pottery-images").upload(path, file);
    if (error) {
      setNotice({
        kind: "error",
        text: "Couldn't upload that photo. Use a JPEG, PNG, WebP, GIF or HEIC under 10 MB.",
      });
    } else {
      setImageUrl(supabase.storage.from("pottery-images").getPublicUrl(path).data.publicUrl);
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const result = await saveNews({ title, body, show, imageUrl });
      if (result.error) {
        setNotice({ kind: "error", text: result.error });
      } else {
        setNotice({
          kind: "ok",
          text: show ? "Saved. It's live on the homepage." : "Saved. Nothing is shown on the homepage.",
        });
        router.refresh();
      }
    } catch {
      setNotice({ kind: "error", text: "Something went wrong. Please reload the page and try again." });
    } finally {
      setSaving(false);
    }
  }

  const previewNews: News = {
    title: title.trim(),
    body: body.trim() || null,
    publishedAt: previewDate,
    imageUrl,
  };

  return (
    <div className="space-y-10">
      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
        <p className="text-sm text-stone/60">
          {publishedAt
            ? `Live on the homepage since ${formatNewsDate(publishedAt)}.`
            : "Not shown on the homepage."}
        </p>

        <div>
          <label htmlFor="news-title" className="block text-xs text-stone/50 uppercase tracking-wider mb-1">
            Headline
          </label>
          <input
            id="news-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={NEWS_TITLE_MAX_LENGTH}
            placeholder="e.g. Winter market on 6 December"
            className="w-full border border-stone/20 rounded px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-clay"
          />
          <div className="flex justify-between gap-4 text-xs text-stone/40">
            <span>Shown in the slim bar right under the menu.</span>
            <span className="shrink-0">
              {title.length} / {NEWS_TITLE_MAX_LENGTH}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="news-body" className="block text-xs text-stone/50 uppercase tracking-wider mb-1">
            Text (optional)
          </label>
          <textarea
            id="news-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            maxLength={NEWS_MAX_LENGTH}
            placeholder="e.g. New work from every artist in the collective. Come and say hello!"
            className="w-full border border-stone/20 rounded px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-clay resize-none"
          />
          <div className="flex justify-between gap-4 text-xs text-stone/40">
            <span>With text or a photo, the bar gets a &ldquo;Read more&rdquo; link to them.</span>
            <span className="shrink-0">
              {body.length} / {NEWS_MAX_LENGTH}
            </span>
          </div>
        </div>

        <div>
          <span className="block text-xs text-stone/50 uppercase tracking-wider mb-2">
            Photo (optional)
          </span>
          <div className="flex items-center gap-4">
            {imageUrl && (
              <div className="relative w-24 aspect-[4/3] rounded-sm overflow-hidden bg-blush/30 shrink-0">
                <Image src={imageUrl} alt="" fill className="object-cover" sizes="96px" />
              </div>
            )}
            <div className="flex flex-col items-start gap-1">
              <label className="text-sm text-clay hover:text-amber transition-colors cursor-pointer">
                {uploading ? "Uploading…" : imageUrl ? "Change photo" : "Add photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhoto}
                  disabled={uploading}
                />
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="text-xs text-stone/40 hover:text-red-400 transition-colors cursor-pointer"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={show}
            onChange={(e) => setShow(e.target.checked)}
            className="w-4 h-4 accent-sage"
          />
          <span className="text-sm text-stone">Show on the homepage</span>
        </label>

        {notice && (
          <p role="status" className={`text-sm ${notice.kind === "ok" ? "text-stone" : "text-red-500"}`}>
            {notice.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-sage text-stone font-medium px-8 py-3 rounded-full text-sm hover:bg-amber transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>

      {show && previewNews.title && (
        <div className="space-y-2">
          <p className="text-xs text-stone/50 uppercase tracking-wider">Preview</p>
          <div className="border border-stone/10 rounded overflow-hidden">
            <NewsBar news={previewNews} />
            <div className="bg-stone/90 text-cream/40 text-center text-xs py-6">
              (homepage header)
            </div>
            {newsHasMore(previewNews) && <NewsBanner news={previewNews} />}
          </div>
        </div>
      )}
    </div>
  );
}
