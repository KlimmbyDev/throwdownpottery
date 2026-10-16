import type { Piece } from "@/lib/types";

export const HOMEPAGE_SLOTS = 6;

// One piece per artist (their chosen homepage piece, else their newest), then
// the newest remaining pieces until the section has HOMEPAGE_SLOTS. With more
// artists than slots, every artist still gets one. Expects available pieces
// sorted newest first and artist ids in display order.
export function pickHomepagePieces<P extends Pick<Piece, "id" | "potter_id" | "featured">>(
  pieces: P[],
  artistIds: string[]
): P[] {
  const picks: P[] = [];
  for (const artistId of artistIds) {
    const own = pieces.filter((p) => p.potter_id === artistId);
    const pick = own.find((p) => p.featured) ?? own[0];
    if (pick) picks.push(pick);
  }

  const chosen = new Set(picks.map((p) => p.id));
  for (const piece of pieces) {
    if (picks.length >= HOMEPAGE_SLOTS) break;
    if (!chosen.has(piece.id)) {
      picks.push(piece);
      chosen.add(piece.id);
    }
  }
  return picks;
}
