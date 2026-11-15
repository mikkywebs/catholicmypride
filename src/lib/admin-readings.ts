import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { lectionaryFields } from './lectionary'

const DAYS_AHEAD = 14

/**
 * Makes sure today and the next two weeks have Mass readings saved, filled from the lectionary.
 * Never touches a day that already has readings.
 */
export async function ensureUpcomingReadings(db: SupabaseClient) {
  const tz = process.env.SITE_TIMEZONE || 'Africa/Lagos'
  const start = new Date(`${new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())}T12:00:00Z`)
  const dates = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(start); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10)
  })
  const { data: existing, error } = await db.from('readings').select('date').in('date', dates)
  if (error) return
  const have = new Set((existing ?? []).map((r) => r.date as string))
  const missing = dates.filter((d) => !have.has(d))
  if (!missing.length) return
  const rows = []
  for (const date of missing) {
    const f = await lectionaryFields(date)
    if (f) rows.push({ date, ...f, status: 'published', published_at: new Date().toISOString(), auto_filled: true })
  }
  if (!rows.length) return
  const { error: e } = await db.from('readings').insert(rows)
  if (e && (e.code === 'PGRST204' || /auto_filled|needs_check/.test(e.message))) {
    // Database update 0011 not run yet: save without the two marker columns.
    await db.from('readings').insert(rows.map((r) => { const copy: Record<string, unknown> = { ...r }; delete copy.auto_filled; delete copy.needs_check; return copy }))
  }
}
