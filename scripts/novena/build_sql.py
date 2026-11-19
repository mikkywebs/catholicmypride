#!/usr/bin/env python3
"""Writes supabase/migrations/0018_flexible_novenas.sql: the schema change plus the Saint Andrew Christmas Novena (as a draft)."""
import re
from verses import REFS, get
import content as C

def ref(i):
    r = REFS[i]
    book, name, ch, a = r[:4]
    b = r[4] if len(r) > 4 else None
    text = get(book, ch, a, b)
    text = re.sub(r'[:;,]\s*$', '.', text.strip())
    text = text.replace('CHILD IS BORN', 'child is born')
    return f"{name} {ch}:{a}" + (f"–{b}" if b else ''), text

def day_md(title, i, reflection, prayer, opening=False):
    r, text = ref(i)
    parts = [f"**Scripture: {r}**", f"> {text}"]
    if reflection: parts.append(reflection)
    if not opening: parts.append(f"**Today’s intention:** {title.split(' · ')[0]}")
    parts += ['**Prayer**' if not opening else '**Opening Prayer**', prayer]
    return '\n\n'.join(parts)

def q(s):
    assert '$cmp$' not in s
    return 'null' if s is None else f'$cmp${s}$cmp$'

rows = [(0, C.OPENING[0], day_md(*C.OPENING, opening=True))]
for n, (title, i, refl, prayer) in enumerate(C.DAY, start=1):
    rows.append((n, title, day_md(title, i, refl, prayer)))
assert len(C.DAY) == C.DAYS

sql = f"""-- 0018: novenas of any length, an optional opening day, a repeated prayer with a tap counter,
-- and the Saint Andrew Christmas Novena 2026 (saved as a draft for you to review and publish).

alter table public.novenas
  add column if not exists start_date date,
  add column if not exists days_count int not null default 9,
  add column if not exists has_opening boolean not null default false,
  add column if not exists intro_md text,
  add column if not exists repeat_prayer_md text,
  add column if not exists repeat_count int,
  add column if not exists invitation_md text;

alter table public.novenas drop constraint if exists novenas_days_count_check;
alter table public.novenas add constraint novenas_days_count_check check (days_count between 1 and 40);
alter table public.novenas drop constraint if exists novenas_repeat_count_check;
alter table public.novenas add constraint novenas_repeat_count_check check (repeat_count is null or repeat_count between 1 and 100);

-- Day 0 is the opening day; numbered days can now go up to 40.
alter table public.novena_days drop constraint if exists novena_days_day_check;
alter table public.novena_days add constraint novena_days_day_check check (day between 0 and 40);

-- The Saint Andrew Christmas Novena 2026
insert into public.novenas (slug, title, feast_name, feast_date, start_date, days_count, has_opening, intro_md, repeat_prayer_md, repeat_count, common_prayers_md, invitation_md, seo_title, seo_description, status)
values ({q(C.SLUG)}, {q(C.TITLE)}, {q(C.FEAST_NAME)}, '{C.FEAST_DATE}', '{C.START}', {C.DAYS}, true,
  {q(C.INTRO)}, {q(C.REPEAT)}, 15, {q(C.CLOSING)}, {q(C.INVITATION)}, {q(C.SEO_TITLE)}, {q(C.SEO_DESC)}, 'draft')
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
open('../../supabase/migrations/0018_flexible_novenas.sql', 'w').write(sql)
print(len(rows), 'days,', len(sql), 'characters')
print(rows[1][2][:400])
