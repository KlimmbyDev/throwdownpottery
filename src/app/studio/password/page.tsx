import { requireMember } from "@/lib/studio-auth";
import PasswordForm from "@/components/studio/password-form";

export default async function PasswordPage() {
  const member = await requireMember({ allowPasswordChange: true });

  return (
    <div className="max-w-sm">
      <h1 className="font-serif text-2xl text-stone">
        {member.mustChangePassword ? "Choose your password" : "Change password"}
      </h1>
      <p className="text-sm text-stone/50 mt-1 mb-8">
        {member.mustChangePassword
          ? "You signed in with a temporary password. Pick your own to continue."
          : "At least 8 characters."}
      </p>
      <PasswordForm />
    </div>
  );
}
