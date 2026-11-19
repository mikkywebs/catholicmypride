'use server'

import { redirect } from 'next/navigation'
import { refresh as refreshPage, updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { CONTENT_TYPES, type Field } from '@/lib/content-types'
import { slugify } from '@/lib/format'
import { cleanYouTubeUrl, isYouTubeUrl } from '@/lib/text'
import { serverClient } from '@/lib/supabase/server'

export type FormState = { ok: boolean; message: string } | null

function refresh(tags: string[]) {
  for (const t of new Set(tags)) updateTag(t)
}

// ---------------- Auth ----------------
export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const db = await serverClient()
  const { error } = await db.auth.signInWithPassword({
    email: String(form.get('email') ?? '').trim(),
    password: String(form.get('password') ?? ''),
  })
  if (error) return { ok: false, message: 'Email or password is not correct.' }
  redirect('/admin')
}

export async function signOut() {
  const db = await serverClient()
  await db.auth.signOut()
  redirect('/admin/login')
}

// ---------------- Content ----------------
function readField(f: Field, form: FormData): [string, unknown][] {
  const raw = (n: string) => {
    const v = form.get(n)
    return typeof v === 'string' ? v.trim() : ''
  }
  switch (f.type) {
    case 'heading':
      return []
    case 'boolean':
      return [[f.name, form.get(f.name) === 'on']]
    case 'number': {
      const v = raw(f.name).replace(/[,\s]/g, '')
      return [[f.name, v ? Number.parseInt(v, 10) || null : null]]
    }
    case 'tags':
      return [[f.name, raw(f.name).split(',').map((t) => t.trim()).filter(Boolean)]]
    case 'audio': {
      const s = raw(f.secondsField)
      return [[f.name, raw(f.name) || null], [f.secondsField, s ? Math.round(Number(s)) || null : null]]
    }
    case 'place':
      return [[f.name, raw(f.name) || null], [f.countryName, raw(f.countryName) || null], ...(f.provinceName ? [[f.provinceName, raw(f.provinceName) || null] as [string, unknown]] : [])]
    case 'diocese':
      return [[f.name, raw(f.name) || null], ...(f.deaneryName ? [[f.deaneryName, raw(f.deaneryName) || null] as [string, unknown]] : [])]
    case 'weekdays':
      return [[f.name, form.getAll(f.name).map((d) => Number(d)).filter((d) => d >= 0 && d <= 6).sort()]]
    case 'time':
      return [[f.name, /^\d{2}:\d{2}$/.test(raw(f.name)) ? raw(f.name) : null]]
    case 'musicbar': {
      // A prayer with set times is never part of the ordinary music rotation.
      const on = form.get('on_bar') === 'on' && form.get('timed') !== 'on'
      const time = (n: string) => (/^\d{2}:\d{2}$/.test(raw(n)) ? raw(n) : null)
      return [
        ['on_bar', on],
        ['bar_days', form.getAll('bar_days').map((d) => Number(d)).filter((d) => d >= 0 && d <= 6).sort()],
        ['bar_start', time('bar_start')],
        ['bar_end', time('bar_end')],
        ['bar_order', Number.parseInt(raw('bar_order'), 10) || 0],
        // Prayers at set times (e.g. the Angelus at 06:00, 12:00, 18:00).
        ['bar_times', form.get('timed') === 'on'
          ? [...new Set(raw('bar_times').split(/[\s,;]+/).map((x) => x.trim()).filter((x) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(x)).map((x) => x.padStart(5, '0')))].sort()
          : []],
        ['bar_season', ['easter', 'not_easter'].includes(raw('bar_season')) ? raw('bar_season') : 'all'],
      ]
    }
    case 'image':
      return f.altField ? [[f.name, raw(f.name) || null], [f.altField, raw(f.altField) || null]] : [[f.name, raw(f.name) || null]]
    default:
      return [[f.name, raw(f.name) || null]]
  }
}

export async function saveItem(typeKey: string, id: string | null, _: FormState, form: FormData): Promise<FormState> {
  const { db } = await requireAdmin()
  const t = CONTENT_TYPES[typeKey]
  if (!t) return { ok: false, message: 'Unknown content type.' }

  const row: Record<string, unknown> = {}
  for (const f of t.fields) for (const [k, v] of readField(f, form)) row[k] = v

  for (const f of t.fields) {
    if ('required' in f && f.required && (row[f.name] === null || row[f.name] === '')) return { ok: false, message: `Please fill in “${f.label}”.` }
  }
  if (typeof row.youtube_url === 'string') {
    if (!isYouTubeUrl(row.youtube_url)) return { ok: false, message: 'The YouTube link must be a youtube.com or youtu.be address.' }
    row.youtube_url = cleanYouTubeUrl(row.youtube_url)
  }
  if ('slug' in row) {
    row.slug = slugify(String(row.slug || row[t.slugFrom ?? t.titleField] || ''))
    if (!row.slug) return { ok: false, message: 'Please add a web address (slug).' }
  }
  if (t.status !== false && 'status' in row) {
    row.status = row.status || 'draft'
    if (row.status === 'published' && !row.published_at) row.published_at = new Date().toISOString()
  }
  row.updated_at = new Date().toISOString()
  if (t.key === 'regions' && !row.province) row.province = null
  if (t.key === 'regions' && row.province) row.province_list = []
  if (t.key === 'regions' && Array.isArray(row.province_list)) row.province_list = [...new Set((row.province_list as string[]).map((p) => p.replace(/^(ecclesiastical )?province of /i, '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  if (t.key === 'readings') { row.auto_filled = false; row.needs_check = false }
  if (t.key === 'saints') row.auto_filled = false
  if (t.key === 'prayers') row.auto_filled = false
  if (t.key === 'dioceses' && Array.isArray(row.deaneries)) row.deaneries = [...new Set(row.deaneries as string[])]
  if ((t.key === 'dioceses' || t.key === 'regions') && (!row.continent || !row.country)) return { ok: false, message: 'Please choose the continent and country.' }
  if (t.key === 'churches' && !row.diocese_id) return { ok: false, message: 'Please choose the archdiocese or diocese.' }

  const q = id ? db.from(t.table).update(row).eq('id', id).select('id').single() : db.from(t.table).insert(row).select('id').single()
  const { data, error } = await q
  if (error) {
    if (error.code === '23505') return { ok: false, message: t.key === 'regions' ? 'Totals for this country or province already exist. Edit the existing entry instead.' : 'That web address or date is already used. Please choose another.' }
    if (error.code === 'PGRST204' || /column .* (does not exist|of .* in the schema cache)/i.test(error.message)) {
      return { ok: false, message: `The database needs an update before this can be saved (${error.message}). Run the latest SQL update in Supabase, then try again.` }
    }
    return { ok: false, message: `Could not save: ${error.message}` }
  }

  // Novena: nine days are saved alongside the novena.
  if (t.key === 'novenas' && data) {
    const days = Array.from({ length: 9 }, (_, i) => i + 1).map((d) => ({
      novena_id: data.id,
      day: d,
      title: String(form.get(`day${d}_title`) ?? '').trim() || null,
      prayer_md: String(form.get(`day${d}_prayer`) ?? '').trim() || null,
      audio_url: String(form.get(`day${d}_audio`) ?? '').trim() || null,
      audio_seconds: Math.round(Number(form.get(`day${d}_seconds`) ?? 0)) || null,
    }))
    const { error: e2 } = await db.from('novena_days').upsert(days)
    if (e2) return { ok: false, message: `Saved the novena, but not its days: ${e2.message}` }
  }

  const extra = row.slug ? [`${t.key.replace(/s$/, '')}:${row.slug}`] : row.date ? [`reading:${row.date}`] : []
  refresh([...t.tags, ...extra])
  redirect(`/admin/${t.key}?saved=1`)
}

export async function deleteItem(typeKey: string, id: string) {
  const { db } = await requireAdmin()
  const t = CONTENT_TYPES[typeKey]
  if (!t) return
  await db.from(t.table).delete().eq('id', id)
  refresh(t.tags)
  redirect(`/admin/${t.key}?deleted=1`)
}

// ---------------- Prayer requests ----------------
export async function moderateRequest(id: string, status: 'approved' | 'rejected' | 'prayed' | 'pending') {
  const { db } = await requireAdmin()
  await db.from('prayer_requests').update({ status, approved_at: status === 'approved' ? new Date().toISOString() : null }).eq('id', id)
  refresh(['prayer-wall', 'content'])
}

export async function deleteRequest(id: string) {
  const { db } = await requireAdmin()
  await db.from('prayer_requests').delete().eq('id', id)
  refresh(['prayer-wall', 'content'])
}

// ---------------- Messages ----------------
export async function markMessage(id: string, read: boolean) {
  const { db } = await requireAdmin()
  await db.from('contact_messages').update({ is_read: read }).eq('id', id)
  refreshPage()
}

export async function deleteMessage(id: string) {
  const { db } = await requireAdmin()
  await db.from('contact_messages').delete().eq('id', id)
  refreshPage()
}

/** Deletes every message already marked as read. */
export async function deleteReadMessages() {
  const { db } = await requireAdmin()
  await db.from('contact_messages').delete().eq('is_read', true)
  refreshPage()
}

// ---------------- Categories ----------------
export async function addCategory(kind: string, _: FormState, form: FormData): Promise<FormState> {
  const { db } = await requireAdmin()
  const name = String(form.get('name') ?? '').trim()
  if (!name) return { ok: false, message: 'Please type a category name.' }
  const { error } = await db.from('categories').insert({ kind, name, slug: slugify(name) })
  if (error) return { ok: false, message: error.code === '23505' ? 'That category already exists.' : error.message }
  refresh(['categories', 'content'])
  return { ok: true, message: `Added “${name}”.` }
}

export async function renameCategory(id: string, form: FormData) {
  const { db } = await requireAdmin()
  const name = String(form.get('name') ?? '').trim()
  if (!name) return
  await db.from('categories').update({
    name,
    seo_title: String(form.get('seo_title') ?? '').trim() || null,
    seo_description: String(form.get('seo_description') ?? '').trim() || null,
  }).eq('id', id)
  refresh(['categories', 'posts', 'songs', 'books', 'prayers'])
}

export async function deleteCategory(id: string) {
  const { db } = await requireAdmin()
  await db.from('categories').delete().eq('id', id)
  refresh(['categories', 'posts', 'songs', 'books', 'prayers'])
}

// ---------------- Settings ----------------
const SETTING_KEYS = [
  'mission', 'logo_url', 'hero_image_url', 'hero_title', 'hero_subtitle',
  'about_image_url', 'about_story_title', 'about_story_md', 'contact_email', 'contact_phone', 'contact_address',
  'youtube_url', 'facebook_url', 'tiktok_url', 'x_url', 'donate_url',
  'bank_account_name', 'bank_name', 'bank_account_number', 'donate_needs_md',
  'default_reading_image', 'default_reading_alt', 'default_prayer_image', 'default_prayer_alt', 'whatsapp_channel_url',
] as const
const MUSIC_FALLBACKS = ['songs', 'audio', 'all', 'none']

export async function saveSettings(_: FormState, form: FormData): Promise<FormState> {
  const { db } = await requireAdmin()
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const k of SETTING_KEYS) row[k] = String(form.get(k) ?? '').trim() || null
  // The name and tagline are fixed.
  row.site_name = 'Catholic My Pride'
  row.tagline = 'Apostolate'
  let extras: unknown = []
  try { extras = JSON.parse(String(form.get('extra_social') ?? '[]')) } catch {}
  row.extra_social = (Array.isArray(extras) ? extras : [])
    .map((x) => ({ label: String(x?.label ?? '').trim().slice(0, 40), url: String(x?.url ?? '').trim() }))
    .filter((x) => /^https?:\/\/[^\s]+\.[^\s]+/i.test(x.url))
    .slice(0, 12)
  row.mission ||= "Spreading the Gospel, strengthening the Catholic faith and sharing Christ's love."
  row.view_threshold = Math.max(0, Number.parseInt(String(form.get('view_threshold') ?? '50'), 10) || 0)
  const fb = String(form.get('music_fallback') ?? 'songs')
  row.music_fallback = MUSIC_FALLBACKS.includes(fb) ? fb : 'songs'
  row.music_loop = form.get('music_loop') === 'once' ? 'once' : 'loop'
  const { error } = await db.from('settings').update(row).eq('id', 1)
  if (error) return { ok: false, message: error.message }

  for (const key of ['hero', 'prayer', 'donate']) {
    const url = String(form.get(`img_${key}`) ?? '').trim()
    const alt = String(form.get(`img_${key}_alt`) ?? '').trim() || null
    if (url) await db.from('homepage_images').upsert({ key, url, alt, updated_at: new Date().toISOString() })
    else await db.from('homepage_images').delete().eq('key', key)
  }
  refresh(['settings', 'home-images'])
  return { ok: true, message: 'Settings saved.' }
}

// ---------------- Mass readings from the lectionary ----------------
export async function lectionaryForDate(date: string) {
  await requireAdmin()
  const { lectionaryFields } = await import('@/lib/lectionary')
  return lectionaryFields(date)
}

// ---------------- Directory: add a country's dioceses in one go ----------------
export async function seedDioceses(country: string) {
  const { db } = await requireAdmin()
  const { DIRECTORY_FACTS } = await import('@/lib/directory-data')
  const facts = DIRECTORY_FACTS[country]
  if (!facts) redirect('/admin/dioceses')
  const norm = (s: string) => s.toLowerCase().replace(/\s+city$/, '').replace(/[^a-z]/g, '')
  const { data: existing } = await db.from('dioceses').select('id, name, province').eq('country', country)
  const have = new Map((existing ?? []).map((d) => [norm(d.name as string), d]))
  const wanted = [
    ...Object.entries(facts.provinces).flatMap(([province, list]) =>
      list.map((name, i) => ({ name, province, kind: i === 0 ? 'Archdiocese' : 'Diocese' }))),
    ...(facts.other ?? []).map((o) => ({ name: o.name, province: null as string | null, kind: o.kind })),
  ]
  let added = 0, updated = 0, failed = 0
  for (const w of wanted) {
    const found = have.get(norm(w.name))
    if (found) {
      // Already entered: only fill an empty province, never change anything else.
      if (!found.province && w.province) {
        const { error } = await db.from('dioceses').update({ province: w.province, updated_at: new Date().toISOString() }).eq('id', found.id)
        if (!error) updated++
      }
      continue
    }
    const { error } = await db.from('dioceses').insert({ ...w, continent: facts.continent, country, status: 'published' })
    if (error) failed++
    else added++
  }
  // Also list the provinces on the country entry, if there is none yet.
  const { data: region } = await db.from('directory_regions').select('id, province_list').eq('country', country).is('province', null).maybeSingle()
  if (!region) {
    await db.from('directory_regions').insert({ continent: facts.continent, country, province_list: Object.keys(facts.provinces), ...facts.totals, status: 'published' })
  } else if (!(region.province_list as string[] | null)?.length) {
    await db.from('directory_regions').update({ province_list: Object.keys(facts.provinces) }).eq('id', region.id)
  }
  refresh(['churches', 'content'])
  redirect(`/admin/dioceses?seeded=${added}&updated=${updated}&failed=${failed}`)
}

// ---------------- Questions & Answers / Quiz ----------------
/** Marks a visitor's question as answered and opens a new answer with the question filled in. */
export async function answerSubmission(id: string, question: string) {
  const { db } = await requireAdmin()
  await db.from('faq_submissions').update({ status: 'answered' }).eq('id', id)
  redirect(`/admin/faqs/new?question=${encodeURIComponent(question)}`)
}

export async function setSubmissionStatus(id: string, status: 'new' | 'ignored') {
  const { db } = await requireAdmin()
  await db.from('faq_submissions').update({ status }).eq('id', id)
  refreshPage()
}

export async function deleteSubmission(id: string) {
  const { db } = await requireAdmin()
  await db.from('faq_submissions').delete().eq('id', id)
  refreshPage()
}

/** Adds the starter questions that are not in the database yet. Nothing already saved is changed. */
export async function loadStarter(kind: 'faqs' | 'quiz') {
  const { db } = await requireAdmin()
  const { loadStarterFaqs, loadStarterQuiz } = await import('@/lib/faith')
  let added = 0
  if (kind === 'faqs') {
    const starter = await loadStarterFaqs()
    const { data } = await db.from('faqs').select('slug')
    const have = new Set((data ?? []).map((r) => r.slug as string))
    const rows = starter.filter((f) => !have.has(f.slug)).map((f) => ({ ...f, needs_review: true, status: 'published', published_at: new Date().toISOString() }))
    for (let i = 0; i < rows.length; i += 100) {
      const { error } = await db.from('faqs').insert(rows.slice(i, i + 100))
      if (!error) added += rows.slice(i, i + 100).length
    }
  } else {
    const starter = await loadStarterQuiz()
    const { data } = await db.from('quiz_questions').select('question')
    const have = new Set((data ?? []).map((r) => (r.question as string).toLowerCase()))
    const rows = starter.filter((q) => !have.has(q.question.toLowerCase())).map((q) => ({ ...q, needs_review: true, status: 'published' }))
    for (let i = 0; i < rows.length; i += 100) {
      const { error } = await db.from('quiz_questions').insert(rows.slice(i, i + 100))
      if (!error) added += rows.slice(i, i + 100).length
    }
  }
  refresh([kind, 'content'])
  redirect(`/admin/${kind}?loaded=${added}`)
}
