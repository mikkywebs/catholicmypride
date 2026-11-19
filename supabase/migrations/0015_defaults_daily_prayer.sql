-- Catholic My Pride: default images for Mass readings and daily prayers; daily prayers prepared automatically.
-- Safe to run more than once.
alter table public.settings add column if not exists default_reading_image text;
alter table public.settings add column if not exists default_reading_alt text;
alter table public.settings add column if not exists default_prayer_image text;
alter table public.settings add column if not exists default_prayer_alt text;
alter table public.prayers add column if not exists auto_filled boolean not null default false;
notify pgrst, 'reload schema';
