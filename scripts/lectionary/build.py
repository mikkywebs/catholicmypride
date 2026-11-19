#!/usr/bin/env python3
"""
Builds the daily Mass readings data used by the website.

Sources (all free to use):
  - Calendar and reading references: Tamil-Catholic-Lectionary by Br. Jayarathina Madharasan SDR
    (public domain, github.com/jayarathina/Tamil-Catholic-Lectionary), run with the General Roman Calendar (no national feasts):
    Epiphany and Corpus Christi on Sunday, Ascension on Thursday.
  - Text: Douay-Rheims Bible, 1899 American edition (public domain), with the Challoner text
    filling the few chapters missing from that copy.

Usage:
  python3 build.py <calendar-json-dir> <lect.sqlite> <dra-json-dir> <dr-challoner.json> <out-dir>

Writes <out-dir>/days-YYYY.json for each calendar year and <out-dir>/passages.json.
"""
import glob
import json
import os
import re
import sqlite3
import sys
from datetime import date

CAL_DIR, SQLITE, DRA_DIR, DR_FILE, OUT = sys.argv[1:6]

# ---------------------------------------------------------------- Bible text
DRA = {}
for f in glob.glob(os.path.join(DRA_DIR, '[ON]T-*.json')):
    key = re.sub(r'^[ON]T-\d+_', '', os.path.basename(f))[:-5]
    DRA[key] = {c: v for c, v in json.load(open(f)).items() if c != 'charset'}
DR = json.load(open(DR_FILE))

# Tamil abbreviation -> (English name for display, 1899 file key, Challoner key)
BOOKS = {
    'தொநூ': ('Genesis', 'Genesis', 'Genesis'), 'விப': ('Exodus', 'Exodus', 'Exodus'),
    'லேவி': ('Leviticus', 'Leviticus', 'Leviticus'), 'எண்': ('Numbers', 'Numbers', 'Numbers'),
    'இச': ('Deuteronomy', 'Deuteronomy', 'Deuteronomy'), 'இணை': ('Deuteronomy', 'Deuteronomy', 'Deuteronomy'),
    'யோசு': ('Joshua', 'Joshua', 'Josue'), 'நீத': ('Judges', 'Judges', 'Judges'), 'ரூத்': ('Ruth', 'Ruth', 'Ruth'),
    '1சாமு': ('1 Samuel', '1-Samuel', '1 Kings'), '2சாமு': ('2 Samuel', '2-Samuel', '2 Kings'),
    '1அர': ('1 Kings', '1-Kings', '3 Kings'), '2அர': ('2 Kings', '2-Kings', '4 Kings'),
    '1குறி': ('1 Chronicles', '1-Chronicles', '1 Paralipomenon'), '2குறி': ('2 Chronicles', '2-Chronicles', '2 Paralipomenon'),
    'எஸ்ரா': ('Ezra', 'Ezra', '1 Esdras'), 'நெகே': ('Nehemiah', 'Nehemiah', '2 Esdras'),
    'தோபி': ('Tobit', 'Tobit', 'Tobias'), 'யூதி': ('Judith', 'Judith', 'Judith'),
    'எஸ்(கி)': ('Esther', 'Esther', 'Esther'), 'யோபு': ('Job', 'Job', 'Job'),
    'திபா': ('Psalm', 'Psalms', 'Psalms'), 'நீமொ': ('Proverbs', 'Proverbs', 'Proverbs'),
    'சஉ': ('Ecclesiastes', 'Ecclesiastes', 'Ecclesiastes'), 'இபா': ('Song of Songs', 'SongOfSongs', 'Canticles'),
    'சாஞா': ('Wisdom', 'Wisdom', 'Wisdom'), 'சீஞா': ('Sirach', 'Sirach', 'Ecclesiasticus'),
    'எசா': ('Isaiah', 'Isaiah', 'Isaias'), 'எரே': ('Jeremiah', 'Jeremiah', 'Jeremias'),
    'புல': ('Lamentations', 'Lamentations', 'Lamentations'), 'பாரூ': ('Baruch', 'Baruch', 'Baruch'),
    'எசே': ('Ezekiel', 'Ezekiel', 'Ezechiel'), 'தானி': ('Daniel', 'Daniel', 'Daniel'),
    'தானி(இ)': ('Daniel', 'Daniel', 'Daniel'),
    'ஓசே': ('Hosea', 'Hosea', 'Osee'), 'யோவே': ('Joel', 'Joel', 'Joel'), 'ஆமோ': ('Amos', 'Amos', 'Amos'),
    'யோனா': ('Jonah', 'Jonah', 'Jonas'), 'மீக்': ('Micah', 'Micah', 'Micheas'), 'நாகூ': ('Nahum', 'Nahum', 'Nahum'),
    'அப': ('Habakkuk', 'Habakkuk', 'Habacuc'), 'செப்': ('Zephaniah', 'Zephaniah', 'Sophonias'),
    'ஆகா': ('Haggai', 'Haggai', 'Aggeus'), 'செக்': ('Zechariah', 'Zechariah', 'Zacharias'),
    'மலா': ('Malachi', 'Malachi', 'Malachias'), '1மக்': ('1 Maccabees', '1-Maccabees', '1 Machabees'),
    '2மக்': ('2 Maccabees', '2-Maccabees', '2 Machabees'),
    'மத்': ('Matthew', 'Matthew', 'Matthew'), 'மாற்': ('Mark', 'Mark', 'Mark'), 'லூக்': ('Luke', 'Luke', 'Luke'),
    'யோவா': ('John', 'John', 'John'), 'திப': ('Acts', 'Acts', 'Acts'), 'உரோ': ('Romans', 'Romans', 'Romans'),
    '1கொரி': ('1 Corinthians', '1-Corinthians', '1 Corinthians'), '2கொரி': ('2 Corinthians', '2-Corinthians', '2 Corinthians'),
    'கலா': ('Galatians', 'Galatians', 'Galatians'), 'எபே': ('Ephesians', 'Ephesians', 'Ephesians'),
    'பிலி': ('Philippians', 'Philippians', 'Philippians'), 'கொலோ': ('Colossians', 'Colossians', 'Colossians'),
    '1தெச': ('1 Thessalonians', '1-Thessalonians', '1 Thessalonians'), '2தெச': ('2 Thessalonians', '2-Thessalonians', '2 Thessalonians'),
    '1திமொ': ('1 Timothy', '1-Timothy', '1 Timothy'), '2திமொ': ('2 Timothy', '2-Timothy', '2 Timothy'),
    'தீத்': ('Titus', 'Titus', 'Titus'), 'பில': ('Philemon', 'Philemon', 'Philemon'), 'எபி': ('Hebrews', 'Hebrews', 'Hebrews'),
    'யாக்': ('James', 'James', 'James'), '1பேது': ('1 Peter', '1-Peter', '1 Peter'), '2பேது': ('2 Peter', '2-Peter', '2 Peter'),
    '1யோவா': ('1 John', '1-John', '1 John'), '2யோவா': ('2 John', '2-John', '2 John'), '3யோவா': ('3 John', '3-John', '3 John'),
    'யூதா': ('Jude', 'Jude', 'Jude'), 'திவெ': ('Revelation', 'Revelation', 'Apocalypse'),
}
BOOK_KEYS = sorted(BOOKS, key=len, reverse=True)

# How readings are introduced, as on the site.
INTRO = {
    'Matthew': 'A reading from the holy Gospel according to Matthew', 'Mark': 'A reading from the holy Gospel according to Mark',
    'Luke': 'A reading from the holy Gospel according to Luke', 'John': 'A reading from the holy Gospel according to John',
    'Acts': 'A reading from the Acts of the Apostles', 'Revelation': 'A reading from the Book of Revelation',
    'Romans': 'A reading from the Letter of Saint Paul to the Romans',
    '1 Corinthians': 'A reading from the First Letter of Saint Paul to the Corinthians',
    '2 Corinthians': 'A reading from the Second Letter of Saint Paul to the Corinthians',
    'Galatians': 'A reading from the Letter of Saint Paul to the Galatians', 'Ephesians': 'A reading from the Letter of Saint Paul to the Ephesians',
    'Philippians': 'A reading from the Letter of Saint Paul to the Philippians', 'Colossians': 'A reading from the Letter of Saint Paul to the Colossians',
    '1 Thessalonians': 'A reading from the First Letter of Saint Paul to the Thessalonians',
    '2 Thessalonians': 'A reading from the Second Letter of Saint Paul to the Thessalonians',
    '1 Timothy': 'A reading from the First Letter of Saint Paul to Timothy', '2 Timothy': 'A reading from the Second Letter of Saint Paul to Timothy',
    'Titus': 'A reading from the Letter of Saint Paul to Titus', 'Philemon': 'A reading from the Letter of Saint Paul to Philemon',
    'Hebrews': 'A reading from the Letter to the Hebrews', 'James': 'A reading from the Letter of Saint James',
    '1 Peter': 'A reading from the First Letter of Saint Peter', '2 Peter': 'A reading from the Second Letter of Saint Peter',
    '1 John': 'A reading from the First Letter of Saint John', '2 John': 'A reading from the Second Letter of Saint John',
    '3 John': 'A reading from the Third Letter of Saint John', 'Jude': 'A reading from the Letter of Saint Jude',
    'Song of Songs': 'A reading from the Song of Songs', 'Lamentations': 'A reading from the Book of Lamentations',
}
PROPHETS = {'Isaiah', 'Jeremiah', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Baruch'}


def intro_for(book):
    if book in INTRO:
        return INTRO[book]
    if book in PROPHETS:
        return f'A reading from the Book of the Prophet {book}'
    return f'A reading from the Book of {book}'


# Standard table: psalms whose title counts as verse 1 (or 1-2) in the Hebrew/Vulgate numbering
# used by the Douay-Rheims, but not in the numbering of the lectionary references.
TITLE_ONE = {3, 4, 5, 6, 7, 8, 9, 12, 18, 19, 20, 21, 22, 30, 31, 34, 36, 38, 39, 40, 41, 42, 44, 45, 46, 47, 48, 49, 53, 55,
             56, 57, 58, 59, 61, 62, 63, 64, 65, 67, 68, 69, 70, 75, 76, 77, 80, 81, 83, 84, 85, 88, 89, 92, 102, 108, 140, 142}
TITLE_TWO = {51, 52, 54, 60}
# Psalms whose verse division in this edition does not line up exactly; flagged for a quick check.
PSALM_IRREGULAR = {2, 4, 11, 20, 29, 43, 44, 56, 126, 136, 150}


TITLE_SENT = re.compile(
    r"^(Unto the end|To the end|A psalm|A canticle|A gradual|The (inscription|prayer|praise|psalm) |For David|To David|"
    r"For the sons of Core|For the same David|Understanding for|Of understanding|A prayer (for|of)|On the first day|"
    r"Alleluia, of|Psalm of|For Idithun|Of the sons of Jonadab|In verses|\[)", re.I)


def strip_title(t):
    """Removes a psalm heading from the start of a verse. Returns the rest ('' if the verse is only a heading)."""
    rest = t.strip()
    while rest:
        m = re.match(r'^(\[[^\]]*\]|[^.\[]*?(\.|$)(\s*\[[^\]]*\])?)\s*', rest)
        sent = m.group(0) if m else rest
        if not TITLE_SENT.match(sent.strip()) and not re.match(r'^\[', sent):
            break
        rest = rest[len(sent):].strip()
    return rest


def ps_verse_raw(d, v):
    return DRA['Psalms'].get(str(d), {}).get(str(v))


LEAD = {}
for _d in range(1, 151):
    lead = 0
    for _v in (1, 2):
        t = ps_verse_raw(_d, _v)
        if not t:
            break
        t = re.sub(r'^\s*\d+\s+', '', t)
        if strip_title(t) == '' or (_v == 2 and lead == 1 and re.match(r'^When ', t) and _d in (50, 51, 53, 59)):
            lead += 1
        else:
            break
    LEAD[_d] = lead


def psalm_to_dr(n, v):
    """Lectionary psalm/verse (Hebrew psalm numbers) -> Douay-Rheims psalm/verse."""
    if n == 9:
        return 9, v + 1
    if n == 10:
        return 9, v + 21
    if n == 114:
        return 113, v
    if n == 115:
        return 113, v + 8
    if n == 116:
        return (114, v) if v <= 9 else (115, v)
    if n == 147:
        return (146, v) if v <= 11 else (147, v)
    d = n if n <= 8 or n >= 148 else n - 1
    return d, v + LEAD.get(d, 0)


def clean(t):
    t = re.sub(r'^\s*\d+\s+', '', t)  # some verses repeat their number
    t = t.replace('*', '').replace('  ', ' ')
    return t.strip()


def verse_text(dra_key, dr_key, c, v):
    t = DRA.get(dra_key, {}).get(str(c), {}).get(str(v))
    if t:
        t = clean(t)
        if dra_key == 'Psalms' and v <= 2:
            t = strip_title(t) or t
        return t
    t = DR.get(dr_key, {}).get(str(c), {}).get(str(v))
    return clean(t) if t else None


def chapter_len(dra_key, dr_key, c):
    ch = DRA.get(dra_key, {}).get(str(c)) or DR.get(dr_key, {}).get(str(c)) or {}
    nums = [int(k) for k in ch if k.isdigit()]
    return max(nums) if nums else 0


def half(text, letters):
    """Part of a verse: letters a, b, c... name its lines. Douay-Rheims marks the halves with ':'."""
    letters = re.sub(r'[^a-f]', '', letters or '')
    if not letters:
        return text
    parts = [p.strip() for p in re.split(r'\s*:\s*', text) if p.strip()]
    if len(parts) < 2:
        parts = [p.strip() for p in re.split(r'(?<=[.;?!])\s+', text) if p.strip()]
    if len(parts) < 2:
        return text
    idx = [ord(x) - ord('a') for x in letters]
    L = 2 if max(idx) < 2 else 4 if max(idx) < 4 else 6
    if min(idx) == 0 and max(idx) == L - 1:
        return text
    n = len(parts)
    a, b = min(n - 1, idx[0] * n // L), min(n - 1, idx[-1] * n // L)
    p = ' '.join(parts[a:b + 1]) if ':' not in text else ': '.join(parts[a:b + 1])
    p = re.sub(r'[,;:]$', '.', p)
    return p[0].upper() + p[1:]


# ---------------------------------------------------------------- reference parsing
VTOK = re.compile(r'^(\d+)([a-z]*)$')


def parse_ref(raw):
    """Returns (cf, [stanza [segment (book, c1, v1, l1, c2, v2, l2)]]) or None for non-verse codes."""
    ref = raw.strip()
    ref = re.sub(r'~.*$', '', ref)
    cf = 'காண்க' in ref
    ref = ref.replace('காண்க', '').strip()
    if not re.match(r'^\d?[஀-௿]', ref):
        return None
    stanzas, cur = [], []
    book, chap = None, None
    for part in ref.split(';'):
        part = part.strip()
        m = next((k for k in BOOK_KEYS if part.startswith(k)), None)
        if m:
            book = m
            part = part[len(m):].lstrip(':')
        if not part or book is None:
            continue
        # tokens separated by ',' (same stanza) or '.' (new stanza)
        for tok, sep in re.findall(r'([^,.]+)([,.]?)', part):
            tok = tok.strip()
            if not tok:
                continue
            if ':' in tok.split('-')[0]:
                chap, tok = tok.split(':', 1)
                chap = int(re.sub(r'\D', '', chap))
            a, _, b = tok.partition('-')
            ma = VTOK.match(a.strip())
            if not ma or chap is None:
                continue
            v1, l1 = int(ma.group(1)), ma.group(2)
            c2, v2, l2 = chap, v1, l1
            if b:
                b = b.strip()
                if ':' in b:
                    cc, b = b.split(':', 1)
                    c2 = int(re.sub(r'\D', '', cc))
                mb = VTOK.match(b)
                if mb:
                    v2, l2 = int(mb.group(1)), mb.group(2)
                elif re.match(r'^[a-z]+$', b):  # 17k-m: letters within one verse
                    v2, l2 = v1, ''
            cur.append((book, chap, v1, l1, c2, v2, l2))
            chap = c2
            if sep == '.':
                stanzas.append(cur)
                cur = []
        if cur and part is not None:
            pass
    if cur:
        stanzas.append(cur)
    return cf, stanzas


def fmt_ref(cf, stanzas):
    out, last_book, last_chap = '', None, None
    segs = [s for st in stanzas for s in st]
    for i, (book, c1, v1, l1, c2, v2, l2) in enumerate(segs):
        name = BOOKS[book][0]
        if book == 'தானி(இ)':
            c1d = {1: 3, 2: 13, 3: 14}.get(c1, c1)
            add = 23 if c1 == 1 else 0
            c1, v1, c2, v2 = c1d, v1 + add, {1: 3, 2: 13, 3: 14}.get(c2, c2), v2 + add
        a = f'{v1}{l1}'
        bpart = '' if (c2, v2, l2) == (c1, v1, l1) else (f'–{c2}:{v2}{l2}' if c2 != c1 else f'–{v2}{l2}')
        if book != last_book:
            out += ('; ' if out else '') + f'{name} {c1}:{a}{bpart}'
        elif c1 != last_chap:
            out += f'; {c1}:{a}{bpart}'
        else:
            out += f', {a}{bpart}'
        last_book, last_chap = book, c2
    return ('cf. ' if cf else '') + out


def seg_verses(seg):
    """Expands a segment into (dra_key, dr_key, c, v, letters) in Douay-Rheims numbering."""
    book, c1, v1, l1, c2, v2, l2 = seg
    _, dra_key, dr_key = BOOKS[book]
    out = []
    if book == 'தானி(இ)':
        base = {1: (3, 23), 2: (13, 0), 3: (14, 0)}
        for c in range(c1, c2 + 1):
            dc, add = base.get(c, (c, 0))
            start = v1 if c == c1 else 1
            end = v2 if c == c2 else 200
            for v in range(start, end + 1):
                out.append((dra_key, dr_key, dc, v + add, ''))
        return out
    for c in range(c1, c2 + 1):
        start = v1 if c == c1 else 1
        end = v2 if c == c2 else chapter_len(dra_key, dr_key, c)
        for v in range(start, end + 1):
            letters = (l1 if (c, v) == (c1, v1) else '') if (c1, v1) != (c2, v2) else (l1 + l2 if l1 != l2 else l1)
            if book == 'திபா':
                dc, dv = psalm_to_dr(c, v)
                out.append((dra_key, dr_key, dc, dv, letters))
            else:
                out.append((dra_key, dr_key, c, v, letters))
    return out


MISSING = []


def text_for(stanzas, psalm=False, partial=False):
    lines_by_stanza = []
    for st in stanzas:
        parts = []
        for seg in st:
            for dra_key, dr_key, c, v, letters in seg_verses(seg):
                t = verse_text(dra_key, dr_key, c, v)
                if t is None:
                    if chapter_len(dra_key, dr_key, c) and v > chapter_len(dra_key, dr_key, c):
                        continue  # range ran past the end of a chapter in this edition
                    MISSING.append(f'{dra_key} {c}:{v}')
                    continue
                parts.append(half(t, letters) if (psalm or partial) else t)
        lines_by_stanza.append(parts)
    end = lambda x: re.sub(r'[,;:]\s*$', '.', x)
    if psalm:
        return [[*st[:-1], end(st[-1])] if st else st for st in lines_by_stanza]
    return end(' '.join(p for st in lines_by_stanza for p in st))


# ---------------------------------------------------------------- acclamations that are not single verses
ACCLAIM = {
    'AW01-2Tue': 'Behold, our Lord shall come with power; he will enlighten the eyes of his servants.',
    'AW01-3Wed': 'Behold, the Lord comes to save his people; blessed are those prepared to meet him.',
    'AW01-5Fri': 'Behold, our Lord shall come with power; he will enlighten the eyes of his servants.',
    'AW02-1Mon': 'Behold, the King, the Lord of the earth, shall come; he will take away the yoke of our captivity.',
    'AW02-2Tue': 'The day of the Lord is near; behold, he comes to save us.',
    'AW02-3Wed': 'Behold, the Lord comes to save his people; blessed are those prepared to meet him.',
    'AW02-5Fri': 'The Lord is coming; go out to meet him. He is the Prince of peace.',
    'AW03-2Tue': 'Come, O Lord, do not delay; forgive the sins of your people.',
    'AW03-5Fri': 'Come, O Lord, visit us in peace, that we may rejoice before you with a perfect heart.',
    'AW05-Dec17': 'O Wisdom of the Most High, ordering all things with strength and gentleness, come and teach us the way of truth.',
    'AW05-Dec18': 'O Leader of the House of Israel, giver of the Law to Moses on Sinai, come to rescue us with your mighty power.',
    'AW05-Dec19': 'O Root of Jesse’s stem, sign of God’s love for all his people, come to save us without delay.',
    'AW05-Dec20': 'O Key of David, opening the gates of God’s eternal Kingdom, come and free the prisoners of darkness.',
    'AW05-Dec21': 'O Radiant Dawn, splendour of eternal light, sun of justice, shine on those who dwell in darkness and the shadow of death.',
    'AW05-Dec22-23': 'O King of all nations and keystone of the Church, come and save man whom you formed from the dust.',
    'AW05-Dec24': 'O Emmanuel, our King and Giver of Law, come to save us, Lord our God.',
    'Assumption': 'Mary is taken up to heaven; the choirs of angels rejoice.',
    'CW01-Dec25-1': 'Tomorrow the wickedness of the earth will be destroyed; the Saviour of the world will reign over us.',
    'CW01-Dec25-4': 'A holy day has dawned upon us. Come, you nations, and adore the Lord. For today a great light has come upon the earth.',
    'CW01-Dec30': 'A holy day has dawned upon us. Come, you nations, and adore the Lord. For today a great light has come upon the earth.',
    'CW02-Jan5': 'A holy day has dawned upon us. Come, you nations, and adore the Lord. For today a great light has come upon the earth.',
    'EW08-Pentecost-1': 'Come, Holy Spirit, fill the hearts of your faithful and kindle in them the fire of your love.',
    'EW08-Pentecost-2': 'Come, Holy Spirit, fill the hearts of your faithful and kindle in them the fire of your love.',
    'Easter01-24': 'Christ is risen, who made all things; he has shown mercy to all mankind.',
    'LW05-2Tue': 'The seed is the word of God, Christ is the sower; all who come to him will live for ever.',
    'LW06-1Mon': 'Hail to you, our King; you alone are compassionate with our faults.',
    'LW06-2Tue': 'Hail to you, our King, obedient to the Father; you were led to your crucifixion like a gentle lamb to the slaughter.',
    'LW06-3Wed1': 'Hail to you, our King; you alone are compassionate with our faults.',
    'LW06-3Wed2': 'Hail to you, our King, obedient to the Father; you were led to your crucifixion like a gentle lamb to the slaughter.',
    'Martyrs-5AL06': 'We praise you, O God, we acclaim you as Lord; the white-robed army of martyrs praises you.',
    'Mary-5AL05': 'Blessed are you, holy Virgin Mary, deserving of all praise; from you rose the sun of justice, Christ our God.',
    'Mary-5AL06': 'Blessed is the Virgin Mary who, without dying, won the martyr’s crown beneath the Cross of the Lord.',
    'MaryBirth': 'Blessed are you, holy Virgin Mary, deserving of all praise; from you rose the sun of justice, Christ our God.',
    'MaryMag': 'Tell us, Mary, what did you see on the way? I saw the tomb of the living Christ and the glory of his rising.',
    'OW11-0SunB': 'The seed is the word of God, Christ is the sower; all who come to him will live for ever.',
    'OW15-0SunA': 'The seed is the word of God, Christ is the sower; all who come to him will live for ever.',
    'OW17-2Tue': 'The seed is the word of God, Christ is the sower; all who come to him will live for ever.',
    'W3Wed/Doc-AL': 'The seed is the word of God, Christ is the sower; all who come to him will live for ever.',
    'Sept14': 'We adore you, O Christ, and we bless you, because by your Cross you have redeemed the world.',
    'Sept15': 'Blessed is the Virgin Mary who, without dying, won the martyr’s crown beneath the Cross of the Lord.',
    'Virgins-5AL02': 'This is the wise virgin whom the Lord found waiting; at his coming, she went in with him to the wedding feast.',
    'Virgins-5AL03': 'Come, bride of Christ, and receive the crown which the Lord has prepared for you for ever.',
    'apostles': 'We praise you, O God, we acclaim you as Lord; the glorious company of Apostles praises you.',
}
SEQUENCE = {'Victimae': 'Victimae Paschali Laudes', 'VeniSancteSpiritus': 'Veni, Sancte Spiritus', 'LaudaSion': 'Lauda Sion', 'StabatMater': 'Stabat Mater'}

# ---------------------------------------------------------------- titles
ORD = lambda n: f'{n}{"th" if 10 <= n % 100 <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")}'
DAYS = {'1Mon': 'Monday', '2Tue': 'Tuesday', '3Wed': 'Wednesday', '4Thu': 'Thursday', '5Fri': 'Friday', '6Sat': 'Saturday'}
SPECIAL = {
    'OW34-0Sun': 'Our Lord Jesus Christ, King of the Universe', 'CW03-Epiphany': 'The Epiphany of the Lord',
    'CW04-Baptism': 'The Baptism of the Lord', 'CW01-HolyFamily': 'The Holy Family of Jesus, Mary and Joseph',
    'CW02-0Sun': 'Second Sunday after the Nativity', 'LW00-3Wed': 'Ash Wednesday', 'LW06-0Sun': 'Palm Sunday of the Passion of the Lord',
    'LW06-4Thu': 'Holy Thursday: Mass of the Lord’s Supper', 'LW06-5Fri': 'Friday of the Passion of the Lord (Good Friday)',
    'LW06-6Sat': 'Holy Saturday: The Easter Vigil', 'EW01-0Sun': 'Easter Sunday of the Resurrection of the Lord',
    'EW02-0Sun': 'Second Sunday of Easter (Divine Mercy Sunday)', 'EW07-Ascension': 'The Ascension of the Lord',
    'EW08-Pentecost': 'Pentecost Sunday', 'OW00-Trinity': 'The Most Holy Trinity', 'OW00-CorpusChristi': 'The Most Holy Body and Blood of Christ',
    'OW00-SacredHeart': 'The Most Sacred Heart of Jesus', 'OW00-ImmaculateHeart': 'The Immaculate Heart of the Blessed Virgin Mary',
    'OW00-MaryMotherofChurch': 'The Blessed Virgin Mary, Mother of the Church', 'Nativity of the Lord': 'The Nativity of the Lord (Christmas)',
    'All Souls': 'The Commemoration of All the Faithful Departed (All Souls)', 'All Saints': 'All Saints',
    'Blessed Virgin Mary, the Mother of God': 'Mary, the Holy Mother of God',
}
OCTAVE = {29: 'Fifth', 30: 'Sixth', 31: 'Seventh'}


def title_for(code, d):
    base = re.sub(r' [ABC12]$', '', code)
    if base in SPECIAL:
        return SPECIAL[base]
    m = re.match(r'^(AW|LW|EW|OW)(\d\d)-(0Sun|[1-6][A-Za-z]{3})$', base)
    if m:
        season, wk, day = m.group(1), int(m.group(2)), m.group(3)
        sname = {'AW': 'Advent', 'LW': 'Lent', 'EW': 'Easter', 'OW': 'Ordinary Time'}[season]
        if season == 'LW' and wk == 0:
            return f'{DAYS[day]} after Ash Wednesday'
        if season == 'LW' and wk == 6:
            return f'{DAYS[day]} of Holy Week'
        if season == 'EW' and wk == 1:
            return f'{DAYS[day]} within the Octave of Easter'
        if day == '0Sun':
            return f'{ORD(wk)} Sunday {"in" if season == "OW" else "of"} {sname}'
        return f'{DAYS[day]} of the {ORD(wk)} Week {"in" if season == "OW" else "of"} {sname}'
    m = re.match(r'^AW05-Dec(\d+)$', base)
    if m:
        return f'{d.strftime("%A")}, {int(m.group(1))} December (Advent weekday)'
    m = re.match(r'^CW01-Dec(\d+)$', base)
    if m:
        return f'{OCTAVE.get(int(m.group(1)), "")} Day within the Octave of the Nativity of the Lord'.strip()
    m = re.match(r'^CW02-Jan(\d+)$', base)
    if m:
        return f'{d.strftime("%A")} of Christmas Time ({int(m.group(1))} January)'
    if re.match(r'^CW03-Day\d$', base):
        return f'{d.strftime("%A")} after the Epiphany'
    return code[0].upper() + code[1:]


def day_type(entry, code, d):
    t = entry.get('type')
    if t == 'Solemnity':
        return 'Solemnity'
    if t in ('Feast', 'Feast-Lord'):
        return 'Feast'
    if t in ('Mem', 'Mem-Mary'):
        return 'Memorial'
    if code.startswith(('CW01-HolyFamily', 'CW04-Baptism')):
        return 'Feast'
    if d.weekday() == 6:
        return 'Sunday'
    return 'Weekday'


SEASON = {'AW': 'Advent', 'CW': 'Christmas', 'LW': 'Lent', 'EW': 'Easter', 'OW': 'Ordinary Time'}
COLOUR = {'green': 'Green', 'white': 'White', 'red': 'Red', 'purple': 'Violet', 'violet': 'Violet', 'rose': 'Rose', 'black': 'Black'}

# ---------------------------------------------------------------- refrains
db = sqlite3.connect(SQLITE)
REFRAIN = {}
for ref, used, intro in db.execute('select refKey, usedBy, introRes from readings__text'):
    if '§' in (intro or ''):
        tail = intro.split('§')[-1].strip()
        REFRAIN.setdefault(ref, {})[used] = tail


def refrain_for(tamil_ref, day_code, psalm_stanzas):
    opts = REFRAIN.get(tamil_ref, {})
    base = re.sub(r' [ABC12]$', '', day_code)
    tail = opts.get(day_code) or opts.get(base) or next(iter(opts.values()), None)
    if not tail:
        return None, None
    alleluia = False
    if 'அல்லது' in tail:
        tail, alt = tail.split('அல்லது', 1)
        alleluia = 'அல்லேலூயா' in alt
    tail = tail.strip()
    if not tail and alleluia:
        return 'Alleluia.', None
    cf = 'காண்க' in tail
    tail = tail.replace('காண்க', '').strip().rstrip('.')
    seg0 = psalm_stanzas[0][0]
    book, chap = seg0[0], seg0[1]
    t = tail.replace(' ', '')
    if re.match(r'^\d?[\u0B80-\u0BFF]', t):
        ref = t
    elif ':' in t:
        ref = book + t
    else:
        ref = f'{book}{chap}:{t}'
    p = parse_ref(ref)
    if not p or not p[1]:
        return ('Alleluia.' if alleluia else None), None
    words = []
    for st in p[1]:
        for seg in st:
            for dra_key, dr_key, c, v, letters in seg_verses(seg):
                vt = verse_text(dra_key, dr_key, c, v)
                if vt:
                    words.append(half(vt, letters))
    if not words:
        return None, None
    resp = ' '.join(words)
    resp = re.sub(r'[,;:]$', '.', resp)
    if alleluia:
        resp += ' (or: Alleluia.)'
    return resp, ('cf. ' if cf else '') + fmt_ref(False, p[1])


# ---------------------------------------------------------------- build
PASSAGES = {}


def passage(kind, tamil_ref, day_code=''):
    p = parse_ref(tamil_ref)
    if not p:
        return None
    cf, stanzas = p
    if not stanzas:
        return None
    ref = fmt_ref(cf, stanzas)
    key = f'{kind}|{ref}'
    if kind == 'psalm':
        key = f'{kind}|{ref}|{day_code}'
    if key in PASSAGES:
        return key
    book = stanzas[0][0][0]
    if kind == 'psalm':
        lines = text_for(stanzas, psalm=True)
        resp, resp_v = refrain_for(tamil_ref, day_code, stanzas)
        body = '\n'.join(' '.join(st) + ('\nR. ' + resp if resp else '') for st in lines)
        note = None
        if book == 'திபா':
            n = stanzas[0][0][1]
            dn = psalm_to_dr(n, 1)[0]
            if dn != n:
                note = f'(Douay-Rheims Psalm {dn})'
        PASSAGES[key] = {'ref': ref, 'response': resp, 'text': body + (f'\n\n{note}' if note else ''),
                         'check': book == 'திபா' and stanzas[0][0][1] in PSALM_IRREGULAR}
    elif kind == 'accl':
        PASSAGES[key] = {'ref': ref, 'text': text_for(stanzas, partial=True)}
    else:
        name = BOOKS[book][0]
        PASSAGES[key] = {'ref': ref, 'text': f'{intro_for(name)}\n\n{text_for(stanzas)}',
                         'check': book in ('எஸ்(கி)', 'சீஞா', 'தோபி')}
    return key


def pick(readings, group):
    keys = sorted((k for k in readings if re.match(rf'^{group}(\.\d+)?$', k)), key=lambda k: float(k))
    return [readings[k] for k in keys]


def build_day(d, entries):
    main = entries[0]
    code = main['code']
    readings = main.get('readings', {})
    remarks = []
    # several Masses: use the Mass during the Day
    if readings and all(isinstance(v, dict) for v in readings.values()):
        if 'Day' in readings:
            if 'Vigil' in readings:
                remarks.append('Readings for the Mass during the Day. The Vigil Mass has its own readings.')
            readings = readings['Day']
        else:
            last = list(readings)[-1]
            readings = readings[last]
            remarks.append('Readings for the Mass during the Day. The Vigil, Night and Dawn Masses have their own readings.')
    celebrant = main
    for e in entries[1:]:
        if e.get('type') in ('Mem', 'Mem-Mary', 'Feast', 'Solemnity') and float(e.get('rank', 99)) < float(main.get('rank', 99)):
            celebrant = e
            break
    optional = [e['code'] for e in entries[1:] if e.get('type') == 'OpMem' and not e['code'].startswith('LW06-4Thu')]
    if any(e['code'] == 'LW06-4Thu~Chrism' for e in entries):
        remarks.append('The Chrism Mass (Isaiah 61; Psalm 89; Revelation 1:5-8; Luke 4:16-21) is celebrated by the bishop, usually this morning.')
    VARIES = {
        'CW03-Epiphany': 'In countries where the Epiphany is a holy day on 6 January, it is celebrated on that date instead.',
        'EW07-Ascension': 'In many countries the Ascension is moved to the following Sunday (the Seventh Sunday of Easter). Please follow your local diocese.',
        'OW00-CorpusChristi': 'In some countries Corpus Christi is celebrated on the Thursday before this Sunday.',
    }
    if code in VARIES:
        remarks.append(VARIES[code])
    if optional:
        remarks.append('Optional memorial: ' + '; '.join(c[0].upper() + c[1:] for c in optional) + '.')

    vigil = code == 'LW06-6Sat'
    out = {
        'title': title_for(celebrant['code'], d),
        'day_type': day_type(celebrant, celebrant['code'], d) if celebrant is not main or main.get('type') else day_type(main, code, d),
        'season': SEASON.get(code[:2]),
        'vestment': COLOUR.get(celebrant.get('color') or main.get('color'), None),
    }
    if code.startswith('LW06') or code == 'LW06-6Sat':
        out['season'] = 'Holy Week'
    if out['season'] is None and code.startswith('OW00'):
        out['season'] = 'Ordinary Time'

    firsts, psalms, seconds = pick(readings, '1'), pick(readings, '2'), pick(readings, '3')
    accl, gospels, proc, seq = pick(readings, '5'), pick(readings, '6'), pick(readings, '0'), pick(readings, '4')
    if vigil:
        # Easter Vigil: first reading Genesis, psalm 104, the Epistle as second reading, Psalm 118 before the Gospel.
        epistle = readings.get('1.8')
        others = [readings[k] for k in sorted(readings, key=float) if re.match(r'^1\.[2-7]$', k)]
        firsts = [readings.get('1.1')]
        seconds = [epistle] if epistle else []
        psalms = [readings.get('2.1')]
        names = [fmt_ref(*parse_ref(r)) for r in others if parse_ref(r)]
        remarks.append('Other Old Testament readings tonight: ' + '; '.join(names) + '. After the Epistle: Psalm 118:1-2, 16-17, 22-23 with Alleluia.')
    if proc:
        p = parse_ref(proc[0])
        if p:
            remarks.append(f'Gospel for the Procession with Palms: {fmt_ref(*p)}.')
    if seq:
        remarks.append(f'Sequence: {SEQUENCE.get(seq[0], seq[0])}.')
    if len(gospels) > 1:
        p = parse_ref(gospels[1])
        if p:
            remarks.append(f'Shorter form of the Gospel: {fmt_ref(*p)}.')
    if len(seconds) > 1 and not vigil:
        p = parse_ref(seconds[1])
        if p:
            remarks.append(f'Alternative second reading: {fmt_ref(*p)}.')

    out['first'] = passage('reading', firsts[0]) if firsts and firsts[0] else None
    out['psalm'] = passage('psalm', psalms[0], code) if psalms and psalms[0] else None
    out['second'] = passage('reading', seconds[0]) if seconds and seconds[0] else None
    out['gospel'] = passage('reading', gospels[0]) if gospels else None
    lent = code.startswith('LW') and code not in ('LW06-6Sat',)
    if accl:
        a = accl[0]
        k = passage('accl', a)
        if k:
            out['accl'] = k
        elif a in ACCLAIM:
            PASSAGES[f'accl|{a}'] = {'ref': '', 'text': ACCLAIM[a]}
            out['accl'] = f'accl|{a}'
    out['lent'] = lent
    out['remarks'] = ' '.join(remarks) or None
    out['check'] = any(PASSAGES.get(out.get(k) or '', {}).get('check') for k in ('first', 'psalm', 'second', 'gospel'))
    return {k: v for k, v in out.items() if v not in (None, False)}


os.makedirs(OUT, exist_ok=True)
for f in sorted(glob.glob(os.path.join(CAL_DIR, '[0-9][0-9][0-9][0-9].json'))):
    year = int(os.path.basename(f)[:4])
    cal = json.load(open(f))
    days = {}
    for m, md in cal.items():
        for dd, entries in md.items():
            d = date(year, int(m), int(dd))
            days[d.isoformat()] = build_day(d, entries)
    json.dump(dict(sorted(days.items())), open(os.path.join(OUT, f'days-{year}.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
json.dump(PASSAGES, open(os.path.join(OUT, 'passages.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print('passages', len(PASSAGES), 'missing verses', len(set(MISSING)))
for x in sorted(set(MISSING))[:80]:
    print('  missing', x)
