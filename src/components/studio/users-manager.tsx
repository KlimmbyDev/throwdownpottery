"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createStudioUser,
  removeStudioUser,
  resetUserPassword,
  setUserArchived,
  setUserRole,
  type NewUserArtist,
} from "@/app/studio/actions";
import type { StudioRole } from "@/lib/studio-auth";

export type StudioUserRow = {
  id: string;
  email: string;
  role: StudioRole | null;
  artistName: string | null;
  status: "active" | "archived" | "no-access";
  mustChangePassword: boolean;
  isMe: boolean;
};

type Notice = { kind: "ok" | "error"; text: string } | null;

const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generatePassword() {
  const bytes = crypto.getRandomValues(new Uint32Array(12));
  return Array.from(bytes, (b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length]).join("");
}

const input =
  "w-full border border-stone/20 rounded px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-clay";
const label = "block text-xs text-stone/50 uppercase tracking-wider mb-1";
const action = "text-xs transition-colors cursor-pointer disabled:opacity-50";

export default function UsersManager({
  rows,
  availableArtists,
}: {
  rows: StudioUserRow[];
  availableArtists: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generatePassword);
  const [role, setRole] = useState<StudioRole>("artist");
  const [artistChoice, setArtistChoice] = useState("new");
  const [artistName, setArtistName] = useState("");

  async function run(task: () => Promise<{ error?: string }>, success?: string) {
    setBusy(true);
    setNotice(null);
    try {
      const result = await task();
      if (result.error) {
        setNotice({ kind: "error", text: result.error });
        return false;
      }
      if (success) setNotice({ kind: "ok", text: success });
      router.refresh();
      return true;
    } catch {
      setNotice({ kind: "error", text: "Something went wrong. Please try again." });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const artist: NewUserArtist =
      artistChoice === "new"
        ? { kind: "new", name: artistName }
        : artistChoice === "none"
          ? { kind: "none" }
          : { kind: "existing", potterId: artistChoice };
    const created = email.trim();
    const temp = password;
    const ok = await run(
      () => createStudioUser({ email: created, password: temp, role, artist }),
      `Account created for ${created}. Their temporary password is ${temp}. Pass it on privately; they'll choose their own when they first sign in.`
    );
    if (ok) {
      setEmail("");
      setArtistName("");
      setArtistChoice("new");
      setRole("artist");
      setPassword(generatePassword());
    }
  }

  function resetPassword(row: StudioUserRow) {
    if (!confirm(`Give ${row.email} a new temporary password? Their current one stops working.`)) return;
    const temp = generatePassword();
    run(
      () => resetUserPassword(row.id, temp),
      `New temporary password for ${row.email}: ${temp}. Pass it on privately.`
    );
  }

  function changeRole(row: StudioUserRow) {
    const next: StudioRole = row.role === "admin" ? "artist" : "admin";
    const question =
      next === "admin"
        ? `Make ${row.email} a super admin? They'll be able to manage every user and all content.`
        : `Make ${row.email} an artist? They'll only be able to manage their own profile and pieces.`;
    if (!confirm(question)) return;
    run(() => setUserRole(row.id, next));
  }

  function archive(row: StudioUserRow, value: boolean) {
    if (
      value &&
      !confirm(
        `Archive ${row.email}? They won't be able to sign in, and their artist profile and work will be hidden from the site. You can restore them any time.`
      )
    ) {
      return;
    }
    run(() => setUserArchived(row.id, value));
  }

  async function remove(row: StudioUserRow, mode: "keep-work" | "delete-everything") {
    const question =
      mode === "keep-work"
        ? `Remove ${row.email}'s login? Their artist profile and work are kept, archived.`
        : `Permanently delete ${row.email}, their artist profile, every piece and every photo? This cannot be undone.`;
    if (!confirm(question)) return;
    const ok = await run(() => removeStudioUser(row.id, mode));
    if (ok) setRemoving(null);
  }

  return (
    <div className="space-y-12">
      <form onSubmit={addUser} className="space-y-4 max-w-xl border border-stone/10 rounded p-5">
        <h2 className="font-serif text-lg text-stone">Add a user</h2>
        <div>
          <label htmlFor="new-email" className={label}>Email</label>
          <input
            id="new-email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
            required
          />
        </div>
        <div>
          <label htmlFor="new-password" className={label}>Temporary password</label>
          <div className="flex gap-2">
            <input
              id="new-password"
              type="text"
              autoComplete="off"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
              required
            />
            <button
              type="button"
              onClick={() => setPassword(generatePassword())}
              className="text-xs text-clay hover:text-amber transition-colors cursor-pointer whitespace-nowrap px-2"
            >
              New one
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="new-role" className={label}>Role</label>
            <select
              id="new-role"
              value={role}
              onChange={(e) => setRole(e.target.value as StudioRole)}
              className={`${input} cursor-pointer`}
            >
              <option value="artist">Artist</option>
              <option value="admin">Super admin</option>
            </select>
          </div>
          <div>
            <label htmlFor="new-artist" className={label}>Artist profile</label>
            <select
              id="new-artist"
              value={artistChoice}
              onChange={(e) => setArtistChoice(e.target.value)}
              className={`${input} cursor-pointer`}
            >
              <option value="new">Create a new profile</option>
              {availableArtists.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
              <option value="none">No artist profile</option>
            </select>
          </div>
        </div>
        {artistChoice === "new" && (
          <div>
            <label htmlFor="new-artist-name" className={label}>Artist name (shown on the site)</label>
            <input
              id="new-artist-name"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className={input}
              required
            />
          </div>
        )}
        <button
          type="submit"
          disabled={busy}
          className="bg-sage text-stone text-sm font-medium px-6 py-2.5 rounded-full hover:bg-amber transition-colors disabled:opacity-50 cursor-pointer"
        >
          Add user
        </button>
      </form>

      {notice && (
        <p
          role="status"
          className={`text-sm rounded p-3 ${
            notice.kind === "ok" ? "bg-sage/20 text-stone" : "bg-red-50 text-red-600"
          }`}
        >
          {notice.text}
        </p>
      )}

      <section>
        <h2 className="text-xs text-stone/50 uppercase tracking-wider mb-2">All logins</h2>
        {rows.map((row) => (
          <div key={row.id} className="py-4 border-b border-stone/10">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className={`text-sm ${row.status === "active" ? "text-stone" : "text-stone/50"}`}>
                {row.email}
                {row.isMe && <span className="text-stone/40"> (you)</span>}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-stone/50">
                {row.status === "no-access"
                  ? "No studio access"
                  : row.role === "admin"
                    ? "Super admin"
                    : "Artist"}
                {row.status === "archived" && " · Archived"}
                {row.status === "active" && row.mustChangePassword && " · Hasn't set a password yet"}
              </span>
            </div>
            {row.artistName && <p className="text-xs text-stone/50 mt-0.5">Artist: {row.artistName}</p>}

            {!row.isMe && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {row.status === "active" && (
                  <>
                    <button onClick={() => changeRole(row)} disabled={busy} className={`${action} text-clay hover:text-amber`}>
                      {row.role === "admin" ? "Make artist" : "Make super admin"}
                    </button>
                    <button onClick={() => resetPassword(row)} disabled={busy} className={`${action} text-stone/50 hover:text-stone`}>
                      Reset password
                    </button>
                    <button onClick={() => archive(row, true)} disabled={busy} className={`${action} text-stone/50 hover:text-stone`}>
                      Archive
                    </button>
                  </>
                )}
                {row.status === "archived" && (
                  <button onClick={() => archive(row, false)} disabled={busy} className={`${action} text-clay hover:text-amber`}>
                    Restore
                  </button>
                )}
                <button
                  onClick={() => setRemoving(removing === row.id ? null : row.id)}
                  disabled={busy}
                  className={`${action} text-stone/30 hover:text-red-400`}
                >
                  Remove…
                </button>
              </div>
            )}

            {removing === row.id && (
              <div className="mt-3 flex flex-wrap gap-3 items-center bg-red-50/60 rounded p-3">
                <button
                  onClick={() => remove(row, "keep-work")}
                  disabled={busy}
                  className={`${action} border border-stone/20 rounded-full px-3 py-1.5 text-stone hover:border-stone/50`}
                >
                  {row.artistName ? "Remove login, keep work archived" : "Remove login"}
                </button>
                {row.artistName && (
                  <button
                    onClick={() => remove(row, "delete-everything")}
                    disabled={busy}
                    className={`${action} border border-red-300 rounded-full px-3 py-1.5 text-red-600 hover:bg-red-100`}
                  >
                    Delete everything permanently
                  </button>
                )}
                <button onClick={() => setRemoving(null)} className={`${action} text-stone/50 hover:text-stone`}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
