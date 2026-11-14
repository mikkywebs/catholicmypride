// Liturgical calendar helpers (Roman Rite, general calendar).
// Season, Sunday cycle (A/B/C) and weekday cycle (I/II) are derived from the date.

export type Season = 'Advent' | 'Christmas' | 'Ordinary Time' | 'Lent' | 'Holy Week' | 'Easter'

const DAY = 86_400_000

function utc(y: number, m: number, d: number) {
  return Date.UTC(y, m - 1, d)
}

/** Gregorian Easter Sunday (Anonymous Gregorian algorithm). */
export function easter(year: number) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return utc(year, month, day)
}

/** First Sunday of Advent: the Sunday falling between 27 Nov and 3 Dec. */
export function adventStart(year: number) {
  const christmas = utc(year, 12, 25)
  const dow = new Date(christmas).getUTCDay() // 0 = Sunday
  const fourthSunday = christmas - (dow === 0 ? 7 : dow) * DAY
  return fourthSunday - 21 * DAY
}

/** Baptism of the Lord: Sunday after 6 January (general calendar). */
function baptism(year: number) {
  const epiphany = utc(year, 1, 6)
  const dow = new Date(epiphany).getUTCDay()
  return epiphany + (7 - dow) * DAY
}

export function parseISODate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return utc(y, m, d)
}

export function liturgicalInfo(iso: string) {
  const t = parseISODate(iso)
  const year = new Date(t).getUTCFullYear()
  const adv = adventStart(year)
  // The liturgical year is named after the calendar year it ends in.
  const litYear = t >= adv ? year + 1 : year
  const cycle = (['C', 'A', 'B'] as const)[litYear % 3]
  const weekdayCycle = litYear % 2 === 0 ? 'II' : 'I'

  const e = easter(year)
  const ash = e - 46 * DAY
  const palm = e - 7 * DAY
  const pentecost = e + 49 * DAY

  let season: Season
  if (t >= adv && t < utc(year, 12, 25)) season = 'Advent'
  else if (t >= utc(year, 12, 25) || t <= baptism(year)) season = 'Christmas'
  else if (t >= ash && t < palm) season = 'Lent'
  else if (t >= palm && t < e) season = 'Holy Week'
  else if (t >= e && t <= pentecost) season = 'Easter'
  else season = 'Ordinary Time'

  const vestment =
    season === 'Advent' || season === 'Lent' ? 'Violet'
    : season === 'Holy Week' ? 'Red'
    : season === 'Christmas' || season === 'Easter' ? 'White'
    : 'Green'

  return { season, cycle, weekdayCycle, vestment }
}

export const VESTMENT_HEX: Record<string, string> = {
  White: '#FFFFFF',
  Red: '#B91C1C',
  Green: '#2E7D4F',
  Violet: '#6B3FA0',
  Rose: '#E8A0B4',
  Black: '#1F2430',
  Gold: '#C9A227',
}

/** Today's date (YYYY-MM-DD) in the site's time zone. */
export function todayISO(timeZone = process.env.SITE_TIMEZONE || 'Africa/Lagos') {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export function addDays(iso: string, n: number) {
  return new Date(parseISODate(iso) + n * DAY).toISOString().slice(0, 10)
}

export function formatLong(iso: string) {
  return new Date(parseISODate(iso)).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

export function formatShort(iso: string) {
  return new Date(parseISODate(iso)).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
  })
}
