-- Catholic My Pride: songs vs audio, chaplets, live reaction counts.
-- Safe to run more than once.

-- 1. Song or audio message/prayer
alter table public.songs add column if not exists kind text not null default 'song';
do $$ begin
  alter table public.songs add constraint songs_kind_check check (kind in ('song', 'audio'));
exception when duplicate_object then null; end $$;

-- 2. Chaplets
create table if not exists public.chaplets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  intro text,
  body_md text not null default '',
  featured_image text,
  image_alt text,
  audio_url text,
  audio_seconds int,
  sort int not null default 0,
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.chaplets enable row level security;
drop policy if exists "public read published" on public.chaplets;
create policy "public read published" on public.chaplets for select
  using (status = 'published' and (published_at is null or published_at <= now()));
drop policy if exists "admin all" on public.chaplets;
create policy "admin all" on public.chaplets for all using (public.is_admin()) with check (public.is_admin());

-- 3. Reactions now also on novenas and chaplets
create or replace function public.react(p_type text, p_id text, p_kind text, p_delta int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare n int;
begin
  if p_type not in ('song', 'reading', 'post', 'novena', 'chaplet') then raise exception 'bad type'; end if;
  if p_kind not in ('wow', 'awesome', 'emotional', 'love', 'amen', 'thumbs') then raise exception 'bad kind'; end if;
  insert into reactions (content_type, content_id, kind, count)
    values (p_type, p_id, p_kind, greatest(p_delta, 0))
  on conflict (content_type, content_id, kind)
    do update set count = greatest(reactions.count + sign(p_delta)::int, 0)
  returning count into n;
  return n;
end $$;
grant execute on function public.react(text, text, text, int) to anon, authenticated;

-- 4. Live counts: send reaction changes to open pages
do $$ begin
  alter publication supabase_realtime add table public.reactions;
exception when duplicate_object then null; when undefined_object then null; end $$;
