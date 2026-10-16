"use server";

import { getStudioSession, type StudioRole } from "@/lib/studio-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/slug";

// Server functions can be called directly over HTTP, not only from the studio
// UI, so every one re-checks the caller before doing anything.

type Result = { error?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const FOREVER = "876000h";
const MISSING_KEY =
  "The studio isn't fully set up yet: the server's admin key (SUPABASE_SERVICE_ROLE_KEY) is missing. Ask Luka to add it in Vercel.";

async function requireAdminAction() {
  const { member } = await getStudioSession();
  if (!member || member.role !== "admin" || member.mustChangePassword) {
    throw new Error("Not allowed");
  }
  return { me: member, admin: createAdminClient() };
}

function assertId(id: string) {
  if (!UUID.test(id)) throw new Error("Invalid id");
}

type Admin = ReturnType<typeof createAdminClient>;

async function activeAdminCount(admin: Admin) {
  const { count } = await admin
    .from("studio_members")
    .select("user_id", { count: "exact", head: true })
    .eq("role", "admin")
    .is("disabled_at", null);
  return count ?? 0;
}

async function memberRow(admin: Admin, userId: string) {
  const { data } = await admin
    .from("studio_members")
    .select("role, potter_id, disabled_at")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

// Refuses changes that would leave the studio without an active super admin,
// or lock the current admin out of their own account.
async function guardAdminRemoval(admin: Admin, meId: string, userId: string): Promise<string | null> {
  if (userId === meId) return "You can't do this to your own account.";
  const row = await memberRow(admin, userId);
  if (row?.role === "admin" && !row.disabled_at && (await activeAdminCount(admin)) <= 1) {
    return "This is the last active super admin. Make someone else a super admin first.";
  }
  return null;
}

// --- Any signed-in member --------------------------------------------------

export async function changeOwnPassword(password: string): Promise<Result> {
  const { member } = await getStudioSession();
  if (!member) return { error: "Your session has expired. Please sign in again." };
  if (password.length < MIN_PASSWORD) {
    return { error: `Use at least ${MIN_PASSWORD} characters.` };
  }

  // Needed afterwards to clear must_change_password; checked first so a
  // missing key can't leave the password changed but the flag still set.
  let admin: Admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: MISSING_KEY };
  }

  // Through the user's own session rather than the admin API, so Supabase
  // rejects reusing the current (temporary) password and weak passwords.
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    switch (error.code) {
      case "same_password":
        return { error: "Choose a password that's different from your current one." };
      case "weak_password":
        return { error: "That password is too easy to guess. Try a longer one." };
      case "reauthentication_needed":
        return { error: "For security, sign out, sign back in, then change your password." };
      default:
        return { error: "Couldn't change your password. Please try again." };
    }
  }

  const { error: flagError } = await admin
    .from("studio_members")
    .update({ must_change_password: false })
    .eq("user_id", member.userId);
  if (flagError) {
    return { error: "Your password was changed, but the studio couldn't record it. Please try again." };
  }
  return {};
}

// --- Users (admin only) ----------------------------------------------------

export type NewUserArtist =
  | { kind: "existing"; potterId: string }
  | { kind: "new"; name: string }
  | { kind: "none" };

export async function createStudioUser(input: {
  email: string;
  password: string;
  role: StudioRole;
  artist: NewUserArtist;
}): Promise<Result> {
  const { admin } = await requireAdminAction();
  const email = input.email.trim();

  if (!EMAIL.test(email)) return { error: "Please enter a valid email address." };
  if (input.password.length < MIN_PASSWORD) {
    return { error: `The temporary password needs at least ${MIN_PASSWORD} characters.` };
  }
  if (input.role !== "admin" && input.role !== "artist") throw new Error("Invalid role");

  let potterId: string | null = null;
  let createdPotterId: string | null = null;

  if (input.artist.kind === "existing") {
    assertId(input.artist.potterId);
    const { data: linked } = await admin
      .from("studio_members")
      .select("user_id")
      .eq("potter_id", input.artist.potterId)
      .maybeSingle();
    if (linked) return { error: "That artist profile already has a login." };
    potterId = input.artist.potterId;
  } else if (input.artist.kind === "new") {
    const name = input.artist.name.trim();
    const slug = toSlug(name);
    if (!slug) return { error: "Please enter the new artist's name." };
    const { data, error } = await admin.from("potters").insert({ name, slug }).select("id").single();
    if (error) {
      return {
        error:
          error.code === "23505"
            ? "An artist with that name already exists. Pick them from the list instead."
            : "Couldn't create the artist profile.",
      };
    }
    potterId = createdPotterId = data.id;
  }

  const { data: created, error: userError } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
  });
  if (userError || !created.user) {
    if (createdPotterId) await admin.from("potters").delete().eq("id", createdPotterId);
    return { error: userError?.message ?? "Couldn't create the login." };
  }

  const { error: memberError } = await admin.from("studio_members").insert({
    user_id: created.user.id,
    role: input.role,
    potter_id: potterId,
    must_change_password: true,
  });
  if (memberError) {
    await admin.auth.admin.deleteUser(created.user.id);
    if (createdPotterId) await admin.from("potters").delete().eq("id", createdPotterId);
    return { error: "Couldn't set up the account. Nothing was saved." };
  }

  return {};
}

export async function setUserRole(userId: string, role: StudioRole): Promise<Result> {
  const { admin } = await requireAdminAction();
  assertId(userId);
  if (role !== "admin" && role !== "artist") throw new Error("Invalid role");

  const row = await memberRow(admin, userId);
  if (!row) return { error: "This login has no studio access to change." };
  if (row.role === "admin" && role === "artist" && !row.disabled_at && (await activeAdminCount(admin)) <= 1) {
    return { error: "This is the last active super admin. Make someone else a super admin first." };
  }

  const { error } = await admin.from("studio_members").update({ role }).eq("user_id", userId);
  return error ? { error: "Couldn't change the role." } : {};
}

export async function resetUserPassword(userId: string, password: string): Promise<Result> {
  const { admin } = await requireAdminAction();
  assertId(userId);
  if (password.length < MIN_PASSWORD) {
    return { error: `The temporary password needs at least ${MIN_PASSWORD} characters.` };
  }
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) return { error: "Couldn't reset the password." };
  await admin.from("studio_members").update({ must_change_password: true }).eq("user_id", userId);
  return {};
}

export async function setUserArchived(userId: string, archived: boolean): Promise<Result> {
  const { me, admin } = await requireAdminAction();
  assertId(userId);

  if (archived) {
    const blocked = await guardAdminRemoval(admin, me.userId, userId);
    if (blocked) return { error: blocked };
  }

  const row = await memberRow(admin, userId);
  if (!row) return { error: "This login has no studio access. Use Remove instead." };

  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: archived ? FOREVER : "none",
  });
  if (banError) return { error: "Couldn't update the login." };

  const now = archived ? new Date().toISOString() : null;
  await admin.from("studio_members").update({ disabled_at: now }).eq("user_id", userId);
  if (row.potter_id) {
    await admin.from("potters").update({ archived_at: now }).eq("id", row.potter_id);
  }
  return {};
}

const PUBLIC_PREFIX = "/storage/v1/object/public/pottery-images/";

function storagePath(url: string | null) {
  if (!url) return null;
  const at = url.indexOf(PUBLIC_PREFIX);
  return at === -1 ? null : decodeURIComponent(url.slice(at + PUBLIC_PREFIX.length));
}

export async function removeStudioUser(
  userId: string,
  mode: "keep-work" | "delete-everything"
): Promise<Result> {
  const { me, admin } = await requireAdminAction();
  assertId(userId);
  if (mode !== "keep-work" && mode !== "delete-everything") throw new Error("Invalid mode");

  const blocked = await guardAdminRemoval(admin, me.userId, userId);
  if (blocked) return { error: blocked };

  const row = await memberRow(admin, userId);
  const potterId = row?.potter_id ?? null;

  if (potterId && mode === "keep-work") {
    await admin.from("potters").update({ archived_at: new Date().toISOString() }).eq("id", potterId);
  }

  if (potterId && mode === "delete-everything") {
    const [{ data: potter }, { data: images }] = await Promise.all([
      admin.from("potters").select("avatar_url").eq("id", potterId).single(),
      admin.from("piece_images").select("url, piece:pieces!inner(potter_id)").eq("piece.potter_id", potterId),
    ]);
    const paths = [potter?.avatar_url ?? null, ...(images ?? []).map((i) => i.url)]
      .map(storagePath)
      .filter((p): p is string => !!p);
    if (paths.length) {
      const { error: storageError } = await admin.storage.from("pottery-images").remove(paths);
      if (storageError) return { error: "Couldn't delete their photos. Nothing else was removed." };
    }
    // Cascades to their pieces and piece_images rows.
    const { error: potterError } = await admin.from("potters").delete().eq("id", potterId);
    if (potterError) return { error: "Their photos were deleted but the profile couldn't be. Try again." };
  }

  // Cascades to their studio_members row.
  const { error } = await admin.auth.admin.deleteUser(userId);
  return error ? { error: "Couldn't remove the login. Try again." } : {};
}

// --- Artists (admin only) --------------------------------------------------

export async function addArtist(name: string): Promise<Result> {
  const { admin } = await requireAdminAction();
  const trimmed = name.trim();
  const slug = toSlug(trimmed);
  if (!slug) return { error: "Please enter a name." };
  const { error } = await admin.from("potters").insert({ name: trimmed, slug });
  if (!error) return {};
  return {
    error:
      error.code === "23505"
        ? "An artist with that name already exists. If they're archived, restore them below."
        : "Couldn't add the artist. Please try again.",
  };
}

export async function setArtistArchived(potterId: string, archived: boolean): Promise<Result> {
  const { admin } = await requireAdminAction();
  assertId(potterId);
  const { error } = await admin
    .from("potters")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", potterId);
  return error ? { error: "Couldn't update that artist. Please try again." } : {};
}
