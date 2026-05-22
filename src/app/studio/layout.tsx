import Link from "next/link";
import SignOutButton from "@/components/studio/sign-out-button";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-blush sticky top-0 z-50 bg-cream/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/studio" className="font-serif text-stone">
            Throw Down <span className="text-clay">Studio</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-stone/40 hover:text-stone transition-colors">
              View site
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
