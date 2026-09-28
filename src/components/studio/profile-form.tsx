"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { resizeImage } from "@/lib/resize-image";
import { instagramHandle, toInstagramUrl } from "@/lib/instagram";
import type { Potter } from "@/lib/types";

const input =
  "w-full border border-stone/20 rounded px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-clay";
const label = "block text-xs text-stone/50 uppercase tracking-wider mb-1";

export default function ProfileForm({ potter }: { potter: Potter }) {
  const router = useRouter();
  const [name, setName] = useState(potter.name);
  const [specialty, setSpecialty] = useState(potter.specialty ?? "");
  const [bio, setBio] = useState(potter.bio ?? "");
  const [instagram, setInstagram] = useState(instagramHandle(potter.instagram_url));
  const [avatarUrl, setAvatarUrl] = useState(potter.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const original = e.target.files?.[0];
    e.target.value = "";
    if (!original) return;
    setUploading(true);
    setError("");
    const file = await resizeImage(original);
    const ext = file.name.split(".").pop();
    const path = `avatars/${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage.from("pottery-images").upload(path, file);
    if (uploadError) {
      setError("Couldn't upload that photo. Please try another.");
    } else {
      setAvatarUrl(supabase.storage.from("pottery-images").getPublicUrl(path).data.publicUrl);
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const instagramUrl = toInstagramUrl(instagram);
    if (instagramUrl === "invalid") {
      setError("Instagram should be your handle (like @yourname) or an instagram.com link.");
      return;
    }

    setSaving(true);
    const { data, error: saveError } = await createClient()
      .from("potters")
      .update({
        name: name.trim(),
        specialty: specialty.trim() || null,
        bio: bio.trim() || null,
        instagram_url: instagramUrl,
        avatar_url: avatarUrl,
      })
      .eq("id", potter.id)
      .select("id");

    // RLS blocks silently: a refused update returns no error and no rows.
    if (saveError || !data?.length) {
      setError("Couldn't save your profile. Please try again.");
      setSaving(false);
      return;
    }

    router.push(`/studio?potter=${potter.slug}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div>
        <span className={label}>Photo</span>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-blush/30 flex-shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" fill className="object-cover" sizes="80px" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif text-2xl text-clay/60">{name[0] ?? "?"}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-start gap-1">
            <label className="text-sm text-clay hover:text-amber transition-colors cursor-pointer">
              {uploading ? "Uploading…" : avatarUrl ? "Change photo" : "Add photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
                disabled={uploading}
              />
            </label>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl(null)}
                className="text-xs text-stone/40 hover:text-red-400 transition-colors cursor-pointer"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="name">Name *</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={input} required />
      </div>

      <div>
        <label className={label} htmlFor="specialty">Specialty</label>
        <input
          id="specialty"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          placeholder="e.g. Wheel-thrown stoneware or lino prints"
          className={input}
        />
      </div>

      <div>
        <label className={label} htmlFor="bio">About you</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          placeholder="A few sentences about you and your work"
          className={`${input} resize-none`}
        />
      </div>

      <div>
        <label className={label} htmlFor="instagram">Instagram</label>
        <input
          id="instagram"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="@yourname"
          className={input}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-sage text-stone font-medium px-8 py-3 rounded-full text-sm hover:bg-amber transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-stone/40 hover:text-stone transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
