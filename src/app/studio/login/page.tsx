"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STUDIO_EMAIL = "potter@throwdownpottery.com";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: STUDIO_EMAIL,
      password,
    });
    if (error) {
      setError("Incorrect password");
      setLoading(false);
    } else {
      router.push("/studio");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-stone">
            Throw Down <span className="text-clay">Studio</span>
          </h1>
          <p className="text-sm text-stone/50 mt-2">Sign in to manage your pieces</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-stone/50 uppercase tracking-wider mb-1">
              Username
            </label>
            <div className="w-full border border-stone/10 rounded px-3 py-2.5 text-sm bg-stone/5 text-stone/40 select-none">
              potter
            </div>
          </div>
          <div>
            <label className="block text-xs text-stone/50 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-stone/20 rounded px-3 py-2.5 text-sm bg-cream focus:outline-none focus:border-clay"
              required
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage text-stone font-medium py-3 rounded-full text-sm hover:bg-amber transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
