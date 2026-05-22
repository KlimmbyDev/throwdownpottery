import { createClient } from "@/lib/supabase/server";
import PotterCard from "@/components/potter-card";

export default async function PottersPage() {
  const supabase = await createClient();
  const { data: potters } = await supabase.from("potters").select("*").order("name");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-16">
        <p className="text-sage text-xs uppercase tracking-widest mb-2">The collective</p>
        <h1 className="font-serif text-4xl md:text-5xl text-stone">The Potters</h1>
      </div>
      {!potters || potters.length === 0 ? (
        <p className="text-stone/40">No potters yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-16 max-w-4xl">
          {potters.map((potter) => (
            <PotterCard key={potter.id} potter={potter} />
          ))}
        </div>
      )}
    </div>
  );
}
