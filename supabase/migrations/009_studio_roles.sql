-- Per-person studio logins with roles, replacing the shared studio account.
--
--   admin  - sees and edits everything, manages users and artists
--   artist - edits only their own artist profile and pieces
--
-- Membership rows are written only server-side with the service role (the
-- studio's admin actions), never by the browser, so nobody can grant
-- themselves a role. Users without a row - including the old shared account -
-- have no write access at all.
--
-- One transaction: if anything fails, including the Sarah check at the end,
-- nothing changes.

begin;

create table public.studio_members (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  role                 text not null check (role in ('admin', 'artist')),
  potter_id            uuid unique references public.potters(id) on delete set null,
  must_change_password boolean not null default true,
  disabled_at          timestamptz,
  created_at           timestamptz not null default now()
);

alter table public.studio_members enable row level security;
revoke all on public.studio_members from anon;
revoke insert, update, delete on public.studio_members from authenticated;

-- Security definer so policies can consult studio_members without tripping
-- over its own RLS. Each only ever describes the calling user.
create function public.is_studio_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.studio_members
    where user_id = auth.uid() and role = 'admin' and disabled_at is null
  );
$$;

create function public.is_studio_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.studio_members
    where user_id = auth.uid() and disabled_at is null
  );
$$;

create function public.my_potter_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select potter_id from public.studio_members
  where user_id = auth.uid() and disabled_at is null;
$$;

create policy "studio_members_select" on public.studio_members
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_studio_admin()));

-- Potters: artists edit their own profile fields only. Adding, archiving and
-- renaming slugs go through the admin actions, so the browser may only touch
-- these columns - an artist can't un-archive themselves or change their URL.
drop policy if exists "potters_insert_studio" on public.potters;
drop policy if exists "potters_update_studio" on public.potters;

revoke insert, update, delete on public.potters from authenticated;
grant update (name, specialty, bio, avatar_url, instagram_url) on public.potters to authenticated;

create policy "potters_update_own" on public.potters
  for update to authenticated
  using ((select public.is_studio_admin()) or id = (select public.my_potter_id()))
  with check ((select public.is_studio_admin()) or id = (select public.my_potter_id()));

-- Pieces: admins everything, artists their own. The update check also stops a
-- piece being moved onto another artist.
drop policy if exists "pieces_insert" on public.pieces;
drop policy if exists "pieces_update" on public.pieces;
drop policy if exists "pieces_delete" on public.pieces;

create policy "pieces_insert" on public.pieces
  for insert to authenticated
  with check ((select public.is_studio_admin()) or potter_id = (select public.my_potter_id()));

create policy "pieces_update" on public.pieces
  for update to authenticated
  using ((select public.is_studio_admin()) or potter_id = (select public.my_potter_id()))
  with check ((select public.is_studio_admin()) or potter_id = (select public.my_potter_id()));

create policy "pieces_delete" on public.pieces
  for delete to authenticated
  using ((select public.is_studio_admin()) or potter_id = (select public.my_potter_id()));

drop policy if exists "piece_images_insert" on public.piece_images;
drop policy if exists "piece_images_delete" on public.piece_images;

create policy "piece_images_insert" on public.piece_images
  for insert to authenticated
  with check (
    piece_id in (
      select id from public.pieces
      where (select public.is_studio_admin()) or potter_id = (select public.my_potter_id())
    )
  );

create policy "piece_images_delete" on public.piece_images
  for delete to authenticated
  using (
    piece_id in (
      select id from public.pieces
      where (select public.is_studio_admin()) or potter_id = (select public.my_potter_id())
    )
  );

-- Photo files: any active member may upload; deleting is limited to admins
-- and whoever uploaded the file.
drop policy if exists "pottery_images_insert" on storage.objects;
drop policy if exists "pottery_images_delete" on storage.objects;

create policy "pottery_images_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pottery-images' and (select public.is_studio_member()));

create policy "pottery_images_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'pottery-images'
    and ((select public.is_studio_admin()) or owner_id = (select auth.uid())::text)
  );

-- Make Sarah the first super admin, linked to her artist profile. Her login
-- must already exist (Authentication > Users > Add user). She picks her own
-- password on first sign-in.
do $$
begin
  insert into public.studio_members (user_id, role, potter_id, must_change_password)
  select u.id, 'admin', (select id from public.potters where slug = 'sarah'), true
  from auth.users u
  where lower(u.email) = lower('Sarahmahbusiness@gmail.com');

  if not found then
    raise exception 'No login found for Sarah yet. Create it under Authentication > Users first, then run this again.';
  end if;
end $$;

commit;
