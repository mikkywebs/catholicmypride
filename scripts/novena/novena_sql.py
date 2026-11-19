"""Shared helpers: turn a novena content module into SQL."""
import re
from verses import REFS, get

def scripture(r):
    if isinstance(r, int):  # index into verses.REFS (Saint Andrew content)
        x = REFS[r]; r = (x[0], x[1], x[2], x[3], x[4] if len(x) > 4 else None, None)
    book, name, ch, a, b, override = r
    text = override or get(book, ch, a, b)
    text = re.sub(r'[:;,]\s*$', '.', text.strip()).replace('CHILD IS BORN', 'child is born')
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

def rows(C):
    out = [(0, C.OPENING[0], day_md(*C.OPENING, opening=True))] if C.OPENING else []
    out += [(n, t, day_md(t, r, refl, p)) for n, (t, r, refl, p) in enumerate(C.DAY, start=1)]
    assert len(C.DAY) == C.DAYS
    return out

def values(C):
    return ',\n'.join(f"  ({d}, {q(t)}, {q(m)})" for d, t, m in rows(C))
