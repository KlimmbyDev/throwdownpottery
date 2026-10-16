import { requireAdmin } from "@/lib/studio-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import UsersManager, { type StudioUserRow } from "@/components/studio/users-manager";

export default async function UsersPage() {
  const me = await requireAdmin();

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return (
      <p className="text-sm text-red-500">
        User management isn&apos;t configured yet: the SUPABASE_SERVICE_ROLE_KEY setting is missing.
      </p>
    );
  }

  const [{ data: list, error }, { data: members }, { data: potters }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin
      .from("studio_members")
      .select("user_id, role, potter_id, must_change_password, disabled_at"),
    admin.from("potters").select("id, name, archived_at").order("name"),
  ]);

  if (error) {
    return <p className="text-sm text-red-500">Couldn&apos;t load users. Please refresh.</p>;
  }

  const memberById = new Map((members ?? []).map((m) => [m.user_id, m]));
  const potterName = new Map((potters ?? []).map((p) => [p.id, p.name]));
  const linkedPotters = new Set((members ?? []).map((m) => m.potter_id).filter(Boolean));

  const rows: StudioUserRow[] = list.users
    .map((u) => {
      const m = memberById.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "",
        role: m?.role ?? null,
        artistName: m?.potter_id ? potterName.get(m.potter_id) ?? null : null,
        status: !m ? "no-access" : m.disabled_at ? "archived" : "active",
        mustChangePassword: m?.must_change_password ?? false,
        isMe: u.id === me.userId,
      } satisfies StudioUserRow;
    })
    .sort((a, b) => a.email.localeCompare(b.email));

  const availableArtists = (potters ?? [])
    .filter((p) => !p.archived_at && !linkedPotters.has(p.id))
    .map((p) => ({ id: p.id, name: p.name }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-stone">Users</h1>
        <p className="text-sm text-stone/50 mt-1">
          Super admins manage everything. Artists can only change their own profile and pieces.
        </p>
      </div>
      <UsersManager rows={rows} availableArtists={availableArtists} />
    </div>
  );
}
