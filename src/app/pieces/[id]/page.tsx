import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PieceCard from "@/components/piece-card";
import { getPiece } from "@/lib/data";
import { openGraph, truncate } from "@/lib/site";
import type { Piece, PieceImage } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

function sortedImages(piece: Piece) {
  return [...(piece.piece_images ?? [])].sort(
    (a: PieceImage, b: PieceImage) => a.position - b.position
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const piece = await getPiece((await params).id);
  if (!piece) return {};

  const title = `${piece.title} by ${piece.potter.name}`;
  const kind = piece.category === "other" ? "piece" : piece.category;
  const summary = [`Handmade ${kind} by ${piece.potter.name}`];
  if (!piece.available) summary.push("Sold");
  else if (piece.price != null) summary.push(`€${Number(piece.price).toFixed(2)}`);
  const description = piece.description ? truncate(piece.description) : summary.join(" · ");
  const image = sortedImages(piece)[0];

  return {
    title,
    description,
    openGraph: openGraph({
      title,
      description,
      image: image ? { url: image.url, alt: image.alt ?? piece.title } : null,
    }),
  };
}

export default async function PiecePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const piece = await getPiece(id);
  if (!piece) notFound();

  const { data: morePieces } = await supabase
    .from("pieces")
    .select("*, piece_images(*)")
    .eq("potter_id", piece.potter_id)
    .neq("id", piece.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(4);

  const images = sortedImages(piece);
  const primaryImage = images[0];
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@throwdownpottery.com";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[3/4] relative bg-sage/10 rounded-sm overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt ?? piece.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone/20 font-serif text-6xl">
                ○
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(1).map((img: { id: string; url: string; alt: string | null }) => (
                <div key={img.id} className="aspect-square relative bg-sage/10 rounded-sm overflow-hidden">
                  <Image
                    src={img.url}
                    alt={img.alt ?? piece.title}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div>
            <span className="text-xs uppercase tracking-widest text-sage font-medium">
              {piece.category}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-stone mt-2 leading-tight">
              {piece.title}
            </h1>
            {piece.potter && (
              <Link
                href={`/potters/${piece.potter.slug}`}
                className="inline-block mt-2 text-sm text-clay hover:text-amber transition-colors"
              >
                by {piece.potter.name}
              </Link>
            )}
          </div>

          {piece.price != null && (
            <p className="mt-6 text-2xl font-medium text-stone">
              €{Number(piece.price).toFixed(2)}
            </p>
          )}

          <div className="mt-2">
            {piece.available ? (
              <span className="text-xs text-sage font-medium uppercase tracking-widest">Available</span>
            ) : (
              <span className="text-xs text-stone/40 font-medium uppercase tracking-widest">Sold</span>
            )}
          </div>

          {piece.description && (
            <p className="mt-8 text-stone/70 leading-relaxed">{piece.description}</p>
          )}

          {(piece.materials || piece.dimensions) && (
            <div className="mt-8 space-y-3 text-sm text-stone/60 border-t border-stone/10 pt-8">
              {piece.materials && (
                <div className="flex gap-4">
                  <span className="w-24 text-stone/40 flex-shrink-0">Materials</span>
                  <span>{piece.materials}</span>
                </div>
              )}
              {piece.dimensions && (
                <div className="flex gap-4">
                  <span className="w-24 text-stone/40 flex-shrink-0">Dimensions</span>
                  <span>{piece.dimensions}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-10">
            {piece.available ? (
              <a
                href={`mailto:${contactEmail}?subject=Enquiry: ${encodeURIComponent(piece.title)}`}
                className="block w-full text-center bg-sage text-stone font-medium px-8 py-4 rounded-full text-sm tracking-wide hover:bg-amber transition-colors"
              >
                Enquire about this piece
              </a>
            ) : (
              <a
                href={`mailto:${contactEmail}?subject=Commission enquiry`}
                className="block w-full text-center bg-sage/20 text-stone font-medium px-8 py-4 rounded-full text-sm tracking-wide hover:bg-sage/30 transition-colors"
              >
                Commission something similar
              </a>
            )}
          </div>
        </div>
      </div>

      {morePieces && morePieces.length > 0 && (
        <section className="mt-24 pt-16 border-t border-stone/10">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-serif text-2xl md:text-3xl text-stone">
              More from {piece.potter.name}
            </h2>
            <Link
              href={`/potters/${piece.potter.slug}`}
              className="text-sm text-clay hover:text-amber transition-colors"
            >
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {morePieces.map((p) => (
              <PieceCard key={p.id} piece={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
