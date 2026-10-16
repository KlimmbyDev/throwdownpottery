import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PieceForm from "@/components/studio/piece-form";
import { canManagePotter, liveArtists, requireMember } from "@/lib/studio-auth";

export default async function NewPiecePage({
  searchParams,
}: {
  searchParams: Promise<{ potter?: string }>;
}) {
  const { potter: potterSlug } = await searchParams;
  if (!potterSlug) redirect("/studio");

  const member = await requireMember();
  const supabase = await createClient();

  const { data: potter } = await supabase
    .from("potters")
    .select("id, name, slug")
    .eq("slug", potterSlug)
    .single();

  if (!potter || !canManagePotter(member, potter.id)) redirect("/studio");

  const artists = member.role === "admin" ? await liveArtists() : undefined;

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
      <PieceForm potterId={potter.id} potterSlug={potter.slug} artists={artists} />
    </div>
  );
}
