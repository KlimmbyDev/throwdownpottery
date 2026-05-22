import { createClient } from "@/lib/supabase/server";
import GalleryGrid from "@/components/gallery-grid";

export default async function GalleryPage() {
  let pieces = null;
  let potters = null;

  try {
    const supabase = await createClient();
    const [piecesRes, pottersRes] = await Promise.all([
      supabase
        .from("pieces")
        .select("*, potter:potters(*), piece_images(*)")
        .order("created_at", { ascending: false }),
      supabase.from("potters").select("id, name").order("name"),
    ]);
    pieces = piecesRes.data;
    potters = pottersRes.data;
  } catch {
    // Missing env vars or Supabase unreachable — render with empty data
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <p className="text-sage text-xs uppercase tracking-widest mb-2">All works</p>
        <h1 className="font-serif text-4xl md:text-5xl text-stone">Gallery</h1>
      </div>
      <GalleryGrid pieces={pieces ?? []} potters={potters ?? []} />
    </div>
  );
}
