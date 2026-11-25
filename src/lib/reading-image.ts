// Picture for a day's Mass readings: the day's own image, else the admin's seasonal image for that day.
import { adventStart, easter, liturgicalInfo, parseISODate } from './liturgical'

type Img = { url: string; alt: string | null }

/** The seasonal picture slots on the Settings page, in the order they are shown. Keys are stored in homepage_images. */
export const READING_IMAGE_SLOTS = [
  { key: 'reading_ordinary', label: 'Ordinary Time', help: 'Weekdays in Ordinary Time (green).' },
  { key: 'reading_advent', label: 'Advent', help: 'Weekdays in Advent (violet).' },
  { key: 'reading_christmas', label: 'Christmas', help: 'Christmas Day to the Baptism of the Lord.' },
  { key: 'reading_lent', label: 'Lent', help: 'Ash Wednesday to Holy Week. Also used in Holy Week if that is empty.' },
  { key: 'reading_holyweek', label: 'Holy Week (optional)', help: 'Palm Sunday to Holy Saturday.' },
  { key: 'reading_easter', label: 'Easter', help: 'Easter Sunday to Pentecost.' },
  { key: 'reading_sunday', label: 'Sundays', help: 'Every Sunday, in any season.' },
  { key: 'reading_gaudete', label: 'Gaudete Sunday', help: '3rd Sunday of Advent (rose).' },
  { key: 'reading_laetare', label: 'Laetare Sunday', help: '4th Sunday of Lent (rose).' },
] as const

const SEASON_KEY: Record<string, string> = {
  'Ordinary Time': 'reading_ordinary', Advent: 'reading_advent', Christmas: 'reading_christmas',
  Lent: 'reading_lent', 'Holy Week': 'reading_holyweek', Easter: 'reading_easter',
}

const DAY = 86_400_000

/** Which slots fit a date, most special first. */
export function readingImageKeys(date: string): string[] {
  const t = parseISODate(date)
  const year = Number(date.slice(0, 4))
  const keys: string[] = []
  if (t === adventStart(year) + 14 * DAY) keys.push('reading_gaudete')
  if (t === easter(year) - 21 * DAY) keys.push('reading_laetare')
  if (new Date(t).getUTCDay() === 0) keys.push('reading_sunday')
  const season = liturgicalInfo(date).season
  keys.push(SEASON_KEY[season] ?? 'reading_ordinary')
  if (season === 'Holy Week') keys.push('reading_lent')
  return keys
}

/** Day's own image → Gaudete/Laetare → Sunday → season → the old single default. */
export function readingImage(
  date: string,
  own: { featured_image?: string | null; image_alt?: string | null } | null | undefined,
  images: Record<string, Img>,
  fallback?: { url?: string | null; alt?: string | null },
): { url: string | null; alt: string | null } {
  if (own?.featured_image) return { url: own.featured_image, alt: own.image_alt ?? null }
  for (const k of readingImageKeys(date)) if (images[k]?.url) return { url: images[k].url, alt: images[k].alt }
  return { url: fallback?.url ?? null, alt: fallback?.alt ?? null }
}

/** Daily prayer pictures, one for each day of the week (Settings › Daily prayers: pictures by day). */
export const PRAYER_IMAGE_SLOTS = [
  { key: 'prayer_mon', label: 'Monday' }, { key: 'prayer_tue', label: 'Tuesday' }, { key: 'prayer_wed', label: 'Wednesday' },
  { key: 'prayer_thu', label: 'Thursday' }, { key: 'prayer_fri', label: 'Friday' }, { key: 'prayer_sat', label: 'Saturday' },
  { key: 'prayer_sun', label: 'Sunday' },
] as const

const WEEKDAY_KEY = ['prayer_sun', 'prayer_mon', 'prayer_tue', 'prayer_wed', 'prayer_thu', 'prayer_fri', 'prayer_sat']

/** Prayer's own image → that weekday's picture → the old single default. */
export function prayerImage(
  date: string,
  own: { featured_image?: string | null; image_alt?: string | null } | null | undefined,
  images: Record<string, Img>,
  fallback?: { url?: string | null; alt?: string | null },
): { url: string | null; alt: string | null } {
  if (own?.featured_image) return { url: own.featured_image, alt: own.image_alt ?? null }
  const k = WEEKDAY_KEY[new Date(parseISODate(date)).getUTCDay()]
  if (images[k]?.url) return { url: images[k].url, alt: images[k].alt }
  return { url: fallback?.url ?? null, alt: fallback?.alt ?? null }
}
