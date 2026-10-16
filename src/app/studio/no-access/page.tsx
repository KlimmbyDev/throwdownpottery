import { redirect } from "next/navigation";
import SignOutButton from "@/components/studio/sign-out-button";
import { getStudioSession } from "@/lib/studio-auth";

export default async function NoAccessPage() {
  const { user, member } = await getStudioSession();
  if (!user) redirect("/studio/login");
  if (member) redirect("/studio");

  return (
    <div className="py-24 text-center max-w-md mx-auto">
      <h1 className="font-serif text-2xl text-stone mb-3">No studio access</h1>
      <p className="text-sm text-stone/60 mb-8">
        This login isn&apos;t set up for the studio, or it has been archived. Ask Sarah if you
        think this is a mistake.
      </p>
      <SignOutButton />
    </div>
  );
}
