"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PieceActions({
  pieceId,
  archived,
}: {
  pieceId: string;
  archived: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(action: () => PromiseLike<{ error: unknown }>) {
    setBusy(true);
    const { error } = await action();
    setBusy(false);
    if (error) {
      alert("Something went wrong. Please try again.");
      return;
    }
    router.refresh();
  }

  function setArchived(value: boolean) {
    if (value && !confirm("Hide this piece from the site? You can restore it any time.")) return;
    run(() =>
      createClient()
        .from("pieces")
        .update({ archived_at: value ? new Date().toISOString() : null })
        .eq("id", pieceId)
    );
  }

  function remove() {
    if (!confirm("Permanently delete this piece and its photos? This cannot be undone.")) return;
    run(() => createClient().from("pieces").delete().eq("id", pieceId));
  }

  const button = "text-xs transition-colors cursor-pointer disabled:opacity-50";

  return (
    <>
      <button
        onClick={() => setArchived(!archived)}
        disabled={busy}
        className={`${button} text-stone/50 hover:text-stone`}
      >
        {archived ? "Restore" : "Archive"}
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className={`${button} text-stone/30 hover:text-red-400`}
      >
        {archived ? "Delete permanently" : "Delete"}
      </button>
    </>
  );
}
