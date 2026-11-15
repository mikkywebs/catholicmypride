-- Catholic My Pride: official totals for countries, provinces and dioceses (all optional).
-- Safe to run more than once.
alter table public.dioceses add column if not exists total_parishes integer;
alter table public.dioceses add column if not exists total_priests integer;
alter table public.dioceses add column if not exists catholic_population bigint;

create table if not exists public.directory_regions (
  id uuid primary key default gen_random_uuid(),
  continent text not null,
  country text not null,
  province text,                      -- empty = totals for the whole country
  total_provinces integer,
  total_dioceses integer,
  total_parishes integer,
  total_priests integer,
  catholic_population bigint,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists directory_regions_place_idx on public.directory_regions (lower(country), lower(coalesce(province, '')));
alter table public.directory_regions enable row level security;
drop policy if exists "public read published" on public.directory_regions;
create policy "public read published" on public.directory_regions for select using (status = 'published');
drop policy if exists "admin all" on public.directory_regions;
create policy "admin all" on public.directory_regions for all using (public.is_admin()) with check (public.is_admin());
grant select on public.directory_regions to anon, authenticated;
grant insert, update, delete on public.directory_regions to authenticated;
notify pgrst, 'reload schema';
