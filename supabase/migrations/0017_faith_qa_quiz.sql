-- Catholic My Pride: Questions & Answers (A–Z), visitor questions, and the Catholic Quiz bank.
-- Safe to run more than once.

-- 1. Questions & Answers
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 5 and 300),
  slug text not null unique,
  topic text not null,                 -- the A–Z word, e.g. "Angels"
  answer_md text not null,
  sources text,                        -- e.g. "CCC 328–336; Hebrews 1:14"
  needs_review boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  published_at timestamptz default now(),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists faqs_topic_idx on public.faqs (topic);
alter table public.faqs enable row level security;
drop policy if exists "public read published" on public.faqs;
create policy "public read published" on public.faqs for select using (status = 'published');
drop policy if exists "admin all" on public.faqs;
create policy "admin all" on public.faqs for all using (public.is_admin()) with check (public.is_admin());
grant select on public.faqs to anon, authenticated;
grant insert, update, delete on public.faqs to authenticated;

-- 2. Questions sent by visitors (not public)
create table if not exists public.faq_submissions (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 5 and 300),
  name text check (char_length(name) <= 80),
  country text check (char_length(country) <= 60),
  status text not null default 'new' check (status in ('new', 'answered', 'ignored')),
  created_at timestamptz not null default now(),
  constraint faq_no_links check (
    question !~* '(https?://|www\.|[a-z0-9-]+\.(com|org|net|ng|io|co|info|xyz|ly|me|uk|app|link)\M)'
    and coalesce(name, '') !~* '(https?://|www\.)'
  )
);
alter table public.faq_submissions enable row level security;
drop policy if exists "anyone can ask" on public.faq_submissions;
create policy "anyone can ask" on public.faq_submissions for insert with check (status = 'new');
drop policy if exists "admin all" on public.faq_submissions;
create policy "admin all" on public.faq_submissions for all using (public.is_admin()) with check (public.is_admin());
grant insert on public.faq_submissions to anon, authenticated;
grant select, update, delete on public.faq_submissions to authenticated;

-- 3. Quiz bank
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 5 and 300),
  topic text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct text not null check (correct in ('A', 'B', 'C', 'D')),
  explanation text,
  source text,
  needs_review boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.quiz_questions enable row level security;
drop policy if exists "public read published" on public.quiz_questions;
create policy "public read published" on public.quiz_questions for select using (status = 'published');
drop policy if exists "admin all" on public.quiz_questions;
create policy "admin all" on public.quiz_questions for all using (public.is_admin()) with check (public.is_admin());
grant select on public.quiz_questions to anon, authenticated;
grant insert, update, delete on public.quiz_questions to authenticated;

-- Live admin alert for new questions
do $$ begin
  alter publication supabase_realtime add table public.faq_submissions;
exception when duplicate_object then null; when undefined_object then null; end $$;
notify pgrst, 'reload schema';
