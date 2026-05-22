import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import PieceForm from "@/components/studio/piece-form";

export default async function EditPiecePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/studio/login");

  const { data: potter } = await supabase
    .from("potters")
    .select("id")
    .eq("user_id", user.id)
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
          href="/studio"
          className="text-xs text-stone/40 hover:text-stone transition-colors"
        >
          ← Back
        </Link>
        <h1 className="font-serif text-2xl text-stone mt-2">Edit piece</h1>
      </div>
      <PieceForm potterId={potter.id} piece={piece} />
    </div>
  );
}
