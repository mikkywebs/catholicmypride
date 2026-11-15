-- Catholic My Pride: show view counts from the first view; reactions on saints, prayers and ebooks;
-- view counts for lists. Safe to run more than once.
alter table public.settings alter column view_threshold set default 0;
update public.settings set view_threshold = 0;

create or replace function public.react(p_type text, p_id text, p_kind text, p_delta int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare n int;
begin
  if p_type not in ('song', 'reading', 'post', 'novena', 'chaplet', 'saint', 'prayer', 'book') then raise exception 'bad type'; end if;
  if p_kind not in ('wow', 'awesome', 'emotional', 'love', 'amen', 'thumbs') then raise exception 'bad kind'; end if;
  insert into reactions (content_type, content_id, kind, count)
    values (p_type, p_id, p_kind, greatest(p_delta, 0))
  on conflict (content_type, content_id, kind)
    do update set count = greatest(reactions.count + sign(p_delta)::int, 0)
  returning count into n;
  return n;
end $$;
grant execute on function public.react(text, text, text, int) to anon, authenticated;

-- Totals for several pages at once (lists of songs and articles).
create or replace function public.view_counts(p_paths text[])
returns table (path text, views bigint)
language sql
stable
security definer
set search_path = public
as $$
  select v.path, count(*) from page_views v
  where v.path = any (p_paths[1:60])
  group by v.path;
$$;
grant execute on function public.view_counts(text[]) to anon, authenticated;
notify pgrst, 'reload schema';
