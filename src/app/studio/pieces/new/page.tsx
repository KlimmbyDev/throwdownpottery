import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PieceForm from "@/components/studio/piece-form";

export default async function NewPiecePage({
  searchParams,
}: {
  searchParams: Promise<{ potter?: string }>;
}) {
  const { potter: potterSlug } = await searchParams;
  if (!potterSlug) redirect("/studio");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/studio/login");

  const { data: potter } = await supabase
    .from("potters")
    .select("id, name, slug")
    .eq("slug", potterSlug)
    .single();

  if (!potter) redirect("/studio");

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/studio?potter=${potter.slug}`}
          className="text-xs text-stone/40 hover:text-stone transition-colors"
        >
          ← Back to {potter.name}
        </Link>
        <h1 className="font-serif text-2xl text-stone mt-2">Add new piece</h1>
      </div>
      <PieceForm potterId={potter.id} potterSlug={potter.slug} />
    </div>
  );
}
