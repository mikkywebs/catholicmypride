// Picks which music bar playlist should play right now (visitor's local clock).

export type ScheduledPlaylist = { days: number[]; start: string | null; end: string | null; loop: boolean; sort: number; trackIds: string[] }

function minutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

/** True if `now` falls inside the playlist's days and time window. Windows may cross midnight. */
export function isActive(p: Pick<ScheduledPlaylist, 'days' | 'start' | 'end'>, now: Date) {
  const day = now.getDay()
  const mins = now.getHours() * 60 + now.getMinutes()
  if (!p.start && !p.end) return p.days.length === 0 || p.days.includes(day)
  const s = p.start ? minutes(p.start) : 0
  const e = p.end ? minutes(p.end) : 24 * 60
  if (s <= e) return (p.days.length === 0 || p.days.includes(day)) && mins >= s && mins < e
  // Crosses midnight, e.g. 21:00–02:00: the early-morning part belongs to the previous day.
  if (mins >= s) return p.days.length === 0 || p.days.includes(day)
  if (mins < e) return p.days.length === 0 || p.days.includes((day + 6) % 7)
  return false
}

export function pickPlaylist<T extends ScheduledPlaylist>(lists: T[], now: Date): T | null {
  return [...lists].sort((a, b) => a.sort - b.sort).find((p) => p.trackIds.length > 0 && isActive(p, now)) ?? null
}
