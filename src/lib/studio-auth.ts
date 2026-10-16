import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type StudioRole = "admin" | "artist";

export type StudioMember = {
  userId: string;
  email: string;
  role: StudioRole;
  potterId: string | null;
  mustChangePassword: boolean;
};

// Cached per request: the layout and the page both ask.
export const getStudioSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, member: null };

  const { data } = await supabase
    .from("studio_members")
    .select("role, potter_id, must_change_password, disabled_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const member: StudioMember | null =
    data && !data.disabled_at
      ? {
          userId: user.id,
          email: user.email ?? "",
          role: data.role,
          potterId: data.potter_id,
          mustChangePassword: data.must_change_password,
        }
      : null;

  return { user, member };
});

export async function requireMember({ allowPasswordChange = false } = {}) {
  const { user, member } = await getStudioSession();
  if (!user) redirect("/studio/login");
  if (!member) redirect("/studio/no-access");
  if (member.mustChangePassword && !allowPasswordChange) redirect("/studio/password");
  return member;
}

export async function requireAdmin() {
  const member = await requireMember();
  if (member.role !== "admin") redirect("/studio");
  return member;
}

export function canManagePotter(member: StudioMember, potterId: string) {
  return member.role === "admin" || member.potterId === potterId;
}
