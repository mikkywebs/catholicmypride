#!/usr/bin/env python3
"""Writes 0020: novenas can repeat every year; the two Advent novenas lose the year and get evergreen text."""
import content as SA, content_ic as IC
from novena_sql import q, values

def update(C):
    return f"""
-- {C.TITLE}: new address and title, repeats every year, evergreen text.
-- Your featured image, audio and Published/Draft setting are kept.
-- (If an extra 2026 copy was loaded again after this update, remove that copy.)
delete from public.novenas where slug = {q(C.OLD_SLUG)} and exists (select 1 from public.novenas where slug = {q(C.SLUG)});
update public.novenas set
  slug = {q(C.SLUG)}, title = {q(C.TITLE)}, repeats_yearly = true,
  intro_md = {q(C.INTRO)}, common_prayers_md = {q(C.CLOSING)}, invitation_md = {q(C.INVITATION)},
  seo_title = {q(C.SEO_TITLE)}, seo_description = {q(C.SEO_DESC)}, updated_at = now()
where slug in ({q(C.OLD_SLUG)}, {q(C.SLUG)});

insert into public.novena_days (novena_id, day, title, prayer_md)
select n.id, d.day, d.title, d.prayer_md
from public.novenas n
cross join (values
{values(C)}
) as d(day, title, prayer_md)
where n.slug = {q(C.SLUG)}
on conflict (novena_id, day) do update set title = excluded.title, prayer_md = excluded.prayer_md;
"""

sql = """-- 0020: novenas can repeat every year (dates roll over by themselves),
-- and the Saint Andrew and Immaculate Conception novenas drop "2026". Safe to run more than once.

alter table public.novenas add column if not exists repeats_yearly boolean not null default false;
""" + update(SA) + update(IC)
open('../../supabase/migrations/0020_yearly_novenas.sql', 'w').write(sql)
print('ok', len(sql))
