import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { publicClient } from './supabase/public'
import { lectionaryReading } from './lectionary'
import type { Book, Category, Chaplet, Church, Novena, Post, Prayer, PublicPrayerRequest, Reading, Saint, Region, Settings, Song } from './types'

// Every public read is cached and tagged. Admin saves call updateTag(<tag>)
// so changes appear straight away.

const DEFAULT_SETTINGS: Settings = {
  site_name: 'Catholic My Pride',
  tagline: 'Apostolate',
  mission: "Spreading the Gospel, strengthening the Catholic faith and sharing Christ's love.",
  logo_url: null,
  hero_image_url: null,
  hero_title: "Spreading the Gospel, sharing Christ's love",
  hero_subtitle: 'Prayers, novenas, Scripture reflections and hymns for every day of the Church year.',
  about_image_url: null,
  about_story_title: null,
  about_story_md: null,
  contact_email: 'cmpapostolate@gmail.com',
  contact_phone: null,
  contact_address: null,
  youtube_url: 'https://www.youtube.com/@CMPApostolate',
  facebook_url: null,
  tiktok_url: null,
  x_url: null,
  extra_social: [],
  donate_url: 'https://selar.com/showlove/catholicmypride',
  bank_account_name: null,
  bank_name: null,
  bank_account_number: null,
  donate_needs_md: null,
  view_threshold: 0,
  music_fallback: 'songs',
  music_loop: 'loop',
}


export async function getSettings(): Promise<Settings> {
  'use cache'
  cacheLife('hours')
  cacheTag('settings')
  const db = publicClient()
  if (!db) return DEFAULT_SETTINGS
  const { data } = await db.from('settings').select('*').eq('id', 1).maybeSingle()
  return { ...DEFAULT_SETTINGS, ...(data ?? {}) }
}

export async function getCategories(kind: string): Promise<Category[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('categories')
  const db = publicClient()
  if (!db) return []
  const { data } = await db.from('categories').select('*').eq('kind', kind).order('sort').order('name')
  return data ?? []
}

/** Which sections have published content. Drives the menu, footer and home page. */
export async function getSectionFlags() {
  'use cache'
  cacheLife('minutes')
  cacheTag('content')
  const db = publicClient()
  const empty = { blog: false, songs: false, books: false, churches: false, novenas: false, readings: false, saints: false, prayers: false, chaplets: false, wall: false }
  if (!db) return empty
  const head = async (table: string) => {
    const { count } = await db.from(table).select('id', { count: 'exact', head: true })
    return (count ?? 0) > 0
  }
  const [blog, songs, books, churches, novenas, readings, saints, prayers, chaplets, wall] = await Promise.all([
    head('posts'), head('songs'), head('books'), head('churches'), head('novenas'),
    Promise.resolve(true), head('saints'), head('prayers'), head('chaplets'), head('public_prayer_requests'),
  ])
  return { blog, songs, books, churches, novenas, readings, saints, prayers, chaplets, wall }
}

// ---------- Blog ----------
export async function getPosts(limit = 12, categorySlug?: string): Promise<Post[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts')
  const db = publicClient()
  if (!db) return []
  let q = db.from('posts').select('*, category:categories(*)').order('published_at', { ascending: false }).limit(limit)
  if (categorySlug) {
    const { data: cat } = await db.from('categories').select('id').eq('kind', 'blog').eq('slug', categorySlug).maybeSingle()
    if (!cat) return []
    q = q.eq('category_id', cat.id)
  }
  const { data } = await q
  return (data as Post[]) ?? []
}

export async function getPost(slug: string): Promise<Post | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts', `post:${slug}`)
  const db = publicClient()
  if (!db) return null
  const { data } = await db.from('posts').select('*, category:categories(*)').eq('slug', slug).maybeSingle()
  return (data as Post) ?? null
}

export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('posts')
  const db = publicClient()
  if (!db) return []
  let q = db.from('posts').select('*').neq('id', post.id).order('published_at', { ascending: false }).limit(limit)
  if (post.category_id) q = q.eq('category_id', post.category_id)
  const { data } = await q
  return (data as Post[]) ?? []
}

// ---------- Songs ----------
export async function getSongs(limit = 50): Promise<Song[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('songs')
  const db = publicClient()
  if (!db) return []
  const { data } = await db.from('songs').select('*, category:categories(*)').order('published_at', { ascending: false }).limit(limit)
  return (data as Song[]) ?? []
}

export async function getSong(slug: string): Promise<Song | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('songs', `song:${slug}`)
  const db = publicClient()
  if (!db) return null
  const { data } = await db.from('songs').select('*, category:categories(*)').eq('slug', slug).maybeSingle()
  return (data as Song) ?? null
}

// ---------- Mass readings ----------
export async function getReading(date: string): Promise<Reading | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('readings', `reading:${date}`)
  const db = publicClient()
  if (!db) return lectionaryReading(date)
  const { data } = await db.from('readings').select('*').eq('date', date).maybeSingle()
  // Nothing saved by the admin for this date: show the day's readings from the lectionary.
  return (data as Reading) ?? (await lectionaryReading(date))
}

export async function getRecentReadings(limit = 14): Promise<Pick<Reading, 'date' | 'title' | 'gospel_ref'>[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('readings')
  const db = publicClient()
  if (!db) return []
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: process.env.SITE_TIMEZONE || 'Africa/Lagos' }).format(new Date())
  const { data } = await db.from('readings').select('date, title, gospel_ref').lte('date', today).order('date', { ascending: false }).limit(limit)
  // Fill the days the admin has not saved from the lectionary, so the list never has gaps.
  const saved = new Map((data ?? []).map((r) => [r.date as string, r]))
  const out: Pick<Reading, 'date' | 'title' | 'gospel_ref'>[] = []
  const d = new Date(`${today}T12:00:00Z`)
  for (let i = 0; i < limit; i++, d.setUTCDate(d.getUTCDate() - 1)) {
    const iso = d.toISOString().slice(0, 10)
    const row = saved.get(iso) ?? (await lectionaryReading(iso))
    if (row) out.push({ date: iso, title: row.title, gospel_ref: row.gospel_ref })
  }
  return out
}

// ---------- Novenas ----------
export async function getNovenas(): Promise<Novena[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('novenas')
  const db = publicClient()
  if (!db) return []
  const { data } = await db.from('novenas').select('*').order('feast_date', { ascending: true })
  return (data as Novena[]) ?? []
}

export async function getNovena(slug: string): Promise<Novena | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('novenas', `novena:${slug}`)
  const db = publicClient()
  if (!db) return null
  const { data } = await db.from('novenas').select('*, days:novena_days(*)').eq('slug', slug).maybeSingle()
  if (!data) return null
  const n = data as Novena
  n.days = (n.days ?? []).sort((a, b) => a.day - b.day)
  return n
}

// ---------- Saints ----------
export async function getSaintForDate(date: string): Promise<Saint | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('saints')
  const db = publicClient()
  if (!db) return null
  const { data } = await db.from('saints').select('*').lte('show_on', date).order('show_on', { ascending: false }).limit(1).maybeSingle()
  return (data as Saint) ?? null
}

export async function getSaint(slug: string): Promise<Saint | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('saints', `saint:${slug}`)
  const db = publicClient()
  if (!db) return null
  const { data } = await db.from('saints').select('*').eq('slug', slug).maybeSingle()
  return (data as Saint) ?? null
}

export async function getSaintsAround(date: string): Promise<Saint[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('saints')
  const db = publicClient()
  if (!db) return []
  const { data } = await db.from('saints').select('*').lte('show_on', date).order('show_on', { ascending: false }).limit(5)
  return (data as Saint[]) ?? []
}

// ---------- Prayers ----------
export async function getPrayers(): Promise<Prayer[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('prayers')
  const db = publicClient()
  if (!db) return []
  const { data } = await db.from('prayers').select('*, category:categories(*)').order('title')
  return (data as Prayer[]) ?? []
}

export async function getPrayer(slug: string): Promise<Prayer | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('prayers', `prayer:${slug}`)
  const db = publicClient()
  if (!db) return null
  const { data } = await db.from('prayers').select('*, category:categories(*)').eq('slug', slug).maybeSingle()
  return (data as Prayer) ?? null
}

// ---------- Chaplets ----------
export async function getChaplets(): Promise<Chaplet[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('chaplets')
  const db = publicClient()
  if (!db) return []
  const { data } = await db.from('chaplets').select('*').order('sort').order('title')
  return (data as Chaplet[]) ?? []
}

export async function getChaplet(slug: string): Promise<Chaplet | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('chaplets', `chaplet:${slug}`)
  const db = publicClient()
  if (!db) return null
  const { data } = await db.from('chaplets').select('*').eq('slug', slug).maybeSingle()
  return (data as Chaplet) ?? null
}

// ---------- Books ----------
export async function getBooks(): Promise<Book[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('books')
  const db = publicClient()
  if (!db) return []
  const { data } = await db.from('books').select('*, category:categories(*)').order('published_at', { ascending: false })
  return (data as Book[]) ?? []
}

export async function getBook(slug: string): Promise<Book | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('books', `book:${slug}`)
  const db = publicClient()
  if (!db) return null
  const { data } = await db.from('books').select('*, category:categories(*)').eq('slug', slug).maybeSingle()
  return (data as Book) ?? null
}

// ---------- Churches ----------
export async function getChurches(): Promise<Church[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('churches')
  const db = publicClient()
  if (!db) return []
  const { data } = await db.from('churches').select('id, name, address, map_url, deanery, diocese_id, diocese:dioceses(*)').not('diocese_id', 'is', null).order('name').limit(5000)
  return (data as unknown as Church[]) ?? []
}

export async function getDirectoryRegions(): Promise<Region[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('churches')
  const db = publicClient()
  if (!db) return []
  const { data } = await db.from('directory_regions').select('id, continent, country, province, total_provinces, total_dioceses, total_parishes, total_priests, catholic_population').limit(2000)
  return (data as Region[]) ?? []
}

// ---------- Prayer wall ----------
export async function getPrayerWall(limit = 40): Promise<PublicPrayerRequest[]> {
  'use cache'
  cacheLife('minutes')
  cacheTag('prayer-wall')
  const db = publicClient()
  if (!db) return []
  const { data } = await db.from('public_prayer_requests').select('*').order('created_at', { ascending: false }).limit(limit)
  return data ?? []
}

// ---------- Home images ----------
export async function getHomeImages(): Promise<Record<string, { url: string; alt: string | null }>> {
  'use cache'
  cacheLife('hours')
  cacheTag('home-images')
  const db = publicClient()
  if (!db) return {}
  const { data } = await db.from('homepage_images').select('*')
  return Object.fromEntries((data ?? []).map((r) => [r.key, { url: r.url, alt: r.alt }]))
}

