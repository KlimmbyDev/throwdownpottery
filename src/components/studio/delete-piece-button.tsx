"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeletePieceButton({ pieceId }: { pieceId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this piece? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("pieces").delete().eq("id", pieceId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-stone/30 hover:text-red-400 transition-colors cursor-pointer"
    >
      Delete
    </button>
  );
}
