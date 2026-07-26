-- =====================================================================
-- Flowers Everywhere — Supabase schema (run once)
-- Dashboard → SQL Editor → New query → paste all of this → Run.
-- Safe to re-run: everything is idempotent (if-not-exists / on-conflict).
-- =====================================================================

-- 1. Categories -------------------------------------------------------
create table if not exists public.categories (
  key     text primary key,
  name    text not null,
  palette text not null default 'blush',
  blurb   text not null default '',
  sort    int  not null default 0
);

-- 2. Products ---------------------------------------------------------
create table if not exists public.products (
  id           text primary key,
  name         text not null,
  category     text references public.categories(key) on delete set null,
  price        numeric not null default 0,
  old_price    numeric,
  color        text not null default '',
  stock        text not null default 'in',         -- 'in' | 'out'
  status       text not null default 'published',   -- 'published' | 'draft'
  short        text not null default '',
  long         text not null default '',
  alt          text not null default '',
  images       text[] not null default '{}',        -- public image URLs
  is_new       boolean not null default false,
  is_best      boolean not null default false,
  is_trending  boolean not null default false,
  featured     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_status_idx   on public.products (status);
create index if not exists products_created_idx  on public.products (created_at desc);

-- keep updated_at fresh on every edit
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- 3. Row-Level Security ----------------------------------------------
-- Public (the storefront, using the publishable key) may READ only.
-- Writes require a signed-in admin session.
alter table public.products   enable row level security;
alter table public.categories enable row level security;

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products
  for select using (true);

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories
  for select using (true);

drop policy if exists "admin write products" on public.products;
create policy "admin write products" on public.products
  for all to authenticated using (true) with check (true);

drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories
  for all to authenticated using (true) with check (true);

-- 4. Storage bucket for product images -------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public read images" on storage.objects;
create policy "public read images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "admin write images" on storage.objects;
create policy "admin write images" on storage.objects
  for all to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

-- 5. Seed the categories ---------------------------------------------
insert into public.categories (key, name, palette, blurb, sort) values
  ('roses',        'Roses',                'blush',      'Timeless silk & real-touch roses',   1),
  ('peonies',      'Peonies & Hydrangeas', 'blush',      'Lush, full-bloom statement flowers', 2),
  ('orchids',      'Orchids',              'lavender',   'Elegant cascading orchid stems',      3),
  ('tulips',       'Tulips & Lilies',      'gold',       'Graceful spring-inspired stems',      4),
  ('bouquets',     'Signature Bouquets',   'terracotta', 'Ready-arranged designer bouquets',    5),
  ('greenery',     'Greenery & Foliage',   'sage',       'Lifelike botanicals & leaves',        6),
  ('vases',        'Vases & Pots',         'cream',      'Ceramic, glass & metal vessels',      7),
  ('centerpieces', 'Centerpieces',         'terracotta', 'Show-stopping table arrangements',    8),
  ('wreaths',      'Wreaths & Garlands',   'sage',       'Seasonal door & mantel décor',        9),
  ('gifts',        'Gift Sets',            'gold',       'Curated gifting collections',        10)
on conflict (key) do nothing;
