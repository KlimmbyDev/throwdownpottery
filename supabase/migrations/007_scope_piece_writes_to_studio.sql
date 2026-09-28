-- Scope piece, image and photo-upload writes to the shared studio account,
-- matching the potter policies in 006. Until now any authenticated user could
-- write here, so the only protection was email sign-ups being disabled.
-- Read policies are unchanged.
--
-- Wrapped in a transaction so a failure part-way through can't leave a table
-- with its policy dropped and not recreated.

begin;

drop policy if exists "pieces_insert" on public.pieces;
drop policy if exists "pieces_update" on public.pieces;
drop policy if exists "pieces_delete" on public.pieces;

create policy "pieces_insert" on public.pieces
  for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'potter@throwdownpottery.com');

create policy "pieces_update" on public.pieces
  for update to authenticated
  using ((auth.jwt() ->> 'email') = 'potter@throwdownpottery.com')
  with check ((auth.jwt() ->> 'email') = 'potter@throwdownpottery.com');

create policy "pieces_delete" on public.pieces
  for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'potter@throwdownpottery.com');

drop policy if exists "piece_images_insert" on public.piece_images;
drop policy if exists "piece_images_delete" on public.piece_images;

create policy "piece_images_insert" on public.piece_images
  for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'potter@throwdownpottery.com');

create policy "piece_images_delete" on public.piece_images
  for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'potter@throwdownpottery.com');

drop policy if exists "pottery_images_insert" on storage.objects;
drop policy if exists "pottery_images_delete" on storage.objects;

create policy "pottery_images_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pottery-images'
    and (auth.jwt() ->> 'email') = 'potter@throwdownpottery.com'
  );

create policy "pottery_images_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'pottery-images'
    and (auth.jwt() ->> 'email') = 'potter@throwdownpottery.com'
  );

commit;
