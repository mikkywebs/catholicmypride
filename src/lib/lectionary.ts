import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { cacheLife, cacheTag } from 'next/cache'
import { formatLong } from './liturgical'
import type { Reading } from './types'

// Daily readings prepared from the lectionary (see data/lectionary/README.md).
type Day = {
  title: string; day_type?: string; season?: string; vestment?: string
  first?: string; psalm?: string; second?: string; accl?: string; gospel?: string
  lent?: boolean; remarks?: string; check?: boolean
}
type Passage = { ref: string; text: string; response?: string | null; check?: boolean }

const DIR = path.join(process.cwd(), 'data', 'lectionary')
const years = new Map<number, Promise<Record<string, Day> | null>>()
let passages: Promise<Record<string, Passage>> | null = null

function loadYear(y: number) {
  if (!years.has(y)) {
    years.set(y, readFile(path.join(DIR, `days-${y}.json`), 'utf8').then((t) => JSON.parse(t) as Record<string, Day>).catch(() => null))
  }
  return years.get(y)!
}
function loadPassages() {
  passages ??= readFile(path.join(DIR, 'passages.json'), 'utf8').then((t) => JSON.parse(t) as Record<string, Passage>).catch(() => ({}))
  return passages
}

export type LectionaryFields = Pick<Reading,
  'title' | 'day_type' | 'season' | 'vestment' | 'first_ref' | 'first_text' | 'psalm_ref' | 'psalm_response' | 'psalm_text' |
  'second_ref' | 'second_text' | 'acclamation_ref' | 'acclamation_text' | 'gospel_ref' | 'gospel_text' | 'remarks_md' |
  'seo_title' | 'seo_description'> & { needs_check: boolean }

/** The day's readings from the lectionary, or null outside the years prepared. */
export async function lectionaryFields(date: string): Promise<LectionaryFields | null> {
  'use cache'
  cacheLife('max')
  cacheTag('lectionary')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const day = (await loadYear(Number(date.slice(0, 4))))?.[date]
  if (!day) return null
  const P = await loadPassages()
  const get = (k?: string) => (k ? P[k] : undefined)
  const first = get(day.first), psalm = get(day.psalm), second = get(day.second), accl = get(day.accl), gospel = get(day.gospel)
  const wrap = (t: string) => (day.lent
    ? `Glory and praise to you, Lord Jesus Christ!\n${t}\nGlory and praise to you, Lord Jesus Christ!`
    : `Alleluia, alleluia!\n${t}\nAlleluia!`)
  const long = formatLong(date)
  const refs = [first?.ref, psalm?.ref && psalm.ref.replace(/:.*/, ''), second?.ref, gospel?.ref].filter(Boolean).join('; ')
  return {
    title: day.title,
    day_type: day.day_type ?? null,
    season: day.season ?? null,
    vestment: day.vestment ?? null,
    first_ref: first?.ref ?? null,
    first_text: first?.text ?? null,
    psalm_ref: psalm?.ref ?? null,
    psalm_response: psalm?.response ?? null,
    psalm_text: psalm?.text ?? null,
    second_ref: second?.ref ?? null,
    second_text: second?.text ?? null,
    acclamation_ref: accl?.ref || null,
    acclamation_text: accl ? wrap(accl.text) : null,
    gospel_ref: gospel?.ref ?? null,
    gospel_text: gospel?.text ?? null,
    remarks_md: day.remarks ?? null,
    seo_title: `${day.title}: Mass Readings for ${long}`.slice(0, 70),
    seo_description: `Catholic Mass readings for ${long} (${day.title}): ${refs}.`.slice(0, 160),
    needs_check: Boolean(day.check),
  }
}

/** A full Reading for pages, used when the admin has not saved one for that date. */
export async function lectionaryReading(date: string): Promise<Reading | null> {
  const f = await lectionaryFields(date)
  if (!f) return null
  const fields: Record<string, unknown> = { ...f }
  delete fields.needs_check
  return {
    id: `lectionary-${date}`, date, featured_image: null, image_alt: null,
    reflection_title: null, reflection_md: null,
    focus_keyword: null, keywords: [], noindex: false, status: 'published', published_at: `${date}T00:00:00Z`,
    ...fields,
  } as unknown as Reading
}
