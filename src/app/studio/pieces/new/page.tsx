import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PieceForm from "@/components/studio/piece-form";

export default async function NewPiecePage() {
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

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/studio"
          className="text-xs text-stone/40 hover:text-stone transition-colors"
        >
          ← Back
        </Link>
        <h1 className="font-serif text-2xl text-stone mt-2">Add new piece</h1>
      </div>
      <PieceForm potterId={potter.id} />
    </div>
  );
}
