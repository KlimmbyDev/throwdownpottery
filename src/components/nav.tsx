"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/gallery", label: "Gallery" },
  { href: "/potters", label: "Potters" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-blush bg-cream/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-serif text-xl font-bold tracking-tight text-stone">
            Throw Down <span className="text-clay">Pottery</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm tracking-wide transition-colors hover:text-clay ${
                  pathname.startsWith(href) ? "text-clay font-medium" : "text-stone/70"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-stone/70"
            aria-label="Toggle menu"
          >
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-clay/10 py-4 flex flex-col gap-4">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="text-sm tracking-wide text-stone/70 hover:text-clay transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
