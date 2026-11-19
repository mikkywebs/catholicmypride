#!/usr/bin/env python3
"""Writes an SQL file that loads one novena (as a draft) from a content module. Safe to run more than once.
   Usage: python3 build_novena_sql.py content_ep ../../supabase/migrations/0021_novena_epiphany.sql"""
import importlib, sys
from novena_sql import q, values

C = importlib.import_module(sys.argv[1])
yearly = getattr(C, 'REPEATS_YEARLY', None)
cols = 'slug, title, feast_name, feast_date, start_date, days_count, has_opening, intro_md, repeat_prayer_md, repeat_count, common_prayers_md, invitation_md, seo_title, seo_description, status' + (', repeats_yearly' if yearly is not None else '')
vals = f"""{q(C.SLUG)}, {q(C.TITLE)}, {q(C.FEAST_NAME)}, '{C.FEAST_DATE}', {f"'{C.START}'" if C.START else 'null'}, {C.DAYS}, {'true' if C.HAS_OPENING else 'false'},
  {q(C.INTRO)}, {q(C.REPEAT)}, {C.REPEAT_COUNT or 'null'}, {q(C.CLOSING)}, {q(C.INVITATION)}, {q(C.SEO_TITLE)}, {q(C.SEO_DESC)}, 'draft'""" + (f", {'true' if yearly else 'false'}" if yearly is not None else '')

sql = f"""-- Loads the {C.TITLE} as a draft{' (run after 0020)' if yearly is not None else ''}. Safe to run more than once.

insert into public.novenas ({cols})
values ({vals})
on conflict (slug) do nothing;

insert into public.novena_days (novena_id, day, title, prayer_md)
select n.id, d.day, d.title, d.prayer_md
from public.novenas n
cross join (values
{values(C)}
) as d(day, title, prayer_md)
where n.slug = {q(C.SLUG)}
on conflict (novena_id, day) do nothing;
"""
open(sys.argv[2], 'w').write(sql)
print(sys.argv[2], 'ok')
