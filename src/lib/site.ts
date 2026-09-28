import type { Metadata } from "next";

export const SITE_URL = "https://throwdownpottery.vercel.app";
export const SITE_NAME = "Throw Down Pottery";
export const SITE_DESCRIPTION = "Handcrafted pottery and prints by a collective of artists.";

const DEFAULT_IMAGE = { url: "/og", width: 1200, height: 630, alt: SITE_NAME };

// Metadata merges shallowly, so a page that sets openGraph replaces the root
// layout's openGraph entirely. Build every page's openGraph through here so
// the site name and the fallback image are never dropped.
export function openGraph({
  title,
  description,
  image,
}: {
  title?: string;
  description?: string;
  image?: { url: string; alt?: string } | null;
}): Metadata["openGraph"] {
  return {
    type: "website",
    siteName: SITE_NAME,
    title,
    description,
    images: [image ?? DEFAULT_IMAGE],
  };
}

export function truncate(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max - 1).trimEnd() + "…";
}
