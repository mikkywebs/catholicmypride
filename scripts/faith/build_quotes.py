#!/usr/bin/env python3
"""Builds data/faith/quotes.json: Scripture word for word from the Douay-Rheims, plus sourced quotes."""
import json, re, sys
sys.path.insert(0, '../novena')
from verses import get
from quotes import SCRIPTURE, QUOTES
out, seen = [], set()
for kind, book, ch, a, b, author, ref in SCRIPTURE:
    t = re.sub(r'\s+', ' ', get(book, ch, a, b)).strip()
    # Keep only the spoken words: drop narration such as “Jesus saith to him:”, and psalm titles.
    m = re.match(r'^[^:]*\b(saith|said|saying|spoke|answering|answered|cried)\b[^:]*:\s*(.*)$', t)
    if m: t = m.group(2)
    t = re.sub(r'^(A psalm|The psalm|Unto the end)[^.]*\.\s*', '', t)
    t = re.sub(r'^(And|But|For|Then)\s+', '', t)
    # Hebrew letter headings in the acrostic psalms and Lamentations (e.g. “NUN.”, “Heth.”).
    t = re.sub(r'\b(ALEPH|BETH|GIMEL|DALETH|HE|VAU|ZAIN|HETH|TETH|JOD|CAPH|LAMED|MEM|NUN|SAMECH|AIN|PHE|SADE|COPH|RES|SIN|TAU|Heth|Aleph|Beth|Nun)\.\s*', '', t)
    # Stop before the narration that follows the words spoken.
    if ref in ('Luke 23:34', 'Luke 1:38'): t = t.split('. ')[0] + '.'
    t = t[0].upper() + t[1:]
    t = re.sub(r'[:;,]\s*$', '.', t)
    out.append({'kind': kind, 'text': t, 'author': author, 'source': ref})
for kind, text, author, source in QUOTES:
    out.append({'kind': kind, 'text': text, 'author': author, 'source': source})
for q in out:
    k = q['text'].lower()[:60]
    assert k not in seen, q; seen.add(k)
    assert 5 <= len(q['text']) <= 600, q
json.dump(out, open('../../data/faith/quotes.json', 'w'), ensure_ascii=False, indent=0)
from collections import Counter
print(len(out), Counter(q['kind'] for q in out))
for q in out[:3] + out[27:30]: print('-', q['text'][:110], '|', q['source'])
