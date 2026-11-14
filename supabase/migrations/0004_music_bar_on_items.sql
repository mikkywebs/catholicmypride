-- Catholic My Pride: music bar settings live on each song/audio item.
-- Safe to run more than once.

alter table public.songs add column if not exists on_bar boolean not null default false;
alter table public.songs add column if not exists bar_days int[] not null default '{}';
alter table public.songs add column if not exists bar_start time;
alter table public.songs add column if not exists bar_end time;
alter table public.songs add column if not exists bar_order int not null default 0;

alter table public.settings add column if not exists music_loop text not null default 'loop';
do $$ begin
  alter table public.settings add constraint settings_music_loop_check check (music_loop in ('loop', 'once'));
exception when duplicate_object then null; end $$;

-- Carry over anything already placed in a playlist (first playlist wins).
do $$ begin
  if to_regclass('public.music_playlists') is not null then
    update public.songs s
       set on_bar = true,
           bar_days = p.days,
           bar_start = p.start_time,
           bar_end = p.end_time,
           bar_order = p.pos
      from (
        select distinct on (item) item, days, start_time, end_time, (ord - 1)::int as pos
          from public.music_playlists, unnest(items) with ordinality as u(item, ord)
         where status = 'published'
         order by item, sort, ord
      ) p
     where s.id = p.item and s.on_bar = false;
  end if;
end $$;
