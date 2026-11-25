import { addDays } from './liturgical'
import type { Novena } from './types'

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

/** Number of numbered days or weeks (9 unless the admin set another number). */
export const novenaLength = (n: Pick<Novena, 'days_count'>) => Math.min(60, Math.max(1, n.days_count || 9))
/** Days between two numbered days: 1 for a normal novena, 7 for a weekly devotion (e.g. the Seven Sundays). */
export const novenaInterval = (n: Pick<Novena, 'weekly_on'>) => (n.weekly_on && WEEKDAYS.includes(n.weekly_on) ? 7 : 1)
/** What one numbered day is called: “Day”, or “Sunday” for a weekly devotion on Sundays. */
export const novenaUnit = (n: Pick<Novena, 'weekly_on'>) => (novenaInterval(n) === 7 ? cap(n.weekly_on!) : 'Day')
/** “9 days”, “7 Sundays”, “13 Tuesdays”. */
export const novenaSpan = (n: Pick<Novena, 'weekly_on' | 'days_count'>) => `${novenaLength(n)} ${novenaInterval(n) === 7 ? `${novenaUnit(n)}s` : 'days'}`

/** Date of Day 1: the date set by the admin; otherwise the novena ends the day before the feast.
 *  A weekly devotion ends on the last chosen weekday before the feast (e.g. the 7th Sunday before 19 March is Day 1). */
export function novenaStart(n: Pick<Novena, 'start_date' | 'feast_date' | 'days_count' | 'weekly_on'>) {
  if (n.start_date) return n.start_date
  const len = novenaLength(n)
  if (novenaInterval(n) === 7) {
    const feastDow = new Date(`${n.feast_date}T12:00:00Z`).getUTCDay()
    const back = ((feastDow - WEEKDAYS.indexOf(n.weekly_on!) + 7) % 7) || 7
    return addDays(n.feast_date, -back - 7 * (len - 1))
  }
  return addDays(n.feast_date, -len)
}
/** Date of a numbered day. */
export const novenaDate = (n: Novena, day: number) => addDays(novenaStart(n), (day - 1) * novenaInterval(n))
/** Last numbered day. */
export const novenaEnd = (n: Novena) => novenaDate(n, novenaLength(n))
/** First date anything is prayed (the opening day, if there is one). */
export const novenaFirstDate = (n: Novena) => (n.has_opening ? addDays(novenaStart(n), -1) : novenaStart(n))

/** Today's day: 0 for the opening day, 1…length, or null when the novena is not running. */
export function novenaDay(n: Novena, today: string): number | null {
  if (today < novenaFirstDate(n) || today > novenaEnd(n)) return null
  const start = novenaStart(n)
  if (today < start) return 0
  let day = 1
  for (let d = 1; d <= novenaLength(n); d++) if (novenaDate(n, d) <= today) day = d
  return day
}

const pad = (n: number) => String(n).padStart(2, '0')
function shiftYear(iso: string, years: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const yy = y + years
  const last = new Date(Date.UTC(yy, m, 0)).getUTCDate()
  return `${yy}-${pad(m)}-${pad(Math.min(d, last))}`
}

const shifted = (n: Novena, years: number): Novena =>
  ({ ...n, feast_date: shiftYear(n.feast_date, years), start_date: n.start_date ? shiftYear(n.start_date, years) : null })

/** For a novena that repeats every year: the round that begins in the current calendar year, changing on 1 January.
 *  A round still running on 1 January (e.g. the Epiphany novena, 28 December – 5 January) stays until its feast day has passed.
 *  Other novenas are returned unchanged. */
export function currentCycle(n: Novena, today: string): Novena {
  if (!n.repeats_yearly) return n
  const offset = Number(today.slice(0, 4)) - Number(novenaFirstDate(n).slice(0, 4))
  const thisYear = shifted(n, offset)
  const previous = shifted(n, offset - 1)
  return novenaEnd(previous) >= today || previous.feast_date >= today ? previous : thisYear
}

/** “Day 6 of 25” or “Opening day”. */
export const dayLabel = (n: Novena, day: number) => (day === 0 ? 'Opening day' : `${novenaUnit(n)} ${day} of ${novenaLength(n)}`)

/** Novenas being prayed today, the one ending soonest first. */
export function activeNovenas(list: Novena[], today: string) {
  return list
    .map((n) => currentCycle(n, today))
    .map((n) => ({ novena: n, day: novenaDay(n, today) }))
    .filter((x): x is { novena: Novena; day: number } => x.day !== null)
    .sort((a, b) => novenaEnd(a.novena).localeCompare(novenaEnd(b.novena)))
}
