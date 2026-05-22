"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/studio/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="text-xs text-stone/40 hover:text-stone transition-colors cursor-pointer"
    >
      Sign out
    </button>
  );
}
