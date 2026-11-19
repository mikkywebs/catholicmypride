import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { cacheLife, cacheTag } from 'next/cache'
import type { Saint } from './types'

// Saints of the General Roman Calendar, prepared for Saint of the Day. See scripts/saints/.
type Entry = { kind?: 'celebration'; name: string; date: string; feast_label: string; celebration: string; born: string | null; died: string | null; patronage: string[]; life_md: string; prayer_md: string }
type File = { saints: Record<string, Entry>; byDate: Record<string, string[]> }

let file: Promise<File> | null = null
const load = () => (file ??= readFile(path.join(process.cwd(), 'data', 'saints', 'saints.json'), 'utf8').then((t) => JSON.parse(t) as File).catch((): File => ({ saints: {}, byDate: {} })))

export const CELEBRATION_ORDER: Record<string, number> = { Solemnity: 0, Feast: 1, Memorial: 2, 'Optional Memorial': 3 }

function toSaint(slug: string, e: Entry, year: number): Saint {
  return {
    id: `calendar-${slug}`, slug, kind: e.kind ?? 'saint', name: e.name, show_on: `${year}-${e.date}`, feast_label: e.feast_label, celebration: e.celebration,
    featured_image: null, image_alt: null, born: e.born, died: e.died, canonised: null, patronage: e.patronage,
    life_md: e.life_md, quote: null, prayer_md: e.prayer_md,
    seo_title: `${e.name}: ${e.kind === 'celebration' ? 'Feast' : 'Saint of the Day'}, ${e.feast_label}`.slice(0, 70),
    seo_description: `${e.name} (${e.celebration}, ${e.feast_label}): ${e.kind === 'celebration' ? 'what the Church celebrates' : 'life story'}${e.patronage.length ? `, patron of ${e.patronage.slice(0, 3).join(', ')}` : ''}, and a prayer.`.slice(0, 160),
  } as Saint
}

/** The saints the Church celebrates on a date, most important first. */
export async function calendarSaintsFor(date: string): Promise<Saint[]> {
  'use cache'
  cacheLife('max')
  cacheTag('saints-calendar')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return []
  const f = await load()
  return (f.byDate[date.slice(5)] ?? []).map((slug) => toSaint(slug, f.saints[slug], Number(date.slice(0, 4))))
}

/** One saint by web address, dated in the given year. */
export async function calendarSaint(slug: string, year: number): Promise<Saint | null> {
  'use cache'
  cacheLife('max')
  cacheTag('saints-calendar')
  const f = await load()
  const e = f.saints[slug]
  return e ? toSaint(slug, e, year) : null
}

/** Fields for saving a calendar saint in the database. */
export async function calendarSaintRow(slug: string, date: string) {
  const s = await calendarSaint(slug, Number(date.slice(0, 4)))
  if (!s) return null
  const row: Record<string, unknown> = { ...s, show_on: date }
  delete row.id
  return row
}
