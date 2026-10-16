"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changeOwnPassword } from "@/app/studio/actions";

const input =
  "w-full border border-stone/20 rounded px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-clay";
const label = "block text-xs text-stone/50 uppercase tracking-wider mb-1";

export default function PasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setSaving(true);
    try {
      const result = await changeOwnPassword(password);
      if (result.error) {
        setError(result.error);
        setSaving(false);
        return;
      }
      router.push("/studio");
      router.refresh();
    } catch {
      setError("Something went wrong. Please reload the page and try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="new-password" className={label}>New password</label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
          required
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className={label}>Repeat it</label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={input}
          required
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="bg-sage text-stone font-medium px-8 py-3 rounded-full text-sm hover:bg-amber transition-colors disabled:opacity-50 cursor-pointer"
      >
        {saving ? "Saving…" : "Save password"}
      </button>
    </form>
  );
}
