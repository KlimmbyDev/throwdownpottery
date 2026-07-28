-- Soft-archive support for potters and pieces.
--
-- Archiving sets archived_at instead of deleting. Nothing is removed: the rows
-- stay in the database and are restored by setting archived_at back to null.
-- This matters because pieces.potter_id and piece_images.piece_id both cascade
-- on delete, so deleting a potter would also destroy every piece and image row
-- belonging to them, with no way back.
--
-- Visibility is enforced in RLS rather than in application queries, because the
-- anon key is public (NEXT_PUBLIC_) and anyone holding it can query PostgREST
-- directly. Filtering only in src/app/ would hide archived rows from the site
-- while leaving them readable over the API.

alter table public.potters add column if not exists archived_at timestamptz;
alter table public.pieces  add column if not exists archived_at timestamptz;

create index if not exists potters_archived_at_idx on public.potters (archived_at);
create index if not exists pieces_archived_at_idx  on public.pieces  (archived_at);

-- The original policies from 001 had no `to` clause, so they applied to every
-- role. Replace them with role-specific pairs: anon sees only live rows, the
-- authenticated studio still sees everything so archived work can be restored.
drop policy if exists "potters_select"      on public.potters;
drop policy if exists "pieces_select"       on public.pieces;
drop policy if exists "piece_images_select" on public.piece_images;

create policy "potters_select_public" on public.potters
  for select to anon using (archived_at is null);

create policy "potters_select_studio" on public.potters
  for select to authenticated using (true);

-- A piece is public only if it is live AND its potter is live, so archiving a
-- potter hides their whole body of work without touching the piece rows.
create policy "pieces_select_public" on public.pieces
  for select to anon using (
    archived_at is null
    and potter_id in (select id from public.potters where archived_at is null)
  );

create policy "pieces_select_studio" on public.pieces
  for select to authenticated using (true);

create policy "piece_images_select_public" on public.piece_images
  for select to anon using (
    piece_id in (
      select p.id
      from public.pieces p
      join public.potters pot on pot.id = p.potter_id
      where p.archived_at is null and pot.archived_at is null
    )
  );

create policy "piece_images_select_studio" on public.piece_images
  for select to authenticated using (true);

-- Archive Emily. Her pieces and images are hidden by the policies above via the
-- potter join; their own rows are left untouched, so restoring her restores the
-- exact state she was in.
update public.potters set archived_at = now() where slug = 'emily';
