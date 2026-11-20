-- 0025: remind visitors who arrive a few minutes after a prayer time (Angelus, Divine Mercy…).
-- Minutes after the prayer time during which the reminder shows; 0 = no reminder. Safe to run more than once.
alter table public.songs add column if not exists bar_remind_minutes int not null default 15;
alter table public.songs drop constraint if exists songs_bar_remind_minutes_check;
alter table public.songs add constraint songs_bar_remind_minutes_check check (bar_remind_minutes between 0 and 60);
-- The music bar no longer repeats by itself.
update public.settings set music_loop = 'once';
notify pgrst, 'reload schema';
