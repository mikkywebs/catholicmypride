-- 0033: Blog Ideas you choose to skip. Only the admin can see or change them. Safe to run more than once.
create table if not exists public.blog_idea_skips (
  idea text primary key,          -- the idea's key, e.g. saint:saint-andrew:2026-11-30 (one event, one year)
  title text,
  created_at timestamptz not null default now()
);
alter table public.blog_idea_skips enable row level security;
drop policy if exists "admin all" on public.blog_idea_skips;
create policy "admin all" on public.blog_idea_skips for all using (public.is_admin()) with check (public.is_admin());
notify pgrst, 'reload schema';
