import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-clay/20 bg-stone text-cream/70 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-serif text-lg font-bold text-cream">Throw Down Pottery</p>
            <p className="text-sm mt-1">Handcrafted pieces, made to last.</p>
          </div>
          <nav className="flex gap-6 text-sm">
            <Link href="/gallery" className="hover:text-amber transition-colors">Gallery</Link>
            <Link href="/potters" className="hover:text-amber transition-colors">Potters</Link>
            <Link href="/contact" className="hover:text-amber transition-colors">Contact</Link>
          </nav>
        </div>
        <p className="text-xs mt-8 text-center text-cream/40">
          © {new Date().getFullYear()} Throw Down Pottery. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
