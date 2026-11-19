-- 0023: readers can submit articles for review. Nothing is published until the admin approves it.
-- The writer's email is private (only the admin can read it). Safe to run more than once.

create table if not exists public.article_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 10 and 150),
  body text not null check (char_length(body) between 1500 and 20000),
  sources text check (char_length(sources) <= 3000),
  name text not null check (char_length(name) between 2 and 80),
  country text not null check (char_length(country) between 2 and 60),
  email text not null check (char_length(email) <= 120 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  about_author text check (char_length(about_author) <= 300),
  status text not null default 'new' check (status in ('new', 'approved', 'declined')),
  post_id uuid references public.posts (id) on delete set null,
  created_at timestamptz not null default now(),
  -- No links anywhere: sources are given as plain text.
  constraint article_no_links check (
    (title || ' ' || body || ' ' || coalesce(sources, '') || ' ' || coalesce(about_author, '') || ' ' || name)
      !~* '(https?://|www\.|[a-z0-9-]+\.(com|org|net|ng|io|co|info|xyz|ly|me|uk|app|link|blog|site)\M)'
  )
);
alter table public.article_submissions enable row level security;
drop policy if exists "anyone can submit" on public.article_submissions;
create policy "anyone can submit" on public.article_submissions for insert with check (status = 'new' and post_id is null);
drop policy if exists "admin all" on public.article_submissions;
create policy "admin all" on public.article_submissions for all using (public.is_admin()) with check (public.is_admin());
grant insert on public.article_submissions to anon, authenticated;
grant select, update, delete on public.article_submissions to authenticated;

-- Contributor byline on blog posts: “By Ada Okeke · Ghana”.
alter table public.posts add column if not exists author_country text;
alter table public.posts add column if not exists is_contributor boolean not null default false;

do $$ begin
  alter publication supabase_realtime add table public.article_submissions;
exception when duplicate_object then null; when undefined_object then null; end $$;
notify pgrst, 'reload schema';
