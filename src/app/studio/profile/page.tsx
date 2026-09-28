import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "@/components/studio/profile-form";

export default async function ProfilePage({
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
    .select("*")
    .eq("slug", potterSlug)
    .is("archived_at", null)
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
        <h1 className="font-serif text-2xl text-stone mt-2">Your profile</h1>
        <p className="text-sm text-stone/50 mt-1">
          Shown on your artist page. Anything left empty simply isn&apos;t shown.
        </p>
      </div>
      <ProfileForm potter={potter} />
    </div>
  );
}
