import Image from "next/image";
import Link from "next/link";
import type { Piece } from "@/lib/types";

export default function PieceCard({ piece }: { piece: Piece }) {
  const image = piece.piece_images?.[0];

  return (
    <Link href={`/pieces/${piece.id}`} className="group block">
      <div className="aspect-[3/4] relative bg-blush/30 overflow-hidden rounded-sm">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? piece.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-sage/10">
            <span className="font-serif text-4xl text-stone/20">○</span>
          </div>
        )}
        {!piece.available && (
          <div className="absolute top-3 right-3 bg-stone/80 text-cream text-xs px-2 py-1 rounded-full">
            Sold
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <span className="text-xs uppercase tracking-widest text-sage font-medium">
          {piece.category}
        </span>
        <h3 className="font-serif text-stone group-hover:text-clay transition-colors leading-tight">
          {piece.title}
        </h3>
        {piece.potter && (
          <p className="text-sm text-stone/50">{piece.potter.name}</p>
        )}
        {piece.price != null && (
          <p className="text-sm font-medium text-clay">€{piece.price.toFixed(2)}</p>
        )}
      </div>
    </Link>
  );
}
