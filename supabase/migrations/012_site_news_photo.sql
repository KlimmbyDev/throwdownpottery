-- Optional photo for the homepage news. Like the other photo columns, it may
-- only point at the site's own photo storage.
alter table public.site_news
  add column image_url text check (
    image_url is null
    or image_url like 'https://rvmizfbwvktytmnpnbgi.supabase.co/storage/v1/object/public/pottery-images/%'
  );
