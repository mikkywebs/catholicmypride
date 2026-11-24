import 'server-only'
// Daily blog ideas from the Church calendar: what Catholics will be searching for in 3–7 days.
import { getNovenas, getReading, getSaintsForDate } from './data'
import { addDays, formatLong, liturgicalInfo } from './liturgical'
import { currentCycle, novenaFirstDate } from './novena-days'
import { slugify } from './format'
import type { Saint } from './types'

export type BlogIdea = {
  key: string
  /** What the idea is about (a saint, feast or novena name), to spot posts already written on it. */
  topic: string
  kind: 'feast' | 'saint' | 'sunday' | 'novena' | 'season'
  eventDate: string
  publishBy: string
  title: string
  slug: string
  seoTitle: string
  seoDescription: string
  focusKeyword: string
  keywords: string[]
  category: string
  tags: string[]
  why: string
  outlineMd: string
  links: { label: string; href: string }[]
  faqs: string[]
  image: string
  imageAlt: string
  /** Importance (solemnity 100 … optional memorial 30) and ideal days ahead to publish. */
  weight: number
  lead: number
  score: number
}

const SITE = 'https://www.catholicmypride.org'
const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(' ', n - 1))}…`)
const year = (d: string) => d.slice(0, 4)
const plain = (md: string | null | undefined) => (md ?? '').replace(/[#*_>`\[\]]/g, '').replace(/\(([^)]*)\)/g, '').replace(/\s+/g, ' ').trim()
const firstSentence = (s: string) => (s.match(/^[^.!?]+[.!?]/)?.[0] ?? s).trim()
const RANK: Record<string, number> = { Solemnity: 100, Feast: 80, Memorial: 50, 'Optional Memorial': 30, 'Local Memorial': 35 }

/** True when one of your post titles is already about this topic (e.g. “Saint Andrew the Apostle: His Life…”). */
export function covered(topic: string, titles: string[]) {
  const t = topic.toLowerCase().replace(/^the /, '').trim()
  return t.length > 3 && titles.some((x) => x.toLowerCase().includes(t))
}

/** Ideas whose event falls 3–7 days after `today`, best first.
 *  Left out: ideas whose key or web address is in `exclude` (drafted or skipped), and topics a post title already covers. */
export async function ideasFor(today: string, limit = 3, exclude: Set<string> = new Set(), titles: string[] = []): Promise<BlogIdea[]> {
  const all: BlogIdea[] = []
  const novenas = await getNovenas()
  for (let ahead = 3; ahead <= 7; ahead++) {
    const date = addDays(today, ahead)
    const [saints, reading] = await Promise.all([getSaintsForDate(date), getReading(date)])
    const info = liturgicalInfo(date)
    for (const s of saints.slice(0, 2)) all.push(saintIdea(s, date, today, ahead))
    if (new Date(`${date}T12:00:00Z`).getUTCDay() === 0 && reading) all.push(sundayIdea(reading, date, today, ahead))
    for (const n of novenas.map((x) => currentCycle(x, date))) {
      if (novenaFirstDate(n) === date) all.push(novenaIdea(n.title, n.slug, n.feast_name, date, today, ahead))
    }
    const prev = liturgicalInfo(addDays(date, -1)).season
    if (prev !== info.season && ['Advent', 'Lent', 'Christmas', 'Easter', 'Holy Week'].includes(info.season)) all.push(seasonIdea(info.season, date, today, ahead))
  }
  // Score: importance, plus a bonus when today is the ideal time to publish it. Topics already drafted are skipped.
  for (const i of all) {
    const ahead = Math.round((Date.parse(i.eventDate) - Date.parse(today)) / 86_400_000)
    i.score = i.weight + 12 - 4 * Math.abs(ahead - i.lead)
  }
  const due = all.filter((i) => !exclude.has(i.slug) && !exclude.has(i.key) && !covered(i.topic, titles))
  // Best first, one idea per event, and a mix of kinds.
  const seen = new Set<string>()
  const picked: BlogIdea[] = []
  for (const i of due.sort((a, b) => b.score - a.score)) {
    if (seen.has(i.key)) continue
    if (picked.filter((p) => p.kind === i.kind).length >= 2) continue
    seen.add(i.key); picked.push(i)
    if (picked.length === limit) break
  }
  return picked
}

function base(eventDate: string, today: string) {
  return { eventDate, publishBy: today }
}

function saintIdea(s: Saint, date: string, today: string, ahead: number): BlogIdea {
  const isEvent = s.kind === 'celebration'
  const name = s.name
  const rank = s.celebration ?? (isEvent ? 'Feast' : 'Memorial')
  const day = formatLong(date).replace(/^\w+, /, '')
  const focus = isEvent ? name.replace(/^The /, '').toLowerCase() : `${name.toLowerCase()} feast day`
  const title = isEvent ? clip(`${name}: Meaning, History and Prayer`, 70) : clip(`${name}: Life, Feast Day and Prayer`, 70)
  const story = firstSentence(plain(s.life_md))
  const outline = isEvent
    ? [
        `**Write by ${formatLong(today)} · celebrated ${formatLong(date)} (${rank})**`,
        `## What is ${name}?`, `- In two or three sentences, explain what the Church celebrates on ${day}.${story ? ` Start from: “${story}”` : ''}`,
        '## The history behind the feast', '- When and why it began; any pope or council connected with it.',
        '## What the Bible and the Church teach', '- Quote one Scripture passage (Douay-Rheims) and one line of the Catechism.',
        `## How to celebrate ${name} today`, '- Mass, a prayer at home, a family custom, a work of mercy.',
        '## A prayer for the day', '- Write a short original prayer (6–8 lines).',
        `## Pray with us`, `- Link to today’s Mass readings and the Feast of the Day page; invite readers to the WhatsApp Channel.`,
      ]
    : [
        `**Write by ${formatLong(today)} · feast day ${formatLong(date)} (${rank})**`,
        `## Who was ${name}?`, `- Born, died, where, and why the Church remembers them.${story ? ` Start from: “${story}”` : ''}`,
        `## The life of ${name}`, '- Three or four key moments; keep it accurate and give sources.',
        '## Miracles, patronage and symbols', `- Patron of: ${(s.patronage ?? []).join(', ') || 'check reliable sources'}; how they are shown in art.`,
        `## What ${name} teaches us today`, '- One lesson for ordinary Catholics, with a practical step.',
        `## Prayer to ${name}`, s.prayer_md ? `- Use or adapt the prayer on our Feast of the Day page.` : '- Write a short original prayer asking for their intercession.',
      ]
  return {
    key: `saint:${s.slug}:${date}`, topic: name, kind: isEvent ? 'feast' : 'saint', ...base(date, today),
    title, slug: slugify(`${name} ${isEvent ? 'meaning history prayer' : 'life feast day prayer'}`).slice(0, 80),
    seoTitle: clip(isEvent ? `${name} ${year(date)}: Meaning and Prayer` : `${name}: Life, Feast Day (${day}) and Prayer`, 60),
    seoDescription: clip(isEvent
      ? `What is ${name}? Discover its meaning and history, how Catholics celebrate it on ${day}, and a prayer for the day.`
      : `Who was ${name}? Read the life, miracles and patronage of ${name}, whose feast is ${day}, with a prayer for their intercession.`, 155),
    focusKeyword: focus,
    keywords: isEvent ? [`${name.toLowerCase()} ${year(date)}`, `${name.toLowerCase()} meaning`, `${name.toLowerCase()} prayer`, `${day.toLowerCase()} feast`] : [`${name.toLowerCase()} prayer`, `${name.toLowerCase()} biography`, `${name.toLowerCase()} patron saint of`, `${day.toLowerCase()} saint`],
    category: isEvent ? 'Feasts' : 'Saints', tags: isEvent ? ['feast', rank.toLowerCase(), 'catholic calendar'] : ['saints', 'feast day', 'prayer'],
    why: `${rank} on ${formatLong(date)}. People search for it in the days before, so publishing ${ahead} days early gives Google time to find it.`,
    outlineMd: outline.join('\n\n'),
    links: [{ label: `Saint of the Day: ${name}`, href: `${SITE}/saint-of-the-day/${s.slug}` }, { label: `Mass readings for ${day}`, href: `${SITE}/mass-readings/${date}` }, { label: 'Send a prayer request', href: `${SITE}/prayer-requests` }],
    faqs: isEvent ? [`When is ${name}?`, `Is ${name} a holy day of obligation?`, `What is the meaning of ${name}?`] : [`When is the feast day of ${name}?`, `What is ${name} the patron saint of?`, `How do I pray to ${name}?`],
    image: s.featured_image ? 'Use the featured image of our Feast of the Day page' : `A respectful image of ${name} (public domain or your own)`,
    imageAlt: `${name}${isEvent ? '' : ', Catholic saint'} — Catholic My Pride`,
    weight: RANK[rank] ?? 40, lead: (RANK[rank] ?? 40) >= 80 ? 7 : (RANK[rank] ?? 40) >= 45 ? 4 : 3, score: 0,
  }
}

function sundayIdea(r: { title: string | null; gospel_ref: string | null; gospel_text: string | null; first_ref: string | null; psalm_ref: string | null; second_ref: string | null }, date: string, today: string, ahead: number): BlogIdea {
  const sunday = r.title ?? `Sunday ${formatLong(date)}`
  const verse = firstSentence(plain(r.gospel_text))
  const theme = verse ? clip(verse.replace(/^(At that time|In that time)[,:]?\s*/i, ''), 50) : 'Sunday Gospel'
  return {
    key: `sunday:${date}`, topic: '', kind: 'sunday', ...base(date, today),
    title: clip(`${sunday}: Gospel Reflection (${r.gospel_ref ?? 'Gospel'})`, 75),
    slug: slugify(`${sunday} gospel reflection ${year(date)}`).slice(0, 80),
    seoTitle: clip(`${sunday} ${year(date)}: Gospel Reflection`, 60),
    seoDescription: clip(`A reflection on the Gospel for the ${sunday} (${formatLong(date)}): ${r.gospel_ref ?? ''}. Readings, meaning and a prayer for the week.`, 155),
    focusKeyword: `${sunday.toLowerCase()} gospel reflection`,
    keywords: [`${sunday.toLowerCase()} readings`, `gospel reflection ${formatLong(date).replace(/^\w+, /, '').toLowerCase()}`, `${(r.gospel_ref ?? '').toLowerCase()} reflection`, 'sunday homily ideas'],
    category: 'Reflections', tags: ['sunday gospel', 'reflection', 'mass readings'],
    why: `Sunday Mass is on ${formatLong(date)}. Catholics, catechists and preachers search for the readings and reflections during the week before.`,
    outlineMd: [
      `**Write by ${formatLong(today)} · for ${formatLong(date)}**`,
      `## The readings at a glance`, `- First Reading: ${r.first_ref ?? '—'} · Psalm: ${r.psalm_ref ?? '—'} · Second Reading: ${r.second_ref ?? '—'} · Gospel: ${r.gospel_ref ?? '—'}`,
      `## What happens in the Gospel`, `- Retell the passage simply.${verse ? ` Key line: “${verse}”` : ''}`,
      '## What it meant then', '- The setting and the people; one fact that helps understand it.',
      '## What it means for us today', '- One clear message; a real-life example; how the first reading prepares for the Gospel.',
      '## Living it this week', '- Three practical steps.',
      '## A prayer for the week', '- A short original prayer drawn from the readings.',
    ].join('\n\n'),
    links: [{ label: 'Full readings', href: `${SITE}/mass-readings/${date}` }, { label: 'Daily prayer', href: `${SITE}/daily-prayers` }],
    faqs: [`What are the readings for the ${sunday}?`, `What is the message of ${r.gospel_ref ?? 'this Sunday’s Gospel'}?`],
    image: 'A calm image of an open Bible or the Gospel scene (your own or public domain)',
    imageAlt: `Gospel reflection for the ${sunday} — Catholic My Pride`,
    weight: 60, lead: 5, score: 0,
  }
}

function novenaIdea(title: string, slug: string, feast: string | null, date: string, today: string, ahead: number): BlogIdea {
  return {
    key: `novena:${slug}:${date}`, topic: title, kind: 'novena', ...base(date, today),
    title: clip(`${title}: When to Start and How to Pray It`, 75),
    slug: slugify(`${title} when to start how to pray ${year(date)}`).slice(0, 80),
    seoTitle: clip(`${title} ${year(date)}: Start Date and Prayers`, 60),
    seoDescription: clip(`The ${title} begins on ${formatLong(date)}${feast ? `, preparing for ${feast}` : ''}. Learn its history, how to pray it day by day, and join us in prayer.`, 155),
    focusKeyword: `${title.toLowerCase()}`,
    keywords: [`${title.toLowerCase()} ${year(date)}`, `when to start ${title.toLowerCase()}`, `${title.toLowerCase()} prayer`, `${title.toLowerCase()} day 1`],
    category: 'Prayer', tags: ['novena', 'prayer', ...(feast ? [feast.toLowerCase()] : [])],
    why: `It starts on ${formatLong(date)}. “When does the novena start?” searches rise in the days before.`,
    outlineMd: [
      `**Write by ${formatLong(today)} · novena begins ${formatLong(date)}**`,
      `## What is the ${title}?`, '- Its origin and the feast it prepares for.',
      '## When to start (dates)', `- First day: ${formatLong(date)}. List all the days.`,
      '## How to pray it', '- Simple daily steps; link to our day-by-day novena page.',
      '## Intentions to bring', '- Suggest intentions; invite readers to send a prayer request.',
      '## Join the Catholic My Pride family', '- Invite readers to pray together and to our WhatsApp Channel.',
    ].join('\n\n'),
    links: [{ label: `Pray the ${title}`, href: `${SITE}/novenas/${slug}` }, { label: 'Send a prayer request', href: `${SITE}/prayer-requests` }],
    faqs: [`When does the ${title} start?`, `Can I start a novena late?`, `How many times a day do I pray it?`],
    image: 'Use the novena’s featured image',
    imageAlt: `${title} — Catholic My Pride`,
    weight: 85, lead: 6, score: 0,
  }
}

function seasonIdea(season: string, date: string, today: string, ahead: number): BlogIdea {
  const name = season === 'Holy Week' ? 'Holy Week' : season
  const how: Record<string, string> = { Advent: 'Prepare for Christmas', Lent: 'Make the Most of Lent', Christmas: 'Celebrate Christmas as a Catholic', Easter: 'Live the Easter Season', 'Holy Week': 'Pray Through Holy Week' }
  return {
    key: `season:${season}:${date}`, topic: '', kind: 'season', ...base(date, today),
    title: clip(`${name} ${year(date)}: How to ${how[season] ?? `Live ${name}`}`, 75),
    slug: slugify(`${name} ${year(date)} catholic guide`).slice(0, 80),
    seoTitle: clip(`${name} ${year(date)}: A Catholic Guide`, 60),
    seoDescription: clip(`${name} begins on ${formatLong(date)}. What it means, its traditions, and simple ways for Catholic families to live it well this year.`, 155),
    focusKeyword: `${name.toLowerCase()} ${year(date)}`,
    keywords: [`what is ${name.toLowerCase()}`, `${name.toLowerCase()} traditions`, `${name.toLowerCase()} for families`, `when does ${name.toLowerCase()} start`],
    category: 'Seasons', tags: [name.toLowerCase(), 'liturgical year', 'catholic family'],
    why: `${name} begins on ${formatLong(date)}. This is one of the most searched Catholic topics of the year.`,
    outlineMd: [
      `**Write by ${formatLong(today)} · ${name} begins ${formatLong(date)}**`,
      `## What is ${name}?`, '- Meaning, length and liturgical colour.',
      `## ${name} traditions`, '- Three or four customs (e.g. the Advent wreath, Stations of the Cross).',
      '## Ideas for families', '- Simple practices with children.',
      `## Praying ${name} with Catholic My Pride`, '- Our novenas, daily prayers and readings for the season.',
    ].join('\n\n'),
    links: [{ label: 'Daily Mass readings', href: `${SITE}/mass-readings` }, { label: 'Novenas', href: `${SITE}/novenas` }],
    faqs: [`When does ${name} start in ${year(date)}?`, `What colour is used in ${name}?`, `How long is ${name}?`],
    image: `A seasonal image for ${name} (your own or public domain)`,
    imageAlt: `${name} ${year(date)} — Catholic My Pride`,
    weight: 95, lead: 7, score: 0,
  }
}
