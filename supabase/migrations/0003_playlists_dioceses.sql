-- Catholic My Pride: music bar playlists and the parish directory hierarchy.
-- Safe to run more than once.

-- ---------------------------------------------------------------------------
-- 1. Music bar playlists
-- ---------------------------------------------------------------------------
create table if not exists public.music_playlists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  items uuid[] not null default '{}',          -- song/audio ids, in play order
  days int[] not null default '{}',            -- 0 = Sunday … 6 = Saturday; empty = every day
  start_time time,                             -- empty = all day
  end_time time,
  loop_mode text not null default 'loop' check (loop_mode in ('loop', 'once')),
  sort int not null default 0,                 -- lower wins when two playlists overlap
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.music_playlists enable row level security;
drop policy if exists "public read published" on public.music_playlists;
create policy "public read published" on public.music_playlists for select using (status = 'published');
drop policy if exists "admin all" on public.music_playlists;
create policy "admin all" on public.music_playlists for all using (public.is_admin()) with check (public.is_admin());

alter table public.settings add column if not exists music_fallback text not null default 'songs';
do $$ begin
  alter table public.settings add constraint settings_music_fallback_check check (music_fallback in ('songs', 'audio', 'all', 'none'));
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 2. Dioceses, and parishes linked to them
-- ---------------------------------------------------------------------------
create table if not exists public.dioceses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'Diocese' check (kind in ('Archdiocese', 'Diocese', 'Apostolic Vicariate', 'Prefecture')),
  continent text not null check (continent in ('Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania')),
  country text not null,
  province text,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country, name)
);
alter table public.dioceses enable row level security;
drop policy if exists "public read published" on public.dioceses;
create policy "public read published" on public.dioceses for select using (status = 'published');
drop policy if exists "admin all" on public.dioceses;
create policy "admin all" on public.dioceses for all using (public.is_admin()) with check (public.is_admin());

alter table public.churches add column if not exists diocese_id uuid references public.dioceses (id) on delete set null;
alter table public.churches add column if not exists deanery text;
alter table public.churches add column if not exists updated_at timestamptz not null default now();
-- Country, state and diocese now come from the linked diocese.
alter table public.churches alter column country drop not null;
alter table public.churches alter column state drop not null;
alter table public.churches alter column diocese drop not null;
create index if not exists churches_diocese_idx on public.churches (diocese_id);
