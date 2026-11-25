-- 0035: audio can be downloaded only where you allow it.
-- Adds the "Allow download" switch to blog posts, daily prayers, chaplets and novenas (off),
-- and makes new audio items start with downloading off. Safe to run more than once.
alter table public.songs    alter column allow_download set default false;
alter table public.posts    add column if not exists allow_download boolean not null default false;
alter table public.prayers  add column if not exists allow_download boolean not null default false;
alter table public.chaplets add column if not exists allow_download boolean not null default false;
alter table public.novenas  add column if not exists allow_download boolean not null default false;

-- Until now every audio item started with "Download" ticked. This switches downloading OFF for all of them,
-- so you can tick only the ones you want people to download.
update public.songs set allow_download = false;

notify pgrst, 'reload schema';
