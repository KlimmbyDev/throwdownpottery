import Image from "next/image";
import Link from "next/link";
import type { Potter } from "@/lib/types";

export default function PotterCard({ potter }: { potter: Potter }) {
  return (
    <Link href={`/potters/${potter.slug}`} className="group block text-center">
      <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden bg-blush/30">
        {potter.avatar_url ? (
          <Image
            src={potter.avatar_url}
            alt={potter.name}
            fill
            className="object-cover"
            sizes="128px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-blush/20">
            <span className="font-serif text-3xl text-clay/60">{potter.name[0]}</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-serif text-lg text-stone group-hover:text-clay transition-colors">
          {potter.name}
        </h3>
        {potter.specialty && (
          <p className="text-sm text-stone/50 mt-1">{potter.specialty}</p>
        )}
        {potter.bio && (
          <p className="text-sm text-stone/60 mt-2 line-clamp-2 max-w-xs mx-auto">{potter.bio}</p>
        )}
        <span className="inline-block mt-3 text-xs text-clay underline underline-offset-2 group-hover:text-amber transition-colors">
          View work →
        </span>
      </div>
    </Link>
  );
}
