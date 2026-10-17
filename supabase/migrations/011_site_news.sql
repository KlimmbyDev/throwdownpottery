-- One news post for the homepage, written by super admins.
-- A single row (id = 1); published_at null means hidden. Visitors can only
-- read it while it's published, so drafts never leave the studio.

begin;

create table public.site_news (
  id           smallint primary key default 1 check (id = 1),
  body         text check (char_length(body) <= 1000),
  published_at timestamptz,
  updated_at   timestamptz not null default now()
);

alter table public.site_news enable row level security;
revoke insert, update, delete on public.site_news from anon;
revoke insert, delete on public.site_news from authenticated;

create policy "site_news_select_public" on public.site_news
  for select to anon
  using (published_at is not null);

create policy "site_news_select_studio" on public.site_news
  for select to authenticated
  using (published_at is not null or (select public.is_studio_admin()));

create policy "site_news_update_admin" on public.site_news
  for update to authenticated
  using ((select public.is_studio_admin()))
  with check ((select public.is_studio_admin()));

insert into public.site_news (id) values (1);

commit;
