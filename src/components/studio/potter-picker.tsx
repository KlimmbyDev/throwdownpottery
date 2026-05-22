"use client";

import { useRouter } from "next/navigation";
import type { Potter } from "@/lib/types";

export default function PotterPicker({ potters }: { potters: Potter[] }) {
  const router = useRouter();

  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <p className="text-sage text-xs uppercase tracking-widest mb-2">Welcome</p>
        <h1 className="font-serif text-3xl text-stone">Who are you?</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
        {potters.map((potter) => (
          <button
            key={potter.id}
            onClick={() => router.push(`/studio?potter=${potter.slug}`)}
            className="group border border-stone/20 rounded py-8 px-4 text-center hover:border-sage hover:bg-sage/10 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-blush/40 flex items-center justify-center mx-auto mb-3 group-hover:bg-blush/60 transition-colors">
              <span className="font-serif text-xl text-clay">{potter.name[0]}</span>
            </div>
            <p className="font-serif text-stone text-lg">{potter.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
