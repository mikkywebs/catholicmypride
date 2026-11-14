-- Catholic My Pride: initial schema
-- Run once in the Supabase SQL editor (or with the Supabase CLI).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Site settings (single row, id = 1)
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'Catholic My Pride',
  tagline text not null default 'Apostolate',
  mission text not null default 'Spreading the Gospel, strengthening the Catholic faith and sharing Christ''s love.',
  logo_url text,
  hero_image_url text,
  hero_title text default 'Spreading the Gospel, sharing Christ''s love',
  hero_subtitle text default 'Prayers, novenas, Scripture reflections and hymns for every day of the Church year.',
  about_image_url text,
  about_story_title text,
  about_story_md text,
  contact_email text default 'contact@catholicmypride.org',
  contact_phone text,
  contact_address text,
  youtube_url text default 'https://www.youtube.com/@CMPApostolate',
  facebook_url text,
  tiktok_url text,
  x_url text,
  donate_url text default 'https://selar.com/showlove/catholicmypride',
  bank_account_name text,
  bank_name text,
  bank_account_number text,
  donate_needs_md text,
  view_threshold int not null default 50,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Categories (blog, song, book, prayer)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('blog', 'song', 'book', 'prayer')),
  name text not null,
  slug text not null,
  seo_title text,
  seo_description text,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  unique (kind, slug)
);

-- Shared columns are repeated per table for clarity.
-- status: draft | published ; published_at in the future = scheduled.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body_md text not null default '',
  featured_image text,
  image_alt text,
  category_id uuid references public.categories (id) on delete set null,
  tags text[] not null default '{}',
  audio_url text,
  audio_seconds int,
  author text default 'Catholic My Pride',
  seo_title text,
  seo_description text,
  focus_keyword text,
  keywords text,
  noindex boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  about text,
  lyrics text,
  audio_url text,
  duration_seconds int,
  featured_image text,
  image_alt text,
  category_id uuid references public.categories (id) on delete set null,
  allow_download boolean not null default true,
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  title text,
  day_type text check (day_type in ('Weekday', 'Optional Memorial', 'Memorial', 'Feast', 'Solemnity', 'Sunday')),
  season text,
  vestment text check (vestment in ('White', 'Red', 'Green', 'Violet', 'Rose', 'Black', 'Gold')),
  featured_image text,
  image_alt text,
  first_ref text, first_text text,
  psalm_ref text, psalm_response text, psalm_text text,
  second_ref text, second_text text,
  acclamation_ref text, acclamation_text text,
  gospel_ref text, gospel_text text,
  reflection_title text, reflection_md text,
  remarks_md text,
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.novenas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  feast_name text,
  feast_date date not null,
  featured_image text,
  image_alt text,
  common_prayers_md text,
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.novena_days (
  novena_id uuid not null references public.novenas (id) on delete cascade,
  day int not null check (day between 1 and 9),
  title text,
  prayer_md text,
  audio_url text,
  audio_seconds int,
  primary key (novena_id, day)
);

create table if not exists public.saints (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  show_on date,
  feast_label text,
  celebration text,
  featured_image text,
  image_alt text,
  born text, died text, canonised text,
  patronage text[] not null default '{}',
  life_md text,
  quote text,
  prayer_md text,
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prayers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category_id uuid references public.categories (id) on delete set null,
  time_of_day text check (time_of_day in ('morning', 'midday', 'evening', 'night')),
  show_on date,
  body_md text not null default '',
  audio_url text,
  audio_seconds int,
  featured_image text,
  image_alt text,
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  author text,
  category_id uuid references public.categories (id) on delete set null,
  cover_url text,
  description_md text,
  keywords text[] not null default '{}',
  remarks text,
  is_free boolean not null default true,
  price_label text,
  buy_url text,
  file_url text,
  pages int,
  format text,
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.churches (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  state text not null,
  diocese text not null,
  diocese_kind text not null default 'Diocese' check (diocese_kind in ('Diocese', 'Archdiocese')),
  name text not null,
  address text not null,
  map_url text,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

create table if not exists public.homepage_images (
  key text primary key,
  url text not null,
  alt text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Prayer requests (links are rejected at the database too)
-- ---------------------------------------------------------------------------
create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  country text,
  body text not null check (char_length(body) between 3 and 2000),
  is_private boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'prayed')),
  prayed_count int not null default 0,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  constraint no_links check (
    body !~* '(https?://|www\.|[a-z0-9-]+\.(com|org|net|ng|io|co|info|xyz|ly|me|uk|app|link)\M)'
    and coalesce(name, '') !~* '(https?://|www\.)'
  )
);

create or replace view public.public_prayer_requests
with (security_invoker = false) as
  select id,
         coalesce(nullif(split_part(trim(name), ' ', 1), ''), 'Anonymous') as first_name,
         country, body, prayed_count, created_at, approved_at
  from public.prayer_requests
  where status = 'approved' and is_private = false;

-- ---------------------------------------------------------------------------
-- Reactions and page views
-- ---------------------------------------------------------------------------
create table if not exists public.reactions (
  content_type text not null,
  content_id text not null,
  kind text not null,
  count int not null default 0,
  primary key (content_type, content_id, kind)
);

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  section text,
  country text,
  created_at timestamptz not null default now()
);
create index if not exists page_views_path_idx on public.page_views (path);
create index if not exists page_views_created_idx on public.page_views (created_at);

create or replace function public.record_view(p_path text, p_section text, p_country text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare n bigint;
begin
  if p_path is null or char_length(p_path) > 300 then return 0; end if;
  insert into page_views (path, section, country) values (p_path, left(p_section, 40), left(p_country, 8));
  select count(*) into n from page_views where path = p_path;
  return n;
end $$;

create or replace function public.view_count(p_path text)
returns bigint
language sql
stable
security definer
set search_path = public
as $$ select count(*) from page_views where path = p_path; $$;

create or replace function public.react(p_type text, p_id text, p_kind text, p_delta int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare n int;
begin
  if p_type not in ('song', 'reading', 'post') then raise exception 'bad type'; end if;
  if p_kind not in ('wow', 'awesome', 'emotional', 'love', 'amen', 'thumbs') then raise exception 'bad kind'; end if;
  insert into reactions (content_type, content_id, kind, count)
    values (p_type, p_id, p_kind, greatest(p_delta, 0))
  on conflict (content_type, content_id, kind)
    do update set count = greatest(reactions.count + sign(p_delta)::int, 0)
  returning count into n;
  return n;
end $$;

create or replace function public.pray_for(p_id uuid, p_delta int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare n int;
begin
  update prayer_requests
     set prayed_count = greatest(prayed_count + sign(p_delta)::int, 0)
   where id = p_id and status = 'approved' and is_private = false
  returning prayed_count into n;
  return coalesce(n, 0);
end $$;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['posts','songs','readings','novenas','saints','prayers','books'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read published" on public.%I', t);
    execute format($p$create policy "public read published" on public.%I for select using (status = 'published' and (published_at is null or published_at <= now()))$p$, t);
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

alter table public.novena_days enable row level security;
drop policy if exists "public read" on public.novena_days;
create policy "public read" on public.novena_days for select using (
  exists (select 1 from public.novenas n where n.id = novena_id and n.status = 'published')
);
drop policy if exists "admin all" on public.novena_days;
create policy "admin all" on public.novena_days for all using (public.is_admin()) with check (public.is_admin());

alter table public.churches enable row level security;
drop policy if exists "public read published" on public.churches;
create policy "public read published" on public.churches for select using (status = 'published');
drop policy if exists "admin all" on public.churches;
create policy "admin all" on public.churches for all using (public.is_admin()) with check (public.is_admin());

do $$
declare t text;
begin
  foreach t in array array['settings','categories','homepage_images'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "admin write" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

alter table public.prayer_requests enable row level security;
drop policy if exists "anyone can submit" on public.prayer_requests;
create policy "anyone can submit" on public.prayer_requests for insert
  with check (status = 'pending' and prayed_count = 0 and approved_at is null);
drop policy if exists "admin all" on public.prayer_requests;
create policy "admin all" on public.prayer_requests for all using (public.is_admin()) with check (public.is_admin());

alter table public.reactions enable row level security;
drop policy if exists "public read" on public.reactions;
create policy "public read" on public.reactions for select using (true);

alter table public.page_views enable row level security;
drop policy if exists "admin read" on public.page_views;
create policy "admin read" on public.page_views for select using (public.is_admin());

alter table public.admin_users enable row level security;
drop policy if exists "self read" on public.admin_users;
create policy "self read" on public.admin_users for select using (user_id = auth.uid());

grant select on public.public_prayer_requests to anon, authenticated;
grant execute on function public.record_view(text, text, text) to anon, authenticated;
grant execute on function public.view_count(text) to anon, authenticated;
grant execute on function public.react(text, text, text, int) to anon, authenticated;
grant execute on function public.pray_for(uuid, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: one public bucket for images, audio and ebook files
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Contact form messages
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 120),
  subject text,
  message text not null check (char_length(message) between 3 and 4000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
drop policy if exists "anyone can send" on public.contact_messages;
create policy "anyone can send" on public.contact_messages for insert with check (is_read = false);
drop policy if exists "admin all" on public.contact_messages;
create policy "admin all" on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());
