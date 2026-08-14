-- =====================================================================
-- Projects (event & venue showcase)
-- Shown on /projects.html, managed in Admin → Projects.
-- Run once in Supabase → SQL Editor. Safe to re-run (idempotent).
-- =====================================================================

create table if not exists public.projects (
  id         bigint generated always as identity primary key,
  title      text not null,
  type       text not null default '',
  blurb      text not null default '',
  image      text not null default '',
  sort       int  not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Public can read; only the signed-in admin can add/edit/delete.
drop policy if exists "projects_public_select" on public.projects;
drop policy if exists "projects_admin_write"  on public.projects;
create policy "projects_public_select" on public.projects for select using (true);
create policy "projects_admin_write"  on public.projects for all to authenticated using (true) with check (true);

-- Starter projects (inserted only if the table is empty) with real stand-in
-- photos. Edit or replace them from Admin → Projects.
insert into public.projects (title, type, blurb, image, sort)
select v.title, v.type, v.blurb, v.image, v.sort
from (values
  ('Garden Wedding Arch','Wedding','A four-metre floral arch in blush roses, peonies and trailing eucalyptus for a private garden ceremony.','https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&h=600&q=70',1),
  ('Hotel Lobby Installation','Hospitality','Seasonal artificial arrangements — refreshed each month — for a boutique hotel lobby. Always in bloom, zero upkeep.','https://images.unsplash.com/photo-1561848355-890d054dc55a?auto=format&fit=crop&w=800&h=600&q=70',2),
  ('Birthday Backdrop & Table Styling','Celebration','A pastel bloom-and-balloon backdrop with matching centrepieces for a milestone birthday.','https://images.unsplash.com/photo-1561593367-66c79c2294e6?auto=format&fit=crop&w=800&h=600&q=70',3),
  ('Corporate Gala Centrepieces','Corporate','Tall gold-and-ivory centrepieces for an awards night — consistent, reusable and photo-ready.','https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&h=600&q=70',4),
  ('Engagement Stage Décor','Wedding','Romantic floral styling in soft roses and gold accents, framing the couple''s seating for the evening.','https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&h=600&q=70',5),
  ('Boutique Storefront Display','Retail','Window-display styling with cascading faux florals that stay fresh through the whole season.','https://images.unsplash.com/photo-1558879787-4c4aea1fbb83?auto=format&fit=crop&w=800&h=600&q=70',6)
) as v(title, type, blurb, image, sort)
where not exists (select 1 from public.projects);
