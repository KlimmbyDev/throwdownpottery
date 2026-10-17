import Link from "next/link";
import type { Metadata } from "next";
import SignOutButton from "@/components/studio/sign-out-button";
import { getStudioSession } from "@/lib/studio-auth";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

const link = "text-xs text-stone/40 hover:text-stone transition-colors";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, member } = await getStudioSession();
  const isAdmin = member?.role === "admin" && !member.mustChangePassword;

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-blush sticky top-0 z-50 bg-cream/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <Link href="/studio" className="font-serif text-stone">
            Throw Down <span className="text-clay">Studio</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {isAdmin && (
              <>
                <Link href="/studio/users" className={link}>Users</Link>
                <Link href="/studio/artists" className={link}>Artists</Link>
                <Link href="/studio/news" className={link}>News</Link>
              </>
            )}
            <Link href="/" className={link}>View site</Link>
            {member && (
              <Link href="/studio/password" className={link}>Change password</Link>
            )}
            {user && <SignOutButton />}
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
