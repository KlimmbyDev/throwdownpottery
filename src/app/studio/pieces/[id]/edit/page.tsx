import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import PieceForm from "@/components/studio/piece-form";

export default async function EditPiecePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ potter?: string }>;
}) {
  const { id } = await params;
  const { potter: potterSlug } = await searchParams;
  if (!potterSlug) redirect("/studio");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/studio/login");

  const { data: potter } = await supabase
    .from("potters")
    .select("id, slug")
    .eq("slug", potterSlug)
    .single();

  if (!potter) redirect("/studio");

  const { data: piece } = await supabase
    .from("pieces")
    .select("*, piece_images(*)")
    .eq("id", id)
    .eq("potter_id", potter.id)
    .single();

  if (!piece) notFound();

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/studio?potter=${potter.slug}`}
          className="text-xs text-stone/40 hover:text-stone transition-colors"
        >
          ← Back
        </Link>
        <h1 className="font-serif text-2xl text-stone mt-2">Edit piece</h1>
      </div>
      <PieceForm potterId={potter.id} potterSlug={potter.slug} piece={piece} />
    </div>
  );
}
