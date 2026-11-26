# Builds supabase/migrations/0043_owerri_parishes.sql from scripts/data/owerri.txt
# (owarch-directory.vercel.app/parishes, read 26 Nov 2026: name | type | deanery; priests deliberately left out).
import pathlib, re

KEEP = {'FUTO', 'IMSU', 'MCC', 'JMJ', 'CKC', 'H.E.', 'II', 'X', 'C.', 'K.', 'C'}
SMALL = {'of', 'the', 'and', 'in'}

def word(w, first):
    core = w.strip('(),')
    if core.upper() in KEEP or re.fullmatch(r'[A-Z]\.', core): return w
    if core.upper() in ('ST', 'ST.'): return w.replace(core, 'St.')
    if core.upper() in ('SS', 'SS.'): return w.replace(core, 'Ss.')
    low = w.lower()
    if not first and low.strip('(),') in SMALL: return low
    out = re.sub(r"(^|[\s(\-/])([a-z])", lambda m: m.group(1) + m.group(2).upper(), low)
    return re.sub(r"’S\b|'S\b", lambda m: m.group(0).lower(), out)

def title(s):
    s = re.sub(r'\s+', ' ', s.strip()).replace('’', "'")
    return ' '.join(word(w, i == 0) for i, w in enumerate(s.split(' '))).replace("'S ", "'s ")

rows = []
for line in (pathlib.Path(__file__).parent / 'data/owerri.txt').read_text().splitlines():
    raw, kind, dean = [x.strip() for x in line.split('|')]
    if ':' in raw and not raw.upper().startswith(('ST', 'SS')):
        place, saint = [x.strip() for x in raw.split(':', 1)]   # "Atta: St. Michael's" → "St. Michael's, Atta"
        name, place_part = f"{title(saint)}, {title(place)}", title(place)
    else:
        name = title(raw)
        place_part = name.split(',', 1)[1].strip() if ',' in name else None
    if kind == 'Chaplaincy' and not re.search(r'chaplaincy|chapel', name, re.I): name += ' (Chaplaincy)'
    addr = f"{place_part.strip(' ,')}, Imo State" if place_part else None
    rows.append((name, addr, f"{dean} Deanery"))

names = [r[0] for r in rows]
dups = {n for n in names if names.count(n) > 1}
assert not dups, dups
deaneries = sorted({r[2] for r in rows})
q = lambda s: "null" if s is None else "$cmp$" + s + "$cmp$"
SLUG = "coalesce(nullif(trim(both '-' from regexp_replace(regexp_replace(lower(v.name), '[''’]', '', 'g'), '[^a-z0-9]+', '-', 'g')), ''), 'parish')"
sql = f"""-- 0043: the Archdiocese of Owerri (Province of Owerri) with its 8 deaneries and {len(rows)} parishes,
-- chaplaincies and special jurisdictions. Source: the archdiocesan directory (owarch-directory.vercel.app), 26 Nov 2026.
-- Parish priests are not included (appointments change). Run after 0040 and 0042.
-- Needs the Archdiocese of Owerri in Admin › Dioceses (the "Add Nigeria's dioceses" button). Safe to run more than once.

update public.dioceses set
  deaneries = array[{', '.join(q(d) for d in deaneries)}],
  cathedral = coalesce(cathedral, 'Maria Assumpta Cathedral, Owerri'),
  address = coalesce(address, 'Archdiocesan Secretariat, Villa Assumpta, Owerri, Imo State')
where country = 'Nigeria' and lower(name) = 'owerri';

insert into public.churches (diocese_id, country, diocese, name, address, deanery, slug, status)
select d.id, 'Nigeria', d.name, v.name, v.address, v.deanery, {SLUG}, 'published'
from (values
{",\n".join(f"  ({q(n)}, {q(a)}, {q(dn)})" for n, a, dn in rows)}
) as v(name, address, deanery)
join public.dioceses d on d.country = 'Nigeria' and lower(d.name) = 'owerri'
where not exists (select 1 from public.churches c where c.diocese_id = d.id and lower(c.name) = lower(v.name));

-- Check: parishes per deanery in Owerri.
select c.deanery, count(*) from public.churches c join public.dioceses d on d.id = c.diocese_id
where d.country = 'Nigeria' and lower(d.name) = 'owerri' group by c.deanery order by c.deanery;
"""
out = pathlib.Path(__file__).resolve().parents[1] / 'supabase/migrations/0043_owerri_parishes.sql'
out.write_text(sql)
print(out.name, len(rows), 'entries;', deaneries)
for r in rows[:12] + rows[60:66] + rows[200:205]: print(' ', r)
