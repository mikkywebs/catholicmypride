-- Catholic My Pride: prayers that play at set times on the music bar (Angelus, Divine Mercy),
-- and feasts that are not saints on Saint of the Day. Safe to run more than once.
alter table public.songs add column if not exists bar_times text[] not null default '{}';
alter table public.songs add column if not exists bar_season text not null default 'all';
alter table public.songs drop constraint if exists songs_bar_season_check;
alter table public.songs add constraint songs_bar_season_check check (bar_season in ('all', 'easter', 'not_easter'));
alter table public.saints add column if not exists kind text not null default 'saint';
notify pgrst, 'reload schema';
