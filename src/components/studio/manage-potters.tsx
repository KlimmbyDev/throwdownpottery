"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addArtist, setArtistArchived } from "@/app/studio/actions";
import type { Potter } from "@/lib/types";

export default function ManagePotters({ potters }: { potters: Potter[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const live = potters.filter((p) => !p.archived_at);
  const archived = potters.filter((p) => p.archived_at);

  async function addPotter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const result = await addArtist(name);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
    router.refresh();
  }

  async function setArchived(potter: Potter, value: boolean) {
    if (
      value &&
      !confirm(
        `Archive ${potter.name}? They and all their pieces will be hidden from the site. You can restore them any time.`
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    const result = await setArtistArchived(potter.id, value);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const row = "flex items-center justify-between py-3 border-b border-stone/10";
  const action = "text-xs transition-colors cursor-pointer disabled:opacity-50";

  return (
    <div className="max-w-xl space-y-12">
      <form onSubmit={addPotter} className="flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New artist's name"
          className="flex-1 border border-stone/20 rounded px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-clay"
        />
        <button
          type="submit"
          disabled={busy}
          className="bg-sage text-stone text-sm font-medium px-5 py-2.5 rounded-full hover:bg-amber transition-colors disabled:opacity-50 cursor-pointer"
        >
          Add artist
        </button>
      </form>

      {error && <p className="text-sm text-red-500 -mt-8">{error}</p>}

      <section>
        <h2 className="text-xs text-stone/50 uppercase tracking-wider mb-2">On the site</h2>
        {live.length === 0 ? (
          <p className="text-sm text-stone/40 py-3">No artists yet.</p>
        ) : (
          live.map((p) => (
            <div key={p.id} className={row}>
              <span className="font-serif text-stone">{p.name}</span>
              <button
                onClick={() => setArchived(p, true)}
                disabled={busy}
                className={`${action} text-stone/40 hover:text-red-400`}
              >
                Archive
              </button>
            </div>
          ))
        )}
      </section>

      {archived.length > 0 && (
        <section>
          <h2 className="text-xs text-stone/50 uppercase tracking-wider mb-2">Archived</h2>
          {archived.map((p) => (
            <div key={p.id} className={row}>
              <span className="font-serif text-stone/50">{p.name}</span>
              <button
                onClick={() => setArchived(p, false)}
                disabled={busy}
                className={`${action} text-clay hover:text-amber`}
              >
                Restore
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
