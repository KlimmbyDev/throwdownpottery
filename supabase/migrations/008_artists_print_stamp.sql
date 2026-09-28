-- Beverly makes stamps and prints, so the site now talks about artists rather
-- than potters (wording and URLs only; the table stays `potters`).

-- New piece categories. Postgres won't let a newly added enum value be used in
-- the same transaction, so pieces are recategorised afterwards from the studio.
alter type public.piece_category add value if not exists 'print' before 'other';
alter type public.piece_category add value if not exists 'stamp' before 'other';

-- "Pottery stamp by Beverly" was filed under Sarah.
update public.pieces
set potter_id = (select id from public.potters where slug = 'beverly')
where id = 'f302805b-23a1-48e9-9865-0b49251eb1ed';

-- Andrea is a former artist whose work was filed under Sarah. Give her her own
-- archived artist row and move her pieces there: archiving hides them from the
-- site without deleting anything, and restoring Andrea brings them back.
-- The upsert also covers an Andrea row that already exists but is archived
-- (archived rows aren't visible through the public API, so that can't be ruled
-- out beforehand).
insert into public.potters (name, slug, archived_at)
values ('Andrea', 'andrea', now())
on conflict (slug) do update set archived_at = coalesce(public.potters.archived_at, now());

update public.pieces
set potter_id = (select id from public.potters where slug = 'andrea')
where id in (
  '9e596178-70fd-46b8-8d53-4a5880175455', -- Coffee Cups by Andrea
  '19c1464c-712f-475e-9525-5d641f873ac3', -- Rake Vases by Andrea
  '30d86f45-12a3-43bc-ae40-2334469a1721', -- Breakfast Set by Andrea
  '1ddb9669-6e20-4cda-933b-1db941ba7025'  -- Lamp by Andrea
);
