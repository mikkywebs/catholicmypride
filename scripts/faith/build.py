#!/usr/bin/env python3
"""Builds data/faith/faqs.json and data/faith/quiz.json from the starter files here."""
import json, re, sys, unicodedata
sys.path.insert(0, '.')
from faq1 import FAQ as F1
from faq2 import FAQ as F2
from faq3 import FAQ as F3
from quiz1 import QUIZ as Q1
from quiz2 import QUIZ as Q2
from quiz3 import QUIZ as Q3
from quiz4 import QUIZ as Q4
from quiz5 import QUIZ as Q5
from quiz6 import QUIZ as Q6
from quiz7 import QUIZ as Q7
from quiz8 import QUIZ as Q8
from quiz9 import QUIZ as Q9
from quiz10 import QUIZ as Q10

def slugify(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:80].strip('-')

faqs, seen = [], set()
for topic, q, a, src in F1 + F2 + F3:
    slug = slugify(q)
    assert slug not in seen, slug
    seen.add(slug)
    assert 5 <= len(q) <= 300, q
    faqs.append({'question': q, 'slug': slug, 'topic': topic, 'answer_md': a, 'sources': src or None})
quiz, qs = [], set()
for row in Q1 + Q2 + Q3 + Q4 + Q5 + Q6 + Q7 + Q8 + Q9 + Q10:
    assert len(row) == 9, row
    topic, q, a, b, c, d, correct, expl, src = row
    assert correct in 'ABCD' and q.lower() not in qs and len(q) >= 5, q
    assert len({a, b, c, d}) == 4, q
    qs.add(q.lower())
    # Shuffle the options (the same way every build) so the right answer is spread over A–D,
    # except when the options are numbers or years, which stay in order.
    opts = [a, b, c, d]
    right = opts['ABCD'.index(correct)]
    if not all(re.match(r'^[\d–\-\s]+$', o) for o in opts):
        import random
        random.Random(q).shuffle(opts)
    correct = 'ABCD'[opts.index(right)]
    quiz.append({'question': q, 'topic': topic, 'option_a': opts[0], 'option_b': opts[1], 'option_c': opts[2], 'option_d': opts[3], 'correct': correct, 'explanation': expl or None, 'source': src or None})
json.dump(faqs, open('../../data/faith/faqs.json', 'w'), ensure_ascii=False, indent=0)
json.dump(quiz, open('../../data/faith/quiz.json', 'w'), ensure_ascii=False, indent=0)
from collections import Counter
print('faqs', len(faqs), '| quiz', len(quiz))
print('answer letters:', Counter(q['correct'] for q in quiz))
print('faq letters:', ''.join(sorted({f['topic'][0].upper() for f in faqs})))
