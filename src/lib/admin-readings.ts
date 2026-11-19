import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { lectionaryFields } from './lectionary'
import { calendarSaintRow, calendarSaintsFor } from './saints-data'
import { dailyPrayerFor, dailyPrayerSlug } from './daily-prayer'

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

/**
 * Saint of the Day for the next two weeks: adds each calendar saint not yet saved, and moves saints
 * saved in an earlier year to this year's date. Nothing you wrote is changed.
 */
export async function ensureUpcomingSaints(db: SupabaseClient) {
  const tz = process.env.SITE_TIMEZONE || 'Africa/Lagos'
  const start = new Date(`${new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())}T12:00:00Z`)
  const today = start.toISOString().slice(0, 10)
  const wanted: { slug: string; date: string }[] = []
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(start); d.setUTCDate(d.getUTCDate() + i)
    const date = d.toISOString().slice(0, 10)
    for (const s of await calendarSaintsFor(date)) wanted.push({ slug: s.slug, date })
  }
  if (!wanted.length) return
  const { data: existing, error } = await db.from('saints').select('id, slug, show_on').in('slug', wanted.map((w) => w.slug))
  if (error) return
  const bySlug = new Map((existing ?? []).map((r) => [r.slug as string, r]))
  const inserts: Record<string, unknown>[] = []
  for (const w of wanted) {
    const row = bySlug.get(w.slug)
    if (!row) {
      const r = await calendarSaintRow(w.slug, w.date)
      if (r) inserts.push({ ...r, status: 'published', published_at: new Date().toISOString(), auto_filled: true })
    } else if (!row.show_on || (row.show_on as string) < today) {
      await db.from('saints').update({ show_on: w.date }).eq('id', row.id)
    }
  }
  if (!inserts.length) return
  const { error: e } = await db.from('saints').insert(inserts)
  if (e && (e.code === 'PGRST204' || /auto_filled|kind/.test(e.message))) {
    await db.from('saints').insert(inserts.map((r) => { const c = { ...r }; delete c.auto_filled; delete c.kind; return c }))
  }
}

/** Daily prayers for the next two weeks, drawn from each day's readings. Never touches a saved prayer. */
export async function ensureUpcomingPrayers(db: SupabaseClient) {
  const tz = process.env.SITE_TIMEZONE || 'Africa/Lagos'
  const start = new Date(`${new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())}T12:00:00Z`)
  const dates = Array.from({ length: DAYS_AHEAD }, (_, i) => { const d = new Date(start); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10) })
  const { data: existing, error } = await db.from('prayers').select('slug').in('slug', dates.map(dailyPrayerSlug))
  if (error) return
  const have = new Set((existing ?? []).map((r) => r.slug as string))
  const rows: Record<string, unknown>[] = []
  for (const date of dates) {
    if (have.has(dailyPrayerSlug(date))) continue
    const p = await dailyPrayerFor(date)
    if (!p) continue
    rows.push({ slug: p.slug, title: p.title, body_md: p.body_md, show_on: date, seo_title: p.seo_title, seo_description: p.seo_description, status: 'published', published_at: new Date().toISOString(), auto_filled: true })
  }
  if (!rows.length) return
  const { error: e } = await db.from('prayers').insert(rows)
  if (e && (e.code === 'PGRST204' || /auto_filled/.test(e.message))) {
    await db.from('prayers').insert(rows.map((r) => { const c = { ...r }; delete c.auto_filled; return c }))
  }
}
