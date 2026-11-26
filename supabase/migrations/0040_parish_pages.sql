-- 0040: a page for every parish (with its own web address), Mass times and contact details,
-- map position for "parishes near me", and "Add your parish" / "Update details" from visitors.
-- Safe to run more than once.

alter table public.churches add column if not exists slug text;
alter table public.churches add column if not exists mass_times text;
alter table public.churches add column if not exists phone text;
alter table public.churches add column if not exists email text;
alter table public.churches add column if not exists website text;
alter table public.churches add column if not exists lat double precision;
alter table public.churches add column if not exists lng double precision;

-- Web addresses for parishes saved before today: the name in lower case with dashes,
-- plus -2, -3 … when two parishes in the same diocese share a name.
with base as (
  select id, diocese_id,
         coalesce(nullif(trim(both '-' from regexp_replace(regexp_replace(lower(name), '[''’]', '', 'g'), '[^a-z0-9]+', '-', 'g')), ''), 'parish') as s,
         row_number() over (partition by diocese_id, coalesce(nullif(trim(both '-' from regexp_replace(regexp_replace(lower(name), '[''’]', '', 'g'), '[^a-z0-9]+', '-', 'g')), ''), 'parish') order by created_at, id) as n
  from public.churches where slug is null
)
update public.churches c set slug = case when b.n = 1 then b.s else b.s || '-' || b.n end
from base b where c.id = b.id;
create unique index if not exists churches_diocese_slug_key on public.churches (diocese_id, slug);

-- Parishes sent in by visitors (new parishes, or corrections to one already listed). Nothing goes live until approved.
create table if not exists public.church_submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'new' check (kind in ('new', 'update')),
  church_id uuid references public.churches (id) on delete cascade,
  diocese_id uuid not null references public.dioceses (id) on delete cascade,
  deanery text check (char_length(deanery) <= 80),
  name text not null check (char_length(name) between 3 and 120),
  address text check (char_length(address) <= 300),
  map_url text check (char_length(map_url) <= 600),
  mass_times text check (char_length(mass_times) <= 1500),
  phone text check (char_length(phone) <= 40),
  email text check (char_length(email) <= 120),
  website text check (char_length(website) <= 200),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  submitter_name text not null check (char_length(submitter_name) between 2 and 80),
  submitter_contact text not null check (char_length(submitter_contact) between 5 and 120),
  role text check (char_length(role) <= 60),
  note text check (char_length(note) <= 600),
  status text not null default 'new' check (status in ('new', 'approved', 'declined')),
  created_at timestamptz not null default now()
);
alter table public.church_submissions enable row level security;
drop policy if exists "anyone can submit" on public.church_submissions;
create policy "anyone can submit" on public.church_submissions for insert with check (status = 'new');
drop policy if exists "admin all" on public.church_submissions;
create policy "admin all" on public.church_submissions for all using (public.is_admin()) with check (public.is_admin());
grant insert on public.church_submissions to anon, authenticated;
grant select, update, delete on public.church_submissions to authenticated;

notify pgrst, 'reload schema';
