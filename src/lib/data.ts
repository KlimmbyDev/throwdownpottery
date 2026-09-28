import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Piece, Potter } from "@/lib/types";

// Cached per request so generateMetadata and the page share one query.

export const getPiece = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pieces")
    .select("*, potter:potters!inner(*), piece_images(*)")
    .eq("id", id)
    .is("archived_at", null)
    .is("potter.archived_at", null)
    .single();
  return data as (Piece & { potter: Potter }) | null;
});

export const getPotter = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("potters")
    .select("*")
    .eq("slug", slug)
    .is("archived_at", null)
    .single();
  return data as Potter | null;
});
