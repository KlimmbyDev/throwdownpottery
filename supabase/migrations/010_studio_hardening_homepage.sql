-- Tighter reads for signed-in users, one homepage piece per artist, and
-- stricter uploads. One transaction: if anything fails, nothing changes.

begin;

-- 1. Reads. Signed-in users used to be able to read everything, archived
-- included. Now they see what the public sees, plus their own archived work;
-- super admins still see everything. (Signed-in artists browse the public site
-- under these policies, so live content must stay readable.)
drop policy if exists "potters_select_studio" on public.potters;
create policy "potters_select_studio" on public.potters
  for select to authenticated
  using (
    archived_at is null
    or (select public.is_studio_admin())
    or id = (select public.my_potter_id())
  );

drop policy if exists "pieces_select_studio" on public.pieces;
create policy "pieces_select_studio" on public.pieces
  for select to authenticated
  using (
    (archived_at is null and potter_id in (select id from public.potters where archived_at is null))
    or (select public.is_studio_admin())
    or potter_id = (select public.my_potter_id())
  );

-- An image is readable exactly when its piece is (the subquery applies the
-- pieces policy above).
drop policy if exists "piece_images_select_studio" on public.piece_images;
create policy "piece_images_select_studio" on public.piece_images
  for select to authenticated
  using (piece_id in (select id from public.pieces));

-- 2. One homepage piece per artist. Keep each artist's newest featured piece
-- and clear the rest, then enforce it. Featuring a new piece automatically
-- un-features the artist's previous one.
update public.pieces p
set featured = false
where p.featured
  and p.id <> (
    select newest.id from public.pieces newest
    where newest.potter_id = p.potter_id and newest.featured
    order by newest.created_at desc
    limit 1
  );

create unique index pieces_one_featured_per_artist
  on public.pieces (potter_id) where featured;

create function public.pieces_single_featured() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.featured then
    update public.pieces
    set featured = false
    where potter_id = new.potter_id and id <> new.id and featured;
  end if;
  return new;
end;
$$;

create trigger pieces_single_featured
  before insert or update of featured on public.pieces
  for each row execute function public.pieces_single_featured();

-- 3. Uploads: photos only, at most 10 MB.
update storage.buckets
set allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'image/avif', 'image/heic', 'image/heif'
    ],
    file_size_limit = 10485760
where id = 'pottery-images';

-- 4. Photo and Instagram links must point where the studio puts them, so no
-- outside images or links can be inserted. NOT VALID: applies to new and
-- edited rows without re-checking existing ones.
alter table public.potters
  add constraint potters_avatar_url_storage check (
    avatar_url is null
    or avatar_url like 'https://rvmizfbwvktytmnpnbgi.supabase.co/storage/v1/object/public/pottery-images/%'
  ) not valid;

alter table public.piece_images
  add constraint piece_images_url_storage check (
    url like 'https://rvmizfbwvktytmnpnbgi.supabase.co/storage/v1/object/public/pottery-images/%'
  ) not valid;

alter table public.potters
  add constraint potters_instagram_url_format check (
    instagram_url is null
    or instagram_url ~ '^https://www\.instagram\.com/[A-Za-z0-9._]{1,30}/$'
  ) not valid;

commit;
