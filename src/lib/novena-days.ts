import { addDays } from './liturgical'
import type { Novena } from './types'

/** A novena runs for the 9 days before its feast. */
export function novenaDay(n: Novena, today: string): number | null {
  const start = addDays(n.feast_date, -9)
  if (today < start || today > addDays(n.feast_date, -1)) return null
  let day = 1
  for (let d = 1; d <= 9; d++) if (addDays(start, d - 1) <= today) day = d
  return day
}

/** Novenas being prayed today, the one closest to its feast first. */
export function activeNovenas(list: Novena[], today: string) {
  return list
    .map((n) => ({ novena: n, day: novenaDay(n, today) }))
    .filter((x): x is { novena: Novena; day: number } => x.day !== null)
    .sort((a, b) => a.novena.feast_date.localeCompare(b.novena.feast_date))
}
