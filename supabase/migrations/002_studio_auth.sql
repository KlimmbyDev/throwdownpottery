-- Link potters to Supabase auth users
alter table public.potters
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Potters can insert/update/delete their own pieces
create policy "pieces_insert" on public.pieces
  for insert to authenticated with check (
    potter_id in (select id from public.potters where user_id = auth.uid())
  );

create policy "pieces_update" on public.pieces
  for update to authenticated using (
    potter_id in (select id from public.potters where user_id = auth.uid())
  );

create policy "pieces_delete" on public.pieces
  for delete to authenticated using (
    potter_id in (select id from public.potters where user_id = auth.uid())
  );

-- Potters can manage images for their own pieces
create policy "piece_images_insert" on public.piece_images
  for insert to authenticated with check (
    piece_id in (
      select p.id from public.pieces p
      join public.potters pot on p.potter_id = pot.id
      where pot.user_id = auth.uid()
    )
  );

create policy "piece_images_delete" on public.piece_images
  for delete to authenticated using (
    piece_id in (
      select p.id from public.pieces p
      join public.potters pot on p.potter_id = pot.id
      where pot.user_id = auth.uid()
    )
  );

-- Storage: potters can upload and delete images
create policy "pottery_images_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'pottery-images');

create policy "pottery_images_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'pottery-images');
