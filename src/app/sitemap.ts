import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/site";

// Rebuilt hourly so new pieces are listed without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [{ data: potters }, { data: pieces }] = await Promise.all([
    supabase.from("potters").select("slug, created_at").is("archived_at", null),
    supabase
      .from("pieces")
      .select("id, created_at, potter:potters!inner(archived_at)")
      .is("archived_at", null)
      .is("potter.archived_at", null),
  ]);

  const pages = ["", "/gallery", "/artists", "/contact"].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  return [
    ...pages,
    ...(potters ?? []).map((p) => ({
      url: `${SITE_URL}/artists/${p.slug}`,
      lastModified: p.created_at,
    })),
    ...(pieces ?? []).map((p) => ({
      url: `${SITE_URL}/pieces/${p.id}`,
      lastModified: p.created_at,
    })),
  ];
}
