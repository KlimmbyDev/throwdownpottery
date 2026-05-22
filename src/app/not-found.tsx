import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-serif text-6xl text-sage/40 mb-4">404</p>
        <h1 className="font-serif text-2xl text-stone mb-4">Page not found</h1>
        <p className="text-stone/50 mb-8">This piece may have been moved or doesn't exist.</p>
        <Link
          href="/"
          className="text-sm text-clay hover:text-amber transition-colors underline underline-offset-2"
        >
          ← Return home
        </Link>
      </div>
    </div>
  );
}
