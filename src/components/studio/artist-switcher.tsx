"use client";

import { useRouter } from "next/navigation";

export default function ArtistSwitcher({
  artists,
  current,
}: {
  artists: { name: string; slug: string }[];
  current: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 mb-1">
      <label htmlFor="managing-artist" className="text-xs text-stone/40">
        Managing
      </label>
      <select
        id="managing-artist"
        value={current}
        onChange={(e) => router.push(`/studio?potter=${e.target.value}`)}
        className="text-xs border border-stone/20 rounded-full px-3 py-1 bg-transparent text-stone focus:outline-none focus:border-clay cursor-pointer"
      >
        {artists.map((a) => (
          <option key={a.slug} value={a.slug}>{a.name}</option>
        ))}
      </select>
    </div>
  );
}
