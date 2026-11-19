import { addDays } from './liturgical'
import type { Novena } from './types'

/** Number of numbered days (9 unless the admin set another number). */
export const novenaLength = (n: Pick<Novena, 'days_count'>) => Math.min(40, Math.max(1, n.days_count || 9))
/** Date of Day 1: the date set by the admin, or 9 days before the feast. */
export const novenaStart = (n: Pick<Novena, 'start_date' | 'feast_date'>) => n.start_date || addDays(n.feast_date, -9)
/** Last numbered day. */
export const novenaEnd = (n: Novena) => addDays(novenaStart(n), novenaLength(n) - 1)
/** First date anything is prayed (the opening day, if there is one). */
export const novenaFirstDate = (n: Novena) => (n.has_opening ? addDays(novenaStart(n), -1) : novenaStart(n))

/** Today's day: 0 for the opening day, 1…length, or null when the novena is not running. */
export function novenaDay(n: Novena, today: string): number | null {
  if (today < novenaFirstDate(n) || today > novenaEnd(n)) return null
  const start = novenaStart(n)
  if (today < start) return 0
  let day = 1
  for (let d = 1; d <= novenaLength(n); d++) if (addDays(start, d - 1) <= today) day = d
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

/** For a novena that repeats every year: this calendar year's dates, changing to next year's on 1 January.
 *  A novena that runs across New Year (e.g. for the Epiphany) switches when its new round begins instead,
 *  so it never changes halfway through. Other novenas are returned unchanged. */
export function currentCycle(n: Novena, today: string): Novena {
  if (!n.repeats_yearly) return n
  const offset = Number(today.slice(0, 4)) - Number(n.feast_date.slice(0, 4))
  const thisYear = shifted(n, offset)
  const next = shifted(n, offset + 1)
  return novenaFirstDate(next) <= today ? next : thisYear
}

/** First day of the following round of a yearly novena (for “It returns on …”). */
export const nextRoundStart = (n: Novena) => novenaFirstDate(shifted(n, 1))

/** “Day 6 of 25” or “Opening day”. */
export const dayLabel = (n: Novena, day: number) => (day === 0 ? 'Opening day' : `Day ${day} of ${novenaLength(n)}`)

/** Novenas being prayed today, the one ending soonest first. */
export function activeNovenas(list: Novena[], today: string) {
  return list
    .map((n) => currentCycle(n, today))
    .map((n) => ({ novena: n, day: novenaDay(n, today) }))
    .filter((x): x is { novena: Novena; day: number } => x.day !== null)
    .sort((a, b) => novenaEnd(a.novena).localeCompare(novenaEnd(b.novena)))
}
