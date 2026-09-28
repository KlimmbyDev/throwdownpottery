-- Let the studio edit potter profiles and add/archive potters from the app.
--
-- Scoped to the shared studio account by email rather than to every
-- authenticated user, so a stray account created through the public anon key
-- (if email signups are ever enabled) cannot rewrite potter profiles.
--
-- No delete policy: potters are archived (archived_at), never deleted, because
-- deletes cascade to every piece and image they own.

create policy "potters_insert_studio" on public.potters
  for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'potter@throwdownpottery.com');

create policy "potters_update_studio" on public.potters
  for update to authenticated
  using ((auth.jwt() ->> 'email') = 'potter@throwdownpottery.com')
  with check ((auth.jwt() ->> 'email') = 'potter@throwdownpottery.com');
