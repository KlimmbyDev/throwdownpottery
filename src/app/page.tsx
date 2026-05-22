import Link from "next/link";
import PieceCard from "@/components/piece-card";
import PotterCard from "@/components/potter-card";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: featuredPieces }, { data: potters }] = await Promise.all([
    supabase
      .from("pieces")
      .select("*, potter:potters(*), piece_images(*)")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("potters").select("*").order("name"),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-stone py-32 md:py-48">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,#A47E77,transparent_60%)] opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sage text-sm uppercase tracking-[0.3em] mb-6 font-medium">
            A collective of potters
          </p>
          <h1 className="font-serif text-cream text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
            Throw Down
            <br />
            <span className="text-sage">Pottery</span>
          </h1>
          <p className="mt-8 text-cream/60 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Handcrafted pieces shaped by three potters. Each one unique, made to be used and loved.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/gallery"
              className="inline-block bg-sage text-stone font-medium px-8 py-4 rounded-full text-sm tracking-wide hover:bg-amber transition-colors"
            >
              Explore the Gallery
            </Link>
            <Link
              href="/potters"
              className="inline-block border border-cream/30 text-cream px-8 py-4 rounded-full text-sm tracking-wide hover:border-cream/60 transition-colors"
            >
              Meet the Potters
            </Link>
          </div>
        </div>
      </section>

      {/* Featured pieces */}
      {featuredPieces && featuredPieces.length > 0 && (
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-sage text-xs uppercase tracking-widest mb-2">Selected works</p>
              <h2 className="font-serif text-3xl md:text-4xl text-stone">Featured Pieces</h2>
            </div>
            <Link href="/gallery" className="text-sm text-clay hover:text-amber transition-colors hidden sm:block">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {featuredPieces.map((piece) => (
              <PieceCard key={piece.id} piece={piece} />
            ))}
          </div>
          <div className="mt-10 text-center sm:hidden">
            <Link href="/gallery" className="text-sm text-clay hover:text-amber transition-colors">
              View all →
            </Link>
          </div>
        </section>
      )}

      {/* Meet the potters */}
      {potters && potters.length > 0 && (
        <section className="py-24 bg-blush/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sage text-xs uppercase tracking-widest mb-2">The people behind the pieces</p>
              <h2 className="font-serif text-3xl md:text-4xl text-stone">Meet the Potters</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-3xl mx-auto">
              {potters.map((potter) => (
                <PotterCard key={potter.id} potter={potter} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-stone mb-4">
            Looking for something specific?
          </h2>
          <p className="text-stone/60 mb-8">
            We take commissions and can create custom pieces. Get in touch and we'll discuss what's possible.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-clay text-cream font-medium px-8 py-4 rounded-full text-sm tracking-wide hover:bg-stone transition-colors"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
