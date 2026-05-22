"use client";

import { useState } from "react";
import PieceCard from "./piece-card";
import type { Piece, PieceCategory, Potter } from "@/lib/types";

const CATEGORIES: { value: PieceCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "bowl", label: "Bowls" },
  { value: "mug", label: "Mugs" },
  { value: "vase", label: "Vases" },
  { value: "plate", label: "Plates" },
  { value: "sculpture", label: "Sculptures" },
  { value: "cup", label: "Cups" },
  { value: "platter", label: "Platters" },
  { value: "other", label: "Other" },
];

export default function GalleryGrid({
  pieces,
  potters,
}: {
  pieces: Piece[];
  potters: Pick<Potter, "id" | "name">[];
}) {
  const [category, setCategory] = useState<PieceCategory | "all">("all");
  const [potterId, setPotterId] = useState<string>("all");

  const filtered = pieces.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (potterId !== "all" && p.potter_id !== potterId) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors cursor-pointer ${
                category === cat.value
                  ? "bg-stone text-cream border-stone"
                  : "bg-transparent text-stone/60 border-stone/20 hover:border-stone/50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {potters.length > 1 && (
          <select
            value={potterId}
            onChange={(e) => setPotterId(e.target.value)}
            className="text-sm border border-stone/20 rounded-full px-4 py-1.5 bg-transparent text-stone/60 focus:outline-none focus:border-clay cursor-pointer"
          >
            <option value="all">All Potters</option>
            {potters.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center text-stone/40">
          <p className="font-serif text-2xl mb-2">Nothing here yet</p>
          <p className="text-sm">Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {filtered.map((piece) => (
            <PieceCard key={piece.id} piece={piece} />
          ))}
        </div>
      )}
    </div>
  );
}
