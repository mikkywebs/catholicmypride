# Builds supabase/migrations/0044_church_kinds.sql: marks Owerri's chaplaincies and special
# jurisdictions (from scripts/data/owerri.txt) so only true parishes are counted as parishes.
import pathlib, runpy, io, contextlib
here = pathlib.Path(__file__).parent
with contextlib.redirect_stdout(io.StringIO()):
    g = runpy.run_path(str(here / 'directory_owerri.py'))      # reuses its name tidying (rebuilds 0043 unchanged)
title, re = g['title'], g['re']
KIND = {'Parish': 'parish', 'Special Jurisdiction': 'special', 'Chaplaincy': 'chaplaincy'}
rows = []
for line in (here / 'data/owerri.txt').read_text().splitlines():
    raw, kind, dean = [x.strip() for x in line.split('|')]
    if ':' in raw and not raw.upper().startswith(('ST', 'SS')):
        place, saint = [x.strip() for x in raw.split(':', 1)]
        name = f"{title(saint)}, {title(place)}"
    else:
        name = title(raw)
    if kind == 'Chaplaincy' and not re.search(r'chaplaincy|chapel', name, re.I): name += ' (Chaplaincy)'
    if KIND[kind] != 'parish': rows.append((name, KIND[kind]))
assert [n for n, _ in rows if n not in {r[0] for r in g['rows']}] == []
q = lambda s: "$cmp$" + s + "$cmp$"
sql = f"""-- 0044: each church is a parish, a special jurisdiction or a chaplaincy. Only parishes are counted
-- as "parishes" on the directory; the others are listed apart. Marks Owerri's {sum(k == 'special' for _, k in rows)} special
-- jurisdictions and {sum(k == 'chaplaincy' for _, k in rows)} chaplaincies (from the archdiocesan directory). Safe to run more than once.

alter table public.churches add column if not exists kind text not null default 'parish';
alter table public.churches drop constraint if exists churches_kind_check;
alter table public.churches add constraint churches_kind_check check (kind in ('parish', 'special', 'chaplaincy'));

update public.churches c set kind = v.kind
from (values
{",\n".join(f"  ({q(n)}, '{k}')" for n, k in rows)}
) as v(name, kind)
join public.dioceses d on d.country = 'Nigeria' and lower(d.name) = 'owerri'
where c.diocese_id = d.id and lower(c.name) = lower(v.name);

-- Elsewhere, names that say chaplaincy are marked too.
update public.churches set kind = 'chaplaincy' where kind = 'parish' and name ~* '\\mchaplaincy\\M';

-- Check: Owerri should show 162 parish, 38 special, 18 chaplaincy.
select c.kind, count(*) from public.churches c join public.dioceses d on d.id = c.diocese_id
where d.country = 'Nigeria' and lower(d.name) = 'owerri' group by c.kind order by c.kind;
"""
(here.parent / 'supabase/migrations/0044_church_kinds.sql').write_text(sql)
print(len(rows))
