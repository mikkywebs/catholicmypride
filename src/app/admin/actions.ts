'use server'

import { redirect } from 'next/navigation'
import { updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { CONTENT_TYPES, type Field } from '@/lib/content-types'
import { slugify } from '@/lib/format'
import { isYouTubeUrl } from '@/lib/text'
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
      const v = raw(f.name)
      return [[f.name, v ? Number.parseInt(v, 10) || null : null]]
    }
    case 'tags':
      return [[f.name, raw(f.name).split(',').map((t) => t.trim()).filter(Boolean)]]
    case 'audio': {
      const s = raw(f.secondsField)
      return [[f.name, raw(f.name) || null], [f.secondsField, s ? Math.round(Number(s)) || null : null]]
    }
    case 'place':
      return [[f.name, raw(f.name) || null], [f.countryName, raw(f.countryName) || null]]
    case 'weekdays':
      return [[f.name, form.getAll(f.name).map((d) => Number(d)).filter((d) => d >= 0 && d <= 6).sort()]]
    case 'time':
      return [[f.name, /^\d{2}:\d{2}$/.test(raw(f.name)) ? raw(f.name) : null]]
    case 'musicbar': {
      const on = form.get('on_bar') === 'on'
      const time = (n: string) => (/^\d{2}:\d{2}$/.test(raw(n)) ? raw(n) : null)
      return [
        ['on_bar', on],
        ['bar_days', form.getAll('bar_days').map((d) => Number(d)).filter((d) => d >= 0 && d <= 6).sort()],
        ['bar_start', time('bar_start')],
        ['bar_end', time('bar_end')],
        ['bar_order', Number.parseInt(raw('bar_order'), 10) || 0],
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
  if (typeof row.youtube_url === 'string' && !isYouTubeUrl(row.youtube_url)) return { ok: false, message: 'The YouTube link must be a youtube.com or youtu.be address.' }
  if ('slug' in row) {
    row.slug = slugify(String(row.slug || row[t.slugFrom ?? t.titleField] || ''))
    if (!row.slug) return { ok: false, message: 'Please add a web address (slug).' }
  }
  if (t.status !== false && 'status' in row) {
    row.status = row.status || 'draft'
    if (row.status === 'published' && !row.published_at) row.published_at = new Date().toISOString()
  }
  row.updated_at = new Date().toISOString()
  if (t.key === 'dioceses' && (!row.continent || !row.country)) return { ok: false, message: 'Please choose the continent and country.' }
  if (t.key === 'churches' && !row.diocese_id) return { ok: false, message: 'Please choose the archdiocese or diocese.' }

  const q = id ? db.from(t.table).update(row).eq('id', id).select('id').single() : db.from(t.table).insert(row).select('id').single()
  const { data, error } = await q
  if (error) {
    if (error.code === '23505') return { ok: false, message: 'That web address or date is already used. Please choose another.' }
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
}

export async function deleteMessage(id: string) {
  const { db } = await requireAdmin()
  await db.from('contact_messages').delete().eq('id', id)
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
  'site_name', 'tagline', 'mission', 'logo_url', 'hero_image_url', 'hero_title', 'hero_subtitle',
  'about_image_url', 'about_story_title', 'about_story_md', 'contact_email', 'contact_phone', 'contact_address',
  'youtube_url', 'facebook_url', 'tiktok_url', 'x_url', 'donate_url',
  'bank_account_name', 'bank_name', 'bank_account_number', 'donate_needs_md',
] as const
const MUSIC_FALLBACKS = ['songs', 'audio', 'all', 'none']

export async function saveSettings(_: FormState, form: FormData): Promise<FormState> {
  const { db } = await requireAdmin()
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const k of SETTING_KEYS) row[k] = String(form.get(k) ?? '').trim() || null
  row.site_name ||= 'Catholic My Pride'
  row.tagline ||= 'Apostolate'
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
