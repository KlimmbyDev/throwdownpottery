create type public.piece_category as enum (
  'bowl', 'mug', 'vase', 'plate', 'sculpture', 'cup', 'platter', 'other'
);

create table public.potters (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text unique not null,
  bio           text,
  specialty     text,
  avatar_url    text,
  instagram_url text,
  created_at    timestamptz not null default now()
);

create table public.pieces (
  id          uuid primary key default gen_random_uuid(),
  potter_id   uuid not null references public.potters(id) on delete cascade,
  title       text not null,
  description text,
  category    public.piece_category not null default 'other',
  price       numeric(10,2),
  dimensions  text,
  materials   text,
  available   boolean not null default true,
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table public.piece_images (
  id         uuid primary key default gen_random_uuid(),
  piece_id   uuid not null references public.pieces(id) on delete cascade,
  url        text not null,
  alt        text,
  position   int not null default 0,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.potters enable row level security;
alter table public.pieces enable row level security;
alter table public.piece_images enable row level security;

-- Public read for gallery (no auth required)
create policy "potters_select" on public.potters for select using (true);
create policy "pieces_select" on public.pieces for select using (true);
create policy "piece_images_select" on public.piece_images for select using (true);

-- Storage: run this in Supabase SQL editor after creating the bucket
-- insert into storage.buckets (id, name, public) values ('pottery-images', 'pottery-images', true);
-- create policy "pottery_images_select" on storage.objects for select using (bucket_id = 'pottery-images');
