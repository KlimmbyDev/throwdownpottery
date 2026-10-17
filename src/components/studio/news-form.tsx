"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveNews } from "@/app/studio/actions";
import NewsBanner from "@/components/news-banner";
import { NEWS_MAX_LENGTH, formatNewsDate } from "@/lib/news";

export default function NewsForm({
  initialBody,
  publishedAt,
}: {
  initialBody: string;
  publishedAt: string | null;
}) {
  const router = useRouter();
  const [body, setBody] = useState(initialBody);
  const [show, setShow] = useState(publishedAt !== null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const previewDate =
    publishedAt && body.trim() === initialBody.trim() ? publishedAt : new Date().toISOString();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const result = await saveNews(body, show);
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

  return (
    <div className="space-y-10">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <p className="text-sm text-stone/60">
          {publishedAt
            ? `Live on the homepage since ${formatNewsDate(publishedAt)}.`
            : "Not shown on the homepage."}
        </p>
        <div>
          <label htmlFor="news-body" className="block text-xs text-stone/50 uppercase tracking-wider mb-1">
            News
          </label>
          <textarea
            id="news-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            maxLength={NEWS_MAX_LENGTH}
            placeholder="e.g. Our winter market is on 6 December — come and say hello!"
            className="w-full border border-stone/20 rounded px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-clay resize-none"
          />
          <p className="text-xs text-stone/40 text-right">
            {body.length} / {NEWS_MAX_LENGTH}
          </p>
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
          <p
            role="status"
            className={`text-sm ${notice.kind === "ok" ? "text-stone" : "text-red-500"}`}
          >
            {notice.text}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="bg-sage text-stone font-medium px-8 py-3 rounded-full text-sm hover:bg-amber transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>

      {show && body.trim() && (
        <div>
          <p className="text-xs text-stone/50 uppercase tracking-wider mb-2">Preview</p>
          <div className="border border-stone/10 rounded overflow-hidden">
            <NewsBanner news={{ body: body.trim(), publishedAt: previewDate }} />
          </div>
        </div>
      )}
    </div>
  );
}
