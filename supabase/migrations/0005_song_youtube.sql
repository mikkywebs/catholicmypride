-- Catholic My Pride: optional YouTube link on each song/audio item. Safe to run more than once.
alter table public.songs add column if not exists youtube_url text;
