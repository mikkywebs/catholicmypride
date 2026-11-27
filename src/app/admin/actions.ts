'use server'

import { redirect } from 'next/navigation'
import { refresh as refreshPage, updateTag } from 'next/cache'
import { requireAdmin } from '@/lib/admin'
import { CONTENT_TYPES, type Field } from '@/lib/content-types'
import { slugify } from '@/lib/format'
import { cleanYouTubeUrl, isYouTubeUrl } from '@/lib/text'
import { serverClient } from '@/lib/supabase/server'
import { SEASON_MODES } from '@/lib/season-theme'
import { coordsFromMapUrl, dirSlug } from '@/lib/directory'

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
        ['bar_remind_minutes', Math.min(60, Math.max(0, Number.parseInt(raw('bar_remind_minutes'), 10) || 0))],
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
  if (t.key === 'novenas') {
    row.days_count = Math.min(60, Math.max(1, Number(row.days_count) || 9))
    row.repeat_count = row.repeat_count ? Math.min(100, Math.max(1, Number(row.repeat_count))) : null
    const opening = String(form.get('day0_prayer') ?? '').trim() || String(form.get('day0_title') ?? '').trim()
    row.has_opening = Boolean(opening)
  }
  if (t.key === 'dioceses' && Array.isArray(row.deaneries)) row.deaneries = [...new Set(row.deaneries as string[])]
  if ((t.key === 'dioceses' || t.key === 'regions') && (!row.continent || !row.country)) return { ok: false, message: 'Please choose the continent and country.' }
  if (t.key === 'churches' && !row.diocese_id) return { ok: false, message: 'Please choose the archdiocese or diocese.' }
  if (t.key === 'churches') {
    const pos = coordsFromMapUrl(row.map_url as string | null)
    if (pos) { row.lat = pos.lat; row.lng = pos.lng }
    row.slug = await uniqueParishSlug(db, String(row.diocese_id), String(row.name ?? ''), id ?? null)
  }

  const q = id ? db.from(t.table).update(row).eq('id', id).select('id').single() : db.from(t.table).insert(row).select('id').single()
  const { data, error } = await q
  if (error) {
    if (error.code === '23505') return { ok: false, message: t.key === 'regions' ? 'Totals for this country or province already exist. Edit the existing entry instead.' : 'That web address or date is already used. Please choose another.' }
    if (error.code === 'PGRST204' || /column .* (does not exist|of .* in the schema cache)/i.test(error.message)) {
      return { ok: false, message: `The database needs an update before this can be saved (${error.message}). Run the latest SQL update in Supabase, then try again.` }
    }
    return { ok: false, message: `Could not save: ${error.message}` }
  }

  // Novena: its days (and the optional opening day, Day 0) are saved alongside it.
  if (t.key === 'novenas' && data) {
    const count = Number(row.days_count)
    const day = (d: number) => ({
      novena_id: data.id,
      day: d,
      title: String(form.get(`day${d}_title`) ?? '').trim() || null,
      prayer_md: String(form.get(`day${d}_prayer`) ?? '').trim() || null,
      audio_url: String(form.get(`day${d}_audio`) ?? '').trim() || null,
      audio_seconds: Math.round(Number(form.get(`day${d}_seconds`) ?? 0)) || null,
    })
    const days = Array.from({ length: count }, (_, i) => day(i + 1))
    if (row.has_opening) days.unshift(day(0))
    // Remove days beyond the new length, and the opening day if it was emptied.
    await db.from('novena_days').delete().eq('novena_id', data.id).gt('day', count)
    if (!row.has_opening) await db.from('novena_days').delete().eq('novena_id', data.id).eq('day', 0)
    const { error: e2 } = await db.from('novena_days').upsert(days)
    if (e2) return { ok: false, message: `Saved the novena, but not its days: ${e2.message}` }
  }

  const extra = row.slug ? [`${t.key.replace(/s$/, '')}:${row.slug}`] : row.date ? [`reading:${row.date}`] : []
  refresh([...t.tags, ...extra])
  // A parish returns to its own diocese's list, not the start of the directory.
  redirect(t.key === 'churches' && row.diocese_id ? `/admin/churches?diocese=${row.diocese_id}&saved=1` : t.key === 'dioceses' && row.country ? `/admin/dioceses?country=${encodeURIComponent(String(row.country))}&saved=1` : `/admin/${t.key}?saved=1`)
}

export async function deleteItem(typeKey: string, id: string) {
  const { db } = await requireAdmin()
  const t = CONTENT_TYPES[typeKey]
  if (!t) return
  const { data: gone } = t.key === 'churches' ? await db.from('churches').select('diocese_id').eq('id', id).maybeSingle() : { data: null }
  await db.from(t.table).delete().eq('id', id)
  refresh(t.tags)
  redirect(gone?.diocese_id ? `/admin/churches?diocese=${gone.diocese_id}&deleted=1` : `/admin/${t.key}?deleted=1`)
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
  row.music_loop = 'once' // the bar never repeats by itself
  const season = String(form.get('seasonal_theme') ?? 'auto')
  row.seasonal_theme = (SEASON_MODES as string[]).includes(season) ? season : 'auto'
  const { error } = await db.from('settings').update(row).eq('id', 1)
  if (error) return { ok: false, message: error.message }

  const { PRAYER_IMAGE_SLOTS, READING_IMAGE_SLOTS } = await import('@/lib/reading-image')
  for (const key of ['hero', 'prayer', 'donate', ...READING_IMAGE_SLOTS.map((x) => x.key), ...PRAYER_IMAGE_SLOTS.map((x) => x.key)]) {
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
  const { data: existing } = await db.from('dioceses').select('id, name, province, cathedral').eq('country', country)
  const have = new Map((existing ?? []).map((d) => [norm(d.name as string), d]))
  const wanted = [
    ...Object.entries(facts.provinces).flatMap(([province, list]) =>
      list.map((name, i) => ({ name, province, kind: facts.kinds?.[name] ?? (i === 0 ? 'Archdiocese' : 'Diocese') }))),
    ...(facts.other ?? []).map((o) => ({ name: o.name, province: null as string | null, kind: o.kind })),
  ]
  let added = 0, updated = 0, failed = 0
  const toAdd: Record<string, unknown>[] = []
  for (const w of wanted) {
    const found = have.get(norm(w.name))
    if (found) {
      // Already entered: only fill an empty province, never change anything else.
      const fill: Record<string, string> = {}
      if (!found.province && w.province) fill.province = w.province
      if (!found.cathedral && facts.cathedrals?.[w.name]) fill.cathedral = facts.cathedrals[w.name]
      if (Object.keys(fill).length) {
        const { error } = await db.from('dioceses').update({ ...fill, updated_at: new Date().toISOString() }).eq('id', found.id)
        if (!error) updated++
      }
      continue
    }
    toAdd.push({ ...w, cathedral: facts.cathedrals?.[w.name] ?? null, continent: facts.continent, country, status: 'published' })
  }
  // In batches, so a large country (Italy has 226) is added quickly.
  for (let i = 0; i < toAdd.length; i += 50) {
    const batch = toAdd.slice(i, i + 50)
    const { error } = await db.from('dioceses').insert(batch)
    if (error) failed += batch.length
    else added += batch.length
  }
  // Also list the provinces on the country entry, if there is none yet.
  const { data: region } = await db.from('directory_regions').select('id, province_list').eq('country', country).is('province', null).maybeSingle()
  if (!region) {
    await db.from('directory_regions').insert({ continent: facts.continent, country, province_list: Object.keys(facts.provinces), ...facts.totals, status: 'published' })
  } else if (!(region.province_list as string[] | null)?.length) {
    await db.from('directory_regions').update({ province_list: Object.keys(facts.provinces) }).eq('id', region.id)
  }
  refresh(['churches', 'content'])
  redirect(`/admin/dioceses?country=${encodeURIComponent(country)}&seeded=${added}&updated=${updated}&failed=${failed}`)
}

// ---------------- Questions & Answers / Quiz ----------------
/** Marks a visitor's question as answered and opens a new answer with the question filled in. */
export async function answerSubmission(id: string, question: string) {
  const { db } = await requireAdmin()
  await db.from('faq_submissions').update({ status: 'answered' }).eq('id', id)
  redirect(`/admin/faqs/new?question=${encodeURIComponent(question)}`)
}

/** Blog Ideas: hide an idea you will not write (the next best one takes its place), or bring it back. */
export async function skipIdea(idea: string, title: string) {
  const { db } = await requireAdmin()
  const { error } = await db.from('blog_idea_skips').upsert({ idea, title })
  if (error) redirect(`/admin/blog-ideas?error=${encodeURIComponent(/blog_idea_skips/.test(error.message) ? 'Please run database update 0033 first, then try again.' : error.message)}`)
  redirect('/admin/blog-ideas')
}
export async function unskipIdea(idea: string) {
  const { db } = await requireAdmin()
  await db.from('blog_idea_skips').delete().eq('idea', idea)
  redirect('/admin/blog-ideas')
}

/** Blog Ideas: turn a suggestion into a draft post with all the SEO fields filled in, then open it. */
export async function createIdeaDraft(idea: import('@/lib/blog-ideas').BlogIdea) {
  const { db } = await requireAdmin()
  const { data: existing } = await db.from('posts').select('id').eq('slug', idea.slug).maybeSingle()
  if (existing) redirect(`/admin/posts/${existing.id}`)
  const { data: cats } = await db.from('categories').select('id, name').eq('kind', 'blog')
  const cat = (cats ?? []).find((c) => (c.name as string).toLowerCase() === idea.category.toLowerCase())
  const body = [
    `> ✍️ Draft from Blog Ideas. Replace the notes under each heading with your own writing, add the sources you used in the References box below the article, then delete this line. Publish by ${idea.publishBy}.`,
    idea.outlineMd,
    '## Frequently asked questions',
    idea.faqs.map((q) => `### ${q}

- Write your answer here in 2–3 sentences, then delete this line.`).join('\n\n'),
    '---',
    `**Link to:** ${idea.links.map((l) => `[${l.label}](${l.href})`).join(' · ')}`,
    `**Image idea:** ${idea.image} · **Alt text:** ${idea.imageAlt}`,
  ].join('\n\n')
  const { data: post, error } = await db.from('posts').insert({
    title: idea.title, slug: idea.slug, body_md: body, excerpt: idea.seoDescription,
    seo_title: idea.seoTitle, seo_description: idea.seoDescription, focus_keyword: idea.focusKeyword, keywords: idea.keywords.join(', '),
    tags: idea.tags, category_id: cat?.id ?? null, author: 'Catholic My Pride', image_alt: idea.imageAlt,
    status: 'draft', updated_at: new Date().toISOString(),
  }).select('id').single()
  if (error || !post) redirect(`/admin/blog-ideas?error=${encodeURIComponent(error?.message ?? 'Could not create the draft')}`)
  redirect(`/admin/posts/${post.id}?from=idea`)
}

/** Article sent by a reader: turn it into a draft blog post (once) and open it in the blog editor. */
export async function openArticle(id: string) {
  const { db } = await requireAdmin()
  const { data: a } = await db.from('article_submissions').select('*').eq('id', id).maybeSingle()
  if (!a) redirect('/admin/submissions')
  if (a.post_id) {
    const { data: existing } = await db.from('posts').select('id').eq('id', a.post_id).maybeSingle()
    if (existing) redirect(`/admin/posts/${a.post_id}`)
  }
  // Paragraphs as written; sources listed at the end in plain text.
  const sources = String(a.sources ?? '').split('\n').map((x: string) => x.trim()).filter(Boolean)
  const body = a.body + (sources.length ? `\n\n### Sources\n\n${sources.map((x: string) => `- ${x}`).join('\n')}` : '')
  const plain = a.body.replace(/[#*_>`]/g, '').replace(/\s+/g, ' ').trim()
  const excerpt = plain.length > 180 ? `${plain.slice(0, plain.lastIndexOf(' ', 177))}…` : plain
  let slug = slugify(a.title).slice(0, 80) || `article-${Date.now()}`
  const { data: clash } = await db.from('posts').select('id').eq('slug', slug).maybeSingle()
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
  const { data: post, error } = await db.from('posts').insert({
    title: a.title, slug, body_md: body, excerpt, author: a.name, author_country: a.country, is_contributor: true,
    status: 'draft', updated_at: new Date().toISOString(),
  }).select('id').single()
  if (error || !post) redirect(`/admin/submissions?error=${encodeURIComponent(error?.message ?? 'Could not create the post')}`)
  await db.from('article_submissions').update({ status: 'approved', post_id: post.id }).eq('id', id)
  redirect(`/admin/posts/${post.id}?from=submission`)
}

export async function setArticleStatus(id: string, status: 'new' | 'declined') {
  const { db } = await requireAdmin()
  await db.from('article_submissions').update({ status }).eq('id', id)
  refreshPage()
}

export async function deleteArticle(id: string) {
  const { db } = await requireAdmin()
  await db.from('article_submissions').delete().eq('id', id)
  refreshPage()
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
export async function loadStarter(kind: 'faqs' | 'quiz' | 'quotes') {
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
  } else if (kind === 'quotes') {
    const { loadStarterQuotes } = await import('@/lib/quotes')
    const starter = await loadStarterQuotes()
    const { data } = await db.from('quotes').select('text')
    const have = new Set((data ?? []).map((r) => (r.text as string).toLowerCase()))
    const rows = starter.filter((q) => !have.has(q.text.toLowerCase())).map((q) => ({ ...q, status: 'published' }))
    for (let i = 0; i < rows.length; i += 100) {
      const { error } = await db.from('quotes').insert(rows.slice(i, i + 100))
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


// ---------------- Parish directory ----------------
type Db = Awaited<ReturnType<typeof requireAdmin>>['db']

/** A parish's web address: its name, made unique within its diocese (-2, -3 …). A saved parish keeps its address. */
async function uniqueParishSlug(db: Db, dioceseId: string, name: string, id: string | null) {
  if (id) {
    const { data } = await db.from('churches').select('slug, diocese_id').eq('id', id).maybeSingle()
    if (data?.slug && data.diocese_id === dioceseId) return data.slug as string
  }
  const base = dirSlug(name)
  const { data: taken } = await db.from('churches').select('slug').eq('diocese_id', dioceseId).like('slug', `${base}%`)
  const used = new Set((taken ?? []).map((r) => r.slug as string))
  if (!used.has(base)) return base
  for (let n = 2; ; n++) if (!used.has(`${base}-${n}`)) return `${base}-${n}`
}

/** Approve a parish sent by a visitor: add it, or apply the correction to the listed parish. */
export async function approveParish(id: string) {
  const { db } = await requireAdmin()
  const { data: s } = await db.from('church_submissions').select('*').eq('id', id).maybeSingle()
  if (!s) redirect('/admin/parish-submissions')
  const fields: Record<string, unknown> = {}
  for (const k of ['deanery', 'address', 'map_url', 'mass_times', 'phone', 'email', 'website', 'lat', 'lng']) if (s[k] !== null && s[k] !== '') fields[k] = s[k]
  let churchId = s.church_id as string | null
  if (s.kind === 'update' && churchId) {
    // Listed contact details are only changed by the admin directly, after the parish writes in.
    const { data: now } = await db.from('churches').select('phone, email, website').eq('id', churchId).maybeSingle()
    for (const k of ['phone', 'email', 'website'] as const) if (now?.[k]) delete fields[k]
    const { error } = await db.from('churches').update({ ...fields, name: s.name, diocese_id: s.diocese_id, updated_at: new Date().toISOString() }).eq('id', churchId)
    if (error) redirect(`/admin/parish-submissions?error=${encodeURIComponent(error.message)}`)
  } else {
    const slug = await uniqueParishSlug(db, s.diocese_id as string, s.name as string, null)
    const { data: d } = await db.from('dioceses').select('name, kind, country').eq('id', s.diocese_id).maybeSingle()
    const { data: made, error } = await db.from('churches').insert({ ...fields, name: s.name, diocese_id: s.diocese_id, slug, country: d?.country ?? null, diocese: d?.name ?? null, status: 'published' }).select('id').single()
    if (error) redirect(`/admin/parish-submissions?error=${encodeURIComponent(error.message)}`)
    churchId = made?.id ?? null
  }
  await db.from('church_submissions').update({ status: 'approved', church_id: churchId }).eq('id', id)
  refresh(['churches', 'content'])
  redirect('/admin/parish-submissions?approved=1')
}

export async function declineParish(id: string) {
  const { db } = await requireAdmin()
  await db.from('church_submissions').update({ status: 'declined' }).eq('id', id)
  redirect('/admin/parish-submissions')
}
