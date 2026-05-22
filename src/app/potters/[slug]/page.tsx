import { createClient } from "@/lib/supabase/server";
import PieceCard from "@/components/piece-card";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function PotterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: potter } = await supabase
    .from("potters")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!potter) notFound();

  const { data: pieces } = await supabase
    .from("pieces")
    .select("*, potter:potters(*), piece_images(*)")
    .eq("potter_id", potter.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <section className="bg-stone py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-blush/30 flex-shrink-0">
              {potter.avatar_url ? (
                <Image
                  src={potter.avatar_url}
                  alt={potter.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-serif text-4xl text-blush/60">{potter.name[0]}</span>
                </div>
              )}
            </div>
            <div>
              {potter.specialty && (
                <p className="text-sage text-xs uppercase tracking-widest mb-2">{potter.specialty}</p>
              )}
              <h1 className="font-serif text-4xl md:text-5xl text-cream">{potter.name}</h1>
              {potter.bio && (
                <p className="mt-4 text-cream/60 max-w-xl leading-relaxed">{potter.bio}</p>
              )}
              {potter.instagram_url && (
                <a
                  href={potter.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-sm text-sage hover:text-amber transition-colors"
                >
                  Instagram →
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-serif text-2xl text-stone mb-10">Work by {potter.name}</h2>
        {!pieces || pieces.length === 0 ? (
          <div className="py-16 text-center text-stone/40">
            <p className="font-serif text-xl">No pieces yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {pieces.map((piece) => (
              <PieceCard key={piece.id} piece={piece} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
