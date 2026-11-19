#!/usr/bin/env python3
"""Writes an SQL file that loads one novena (as a draft) from a content module.
   Usage: python3 build_novena_sql.py content_ic ../../supabase/migrations/0019_novena_immaculate_conception.sql"""
import importlib, re, sys
from verses import get

C = importlib.import_module(sys.argv[1])
OUT = sys.argv[2]

def scripture(r):
    book, name, ch, a, b, override = r
    text = override or get(book, ch, a, b)
    text = re.sub(r'[:;,]\s*$', '.', text.strip())
    return f"{name} {ch}:{a}" + (f"–{b}" if b else ''), text

def day_md(title, r, reflection, prayer, opening=False):
    ref, text = scripture(r)
    parts = [f"**Scripture: {ref}**", f"> {text}"]
    if reflection: parts.append(reflection)
    if not opening: parts.append(f"**Today’s intention:** {title.split(' · ')[0]}")
    parts += ['**Opening Prayer**' if opening else '**Prayer**', prayer]
    return '\n\n'.join(parts)

def q(s):
    if s is None: return 'null'
    assert '$cmp$' not in s
    return f'$cmp${s}$cmp$'

rows = [(0, C.OPENING[0], day_md(*C.OPENING, opening=True))] if C.OPENING else []
rows += [(n, t, day_md(t, r, refl, p)) for n, (t, r, refl, p) in enumerate(C.DAY, start=1)]
assert len(C.DAY) == C.DAYS

sql = f"""-- Loads the {C.TITLE} as a draft. Run after 0018. Safe to run more than once.

insert into public.novenas (slug, title, feast_name, feast_date, start_date, days_count, has_opening, intro_md, repeat_prayer_md, repeat_count, common_prayers_md, invitation_md, seo_title, seo_description, status)
values ({q(C.SLUG)}, {q(C.TITLE)}, {q(C.FEAST_NAME)}, '{C.FEAST_DATE}', {f"'{C.START}'" if C.START else 'null'}, {C.DAYS}, {'true' if C.HAS_OPENING else 'false'},
  {q(C.INTRO)}, {q(C.REPEAT)}, {C.REPEAT_COUNT or 'null'}, {q(C.CLOSING)}, {q(C.INVITATION)}, {q(C.SEO_TITLE)}, {q(C.SEO_DESC)}, 'draft')
on conflict (slug) do nothing;

insert into public.novena_days (novena_id, day, title, prayer_md)
select n.id, d.day, d.title, d.prayer_md
from public.novenas n
cross join (values
""" + ',\n'.join(f"  ({d}, {q(t)}, {q(m)})" for d, t, m in rows) + f"""
) as d(day, title, prayer_md)
where n.slug = {q(C.SLUG)}
on conflict (novena_id, day) do nothing;
"""
open(OUT, 'w').write(sql)
print(OUT, len(rows), 'days')
