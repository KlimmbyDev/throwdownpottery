-- Headline for the homepage news: shown in the slim bar under the menu.
-- The text and photo below it are optional ("Read more").
alter table public.site_news
  add column title text check (char_length(title) <= 120);
