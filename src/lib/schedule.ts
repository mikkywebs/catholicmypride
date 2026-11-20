// Works out what the music bar should play right now (visitor's local clock).

export type BarSlot = { id: string; title: string; days: number[]; start: string | null; end: string | null; order: number }

function minutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

/** True if `now` falls inside the playlist's days and time window. Windows may cross midnight. */
export function isActive(p: Pick<BarSlot, 'days' | 'start' | 'end'>, now: Date) {
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

/** Items on the music bar that are scheduled for `now`, in the admin's order. */
export function activeSlots(slots: BarSlot[], now: Date) {
  return slots.filter((x) => isActive(x, now)).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
}

export type TimedPrayer = { id: string; title: string; times: string[]; season: 'all' | 'easter' | 'not_easter' | string; remind?: number }

const pad = (n: number) => String(n).padStart(2, '0')
const localISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** The prayer whose set time is now (within the first two minutes), on the visitor's own clock. */
export function dueTimed(prayers: TimedPrayer[], now: Date, isEaster = isEasterSeason(now)) {
  const mins = now.getHours() * 60 + now.getMinutes()
  for (const p of prayers) {
    if (p.season === 'easter' && !isEaster) continue
    if (p.season === 'not_easter' && isEaster) continue
    for (const t of p.times) {
      const diff = mins - minutes(t)
      if (diff >= 0 && diff < 2) {
        return { id: p.id, key: `${localISO(now)}T${t}:${p.id}`, label: `${clock(t)} · ${p.title}` }
      }
    }
  }
  return null
}

/** “12 noon”, “6pm”, “3am”, “6:30pm”. */
export function clock(t: string) {
  const h = Number(t.slice(0, 2)), m = t.slice(3, 5)
  if (h === 12 && m === '00') return '12 noon'
  if (h === 0 && m === '00') return 'midnight'
  return `${h % 12 || 12}${m === '00' ? '' : `:${m}`}${h < 12 ? 'am' : 'pm'}`
}

/** A prayer whose time passed a few minutes ago (after the 2-minute start window, within its reminder window).
 *  Used to invite visitors who arrive late: “The Angelus was prayed at 12 noon · Pray it now”. */
export function recentTimed(prayers: TimedPrayer[], now: Date, isEaster = isEasterSeason(now)) {
  const mins = now.getHours() * 60 + now.getMinutes()
  let best: { id: string; key: string; title: string; time: string; ago: number } | null = null
  for (const p of prayers) {
    const window = p.remind ?? 15
    if (window <= 0) continue
    if (p.season === 'easter' && !isEaster) continue
    if (p.season === 'not_easter' && isEaster) continue
    for (const t of p.times) {
      const ago = mins - minutes(t)
      if (ago >= 2 && ago <= window && (!best || ago < best.ago)) {
        best = { id: p.id, key: `${localISO(now)}T${t}:${p.id}`, title: p.title, time: clock(t), ago }
      }
    }
  }
  return best
}

/** Easter Sunday up to and including Pentecost, on the visitor's date. */
export function isEasterSeason(now: Date) {
  const y = now.getFullYear()
  // Anonymous Gregorian algorithm.
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1
  const easter = new Date(y, month - 1, day)
  const pentecost = new Date(y, month - 1, day + 49)
  const today = new Date(y, now.getMonth(), now.getDate())
  return today >= easter && today <= pentecost
}
