-- Drop per-user policies from migration 002
drop policy if exists "pieces_insert" on public.pieces;
drop policy if exists "pieces_update" on public.pieces;
drop policy if exists "pieces_delete" on public.pieces;
drop policy if exists "piece_images_insert" on public.piece_images;
drop policy if exists "piece_images_delete" on public.piece_images;

-- Simpler: any authenticated user (shared login) can manage pieces
create policy "pieces_insert" on public.pieces
  for insert to authenticated with check (true);

create policy "pieces_update" on public.pieces
  for update to authenticated using (true);

create policy "pieces_delete" on public.pieces
  for delete to authenticated using (true);

create policy "piece_images_insert" on public.piece_images
  for insert to authenticated with check (true);

create policy "piece_images_delete" on public.piece_images
  for delete to authenticated using (true);
