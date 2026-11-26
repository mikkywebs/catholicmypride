# Builds supabase/migrations/0045_abuja_parishes.sql from scripts/data/abuja.txt
# (catholicarchdioceseofabuja.org/parishes, read 26 Nov 2026). Priests deliberately left out.
import pathlib
here = pathlib.Path(__file__).parent
rows = []
for line in (here / 'data/abuja.txt').read_text().splitlines():
    if not line.strip() or line.startswith('#'): continue
    name, kind, dean, addr, phone, email = [x.strip() or None for x in (line + ' |' * 5).split('|')[:6]]
    assert kind in ('parish', 'pastoral', 'chaplaincy'), line
    rows.append((name, kind, f"{dean} Deanery", addr, phone, email))
names = [r[0].lower() for r in rows]
assert len(names) == len(set(names)), {n for n in names if names.count(n) > 1}
deaneries = sorted({r[2] for r in rows})
q = lambda s: "null" if s is None else "$cmp$" + s + "$cmp$"
count = lambda k: sum(r[1] == k for r in rows)
SLUG = "coalesce(nullif(trim(both '-' from regexp_replace(regexp_replace(lower(v.name), '[''’.]', '', 'g'), '[^a-z0-9]+', '-', 'g')), ''), 'parish')"
sql = f"""-- 0045: the Archdiocese of Abuja (Province of Abuja) with its {len(deaneries)} deaneries: {count('parish')} parishes,
-- {count('pastoral')} pastoral areas and {count('chaplaincy')} chaplaincies, with the addresses, phones and parish emails the
-- archdiocese publishes. Source: catholicarchdioceseofabuja.org/parishes, 26 Nov 2026. Parish priests are not included.
-- Run after 0044. Needs the Archdiocese of Abuja in Admin › Dioceses. Safe to run more than once.

-- A fourth kind of church: a pastoral area (listed apart, not counted as a parish).
alter table public.churches drop constraint if exists churches_kind_check;
alter table public.churches add constraint churches_kind_check check (kind in ('parish', 'pastoral', 'special', 'chaplaincy'));

update public.dioceses set
  deaneries = array[{', '.join(q(d) for d in deaneries)}],
  cathedral = coalesce(cathedral, 'Our Lady Queen of Nigeria Pro-Cathedral, Garki')
where country = 'Nigeria' and lower(name) = 'abuja';

insert into public.churches (diocese_id, country, diocese, name, kind, deanery, address, phone, email, slug, status)
select d.id, 'Nigeria', d.name, v.name, v.kind, v.deanery, v.address, v.phone, v.email, {SLUG}, 'published'
from (values
{",\n".join("  (" + ", ".join(q(x) for x in r) + ")" for r in rows)}
) as v(name, kind, deanery, address, phone, email)
join public.dioceses d on d.country = 'Nigeria' and lower(d.name) = 'abuja'
where not exists (select 1 from public.churches c where c.diocese_id = d.id and lower(c.name) = lower(v.name));

-- Check: Abuja should show {count('chaplaincy')} chaplaincy, {count('parish')} parish, {count('pastoral')} pastoral.
select c.kind, count(*) from public.churches c join public.dioceses d on d.id = c.diocese_id
where d.country = 'Nigeria' and lower(d.name) = 'abuja' group by c.kind order by c.kind;
"""
(here.parent / 'supabase/migrations/0045_abuja_parishes.sql').write_text(sql)
print(len(rows), deaneries)
