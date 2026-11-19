#!/usr/bin/env python3
"""Builds data/saints/saints.json from part1-4.py and the calendar ranks in the lectionary database.
Usage: python3 build.py <lect.sqlite> <out.json>"""
import json, re, sqlite3, sys, unicodedata
from part1 import DATA as A
from part2 import DATA as B
from part3 import DATA as C
from part4 import DATA as D
from part5 import CELEBRATIONS as E
from part6 import EXTRA as F

SQLITE, OUT = sys.argv[1:3]
db = sqlite3.connect(SQLITE)
RANK = {(f'{m:02d}-{d:02d}', code): t for m, d, code, t in db.execute('select feast_month, feast_date, feast_code, feast_type from generalcalendar')}
LABEL = {'Solemnity': 'Solemnity', 'Feast': 'Feast', 'Feast-Lord': 'Feast', 'Mem': 'Memorial', 'Mem-Mary': 'Memorial', 'OpMem': 'Optional Memorial'}
ORDER = {'Solemnity': 0, 'Feast': 1, 'Memorial': 2, 'Optional Memorial': 3, 'Local Memorial': 4}
MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


def slugify(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


FEMALE = ['Agnes', 'Agatha', 'Scholastica', 'Bakhita', 'Angela', 'Frances', 'Catherine', 'Rita', 'Elizabeth', 'Maria', 'Mary Magdalene', 'Birgitta', 'Bridget',
          'Clare', 'Jane Frances', 'Teresa', 'Edith', 'Monica', 'Rose', 'Hildegard', 'Thérèse', 'Faustina', 'Hedwig', 'Margaret', 'Gertrude', 'Cecilia', 'Lucy']


def prayer(name, code):
    c = code.lower()
    if any(k in c for k in ['mary', 'our lady', 'virgin mary']) and 'magdalene' not in c and 'pazzi' not in c and 'martha' not in c:
        return f'{name}, pray for us.\n\nHoly Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.'
    if 'angel' in c:
        return f'{name}, pray for us.\n\nLord God, in your loving providence you send your holy angels to watch over us. Grant that we may be defended by their protection and rejoice one day in their company. Through Christ our Lord. Amen.'
    if c.startswith('all saints'):
        return 'All you holy men and women, saints of God, pray for us.\n\nAlmighty ever-living God, by whose gift we celebrate the merits of all the Saints, bestow on us through their prayers the abundance of your mercy. Through Christ our Lord. Amen.'
    plural = bool(re.match(r'^(saints|the holy|holy innocents|first martyrs|seven)', c)) or ' and ' in name.lower()
    if 'martyr' in c or 'beheading' in c or 'innocents' in c:
        role, ask = 'faithful witnesses to Christ, even to the shedding of blood' if plural else 'a faithful witness to Christ, even to the shedding of blood', 'to stand firm in faith and to love you above all things'
    elif 'apostle' in c or 'evangelist' in c or 'conversion' in c or 'chair' in c:
        role, ask = 'apostles of the Good News' if plural else 'an apostle of the Good News', 'to believe the Gospel and to share it with joy'
    elif 'doctor' in c:
        role, ask = 'teachers of the true faith' if plural else 'a teacher of the true faith', 'to know you more deeply and to live by your truth'
    elif 'pope' in c or 'bishop' in c:
        role, ask = 'shepherds of your people' if plural else 'a shepherd of your people', 'to love your Church and to serve one another'
    elif 'priest' in c:
        role, ask = 'faithful servants of the Gospel' if plural else 'a faithful servant of the Gospel', 'to serve you and our neighbour with generous hearts'
    elif any(k in c for k in ['virgin', 'religious', 'abbot', 'hermit', 'monk', 'founders']):
        role, ask = 'models of prayer and holiness' if plural else 'a model of prayer and holiness', 'to seek you above all things'
    else:
        role, ask = 'models of holiness' if plural else 'a model of holiness', 'to follow Christ faithfully in our daily lives'
    female = 'virgin' in c or any(n in name for n in FEMALE)
    pron = 'their' if plural else 'her' if female else 'his'
    return (f'{name}, pray for us.\n\nAlmighty God, you gave {name} to your Church as {role}. '
            f'Through {pron} prayers and example, help us {ask}. Through Christ our Lord. Amen.')


saints, by_date, seen = {}, {}, set()
for mmdd, code, name, born, died, patrons, life in A + B + C + D:
    t = RANK.get((mmdd, code))
    if t is None:
        print('NOT IN CALENDAR', mmdd, code); continue
    slug = slugify(name)
    if slug in saints:
        slug = f'{slug}-{mmdd}'
    m, d = int(mmdd[:2]), int(mmdd[3:])
    saints[slug] = {
        'name': name, 'date': mmdd, 'feast_label': f'{d} {MONTHS[m - 1]}', 'celebration': LABEL[t],
        'born': born or None, 'died': died or None, 'patronage': patrons, 'life_md': life,
        'prayer_md': prayer(name, code if not name.startswith('Our Lady') else name),
    }
    by_date.setdefault(mmdd, []).append(slug)
    seen.add((mmdd, code))
for mmdd, code, name, life, pray in E:
    t = RANK.get((mmdd, code))
    if t is None:
        print('NOT IN CALENDAR', mmdd, code); continue
    slug = slugify(name)
    m, d = int(mmdd[:2]), int(mmdd[3:])
    saints[slug] = {
        'name': name, 'date': mmdd, 'feast_label': f'{d} {MONTHS[m - 1]}', 'celebration': LABEL[t], 'kind': 'celebration',
        'born': None, 'died': None, 'patronage': [], 'life_md': life, 'prayer_md': pray,
    }
    by_date.setdefault(mmdd, []).append(slug)
    seen.add((mmdd, code))
for mmdd, name, born, died, patrons, life in F:
    slug = slugify(name)
    m, d = int(mmdd[:2]), int(mmdd[3:])
    saints[slug] = {
        'name': name, 'date': mmdd, 'feast_label': f'{d} {MONTHS[m - 1]}', 'celebration': 'Local Memorial',
        'born': born or None, 'died': died or None, 'patronage': patrons, 'life_md': life, 'prayer_md': prayer(name, 'priest'),
    }
    by_date.setdefault(mmdd, []).append(slug)
for k in by_date:
    by_date[k].sort(key=lambda s: ORDER[saints[s]['celebration']])
skipped = sorted(k for k in RANK if k not in seen)
print('saints', len(saints), '| days', len(by_date), '| calendar entries without a saint page:', len(skipped))
for k in skipped: print('  skipped', k)
json.dump({'saints': saints, 'byDate': dict(sorted(by_date.items()))}, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
