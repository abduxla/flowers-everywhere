-- =====================================================================
-- Flowers Everywhere — homepage "Curated Collections" cards.
-- Dashboard → SQL Editor → paste all → Run. Safe to re-run.
--
-- These are the three big cards in the Curated Collections strip on the
-- home page. Moving them into the database is what lets the shop edit
-- their photo and wording from Admin → Homepage Edits; until this runs
-- the storefront just keeps showing the bundled defaults.
-- =====================================================================

create table if not exists public.collections (
  key     text primary key,
  name    text not null default '',
  blurb   text not null default '',
  image   text not null default '',
  palette text not null default 'cream',
  sort    int  not null default 0
);

alter table public.collections enable row level security;

-- Public storefront reads them; only an allow-listed admin can change them
-- (same is_admin() gate used by products/categories/projects).
drop policy if exists "collections public read" on public.collections;
create policy "collections public read" on public.collections
  for select using (true);

drop policy if exists "collections admin write" on public.collections;
create policy "collections admin write" on public.collections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Seed the three cards that currently ship in data.js. `do nothing` keeps
-- any wording/photo the shop has already set if this is re-run.
insert into public.collections (key, name, blurb, palette, sort) values
  ('wedding',  'The Wedding Edit',   'Timeless whites, ivories & blush for the big day', 'cream',      1),
  ('everyday', 'Everyday Elegance',  'Effortless blooms for the console, desk & kitchen', 'sage',      2),
  ('seasonal', 'Seasonal Warmth',    'Terracotta, gold & autumnal tones for the season',  'terracotta', 3)
on conflict (key) do nothing;
