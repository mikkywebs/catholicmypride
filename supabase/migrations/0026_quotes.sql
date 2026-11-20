-- 0026: quote library and Quote of the Day. Safe to run more than once.
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(text) between 5 and 600),
  author text not null check (char_length(author) between 2 and 120),
  source text check (char_length(source) <= 200),
  kind text not null default 'saint' check (kind in ('jesus', 'mary', 'bible', 'saint', 'pope', 'bishop', 'scholar', 'church')),
  show_on date,
  needs_review boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists quotes_show_on_idx on public.quotes (show_on);
alter table public.quotes enable row level security;
drop policy if exists "public read published" on public.quotes;
create policy "public read published" on public.quotes for select using (status = 'published');
drop policy if exists "admin all" on public.quotes;
create policy "admin all" on public.quotes for all using (public.is_admin()) with check (public.is_admin());
grant select on public.quotes to anon, authenticated;
grant insert, update, delete on public.quotes to authenticated;
notify pgrst, 'reload schema';
