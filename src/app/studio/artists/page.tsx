import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ManagePotters from "@/components/studio/manage-potters";

export default async function ManagePottersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/studio/login");

  const { data: potters } = await supabase.from("potters").select("*").order("name");

  return (
    <div>
      <div className="mb-8">
        <Link href="/studio" className="text-xs text-stone/40 hover:text-stone transition-colors">
          ← Back
        </Link>
        <h1 className="font-serif text-2xl text-stone mt-2">Manage artists</h1>
        <p className="text-sm text-stone/50 mt-1">
          Archiving hides an artist and all their pieces from the site. Nothing is deleted, and
          you can restore them any time.
        </p>
      </div>
      <ManagePotters potters={potters ?? []} />
    </div>
  );
}
