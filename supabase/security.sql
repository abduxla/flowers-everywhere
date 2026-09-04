-- =====================================================================
-- Flowers Everywhere — SECURITY HARDENING  (run once, AFTER schema.sql
-- and projects.sql). Dashboard → SQL Editor → paste all → Run.
-- Idempotent / safe to re-run.
--
-- What this fixes:
--   1. Writes to products/categories/projects/images were allowed to ANY
--      authenticated user. Now only users in public.admins may write.
--   2. The orders table was world-readable via the public key (customer
--      name/address/phone could be dumped). Reads are now via a function
--      that only returns ONE order by its exact code — the table itself is
--      no longer selectable through the public API.
--
-- ⚠️ AFTER running this you MUST add your admin user to public.admins
--    (step 6) or you will not be able to edit the store.
-- ⚠️ ALSO: Dashboard → Authentication → Providers/Sign In → turn OFF
--    "Allow new users to sign up" (public sign-ups). Only you create admins.
-- =====================================================================

-- 0. Make sure the orders table exists (created earlier out-of-band) --------
create table if not exists public.orders (
  id         text primary key,
  data       jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.orders   enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;

-- 1. Admin allowlist --------------------------------------------------------
create table if not exists public.admins (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  email    text,
  added_at timestamptz not null default now()
);
alter table public.admins enable row level security;   -- no policies ⇒ not reachable via public API

create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
    select exists (select 1 from public.admins a where a.user_id = auth.uid());
  $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 2. Products / categories: public READ, admin-only WRITE -------------------
drop policy if exists "admin write products" on public.products;
create policy "admin write products" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 3. Projects: public READ, admin-only WRITE -------------------------------
drop policy if exists "projects_admin_write" on public.projects;
create policy "projects_admin_write" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 4. Storage images: admin-only WRITE --------------------------------------
drop policy if exists "admin write images" on storage.objects;
create policy "admin write images" on storage.objects
  for all to authenticated
  using  (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- 5. Orders: customers may CREATE; NOBODY may list. Read one by its code ----
--    through a function (can't be enumerated — you must know the code).
drop policy if exists "orders_public_select" on public.orders;
drop policy if exists "orders_public_insert" on public.orders;
drop policy if exists "orders_insert_anon"  on public.orders;
create policy "orders_insert_anon" on public.orders
  for insert to anon, authenticated
  with check (char_length(id) between 6 and 24 and pg_column_size(data) < 20000);
-- (deliberately NO select policy ⇒ the table is not readable via the API)

create or replace function public.get_order(p_id text) returns jsonb
  language sql stable security definer set search_path = public as $$
    select data from public.orders where id = p_id;
  $$;
revoke all on function public.get_order(text) from public;
grant execute on function public.get_order(text) to anon, authenticated;

-- 6. >>> ADD YOUR ADMIN USER (required) <<<
--    Find the id in Dashboard → Authentication → Users (the admin account),
--    then run (uncomment + paste the UUID):
--
-- insert into public.admins (user_id, email)
--   values ('00000000-0000-0000-0000-000000000000', 'admin@flowerseverywhere.com')
--   on conflict (user_id) do nothing;
