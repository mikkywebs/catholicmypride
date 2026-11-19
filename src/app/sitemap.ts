import type { MetadataRoute } from 'next'
import { getBooks, getChaplets, getNovenas, getPosts, getPrayers, getRecentReadings, getSongs } from '@/lib/data'
import { publicClient } from '@/lib/supabase/public'
import { SITE_URL } from '@/lib/format'

async function saintSlugs() {
  'use cache'
  const db = publicClient()
  if (!db) return []
  const { data } = await db.from('saints').select('slug, updated_at').limit(1000)
  return data ?? []
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const u = (p: string) => `${SITE_URL}${p}`
  const [posts, songs, books, novenas, prayers, readings, saints, chaplets] = await Promise.all([
    getPosts(1000), getSongs(1000), getBooks(), getNovenas(), getPrayers(), getRecentReadings(400), saintSlugs(), getChaplets(),
  ])
  const fixed = ['', '/about', '/contact', '/donate', '/prayer-requests', '/mass-readings', '/novenas', '/daily-prayers', '/chaplets', '/saint-of-the-day', '/blog', '/audio', '/ebooks', '/churches', '/privacy', '/terms', '/cookies', '/disclaimer']
  return [
    ...fixed.map((p) => ({ url: u(p || '/'), changeFrequency: 'daily' as const, priority: p === '' ? 1 : 0.7 })),
    ...posts.filter((p) => !p.noindex).map((p) => ({ url: u(`/blog/${p.slug}`), lastModified: p.updated_at, priority: 0.8 })),
    ...readings.map((r) => ({ url: u(`/mass-readings/${r.date}`), lastModified: r.date, priority: 0.8 })),
    ...novenas.map((n) => ({ url: u(`/novenas/${n.slug}`), priority: 0.7 })),
    ...saints.map((s) => ({ url: u(`/saint-of-the-day/${s.slug}`), lastModified: s.updated_at, priority: 0.6 })),
    ...chaplets.map((c) => ({ url: u(`/chaplets/${c.slug}`), priority: 0.7 })),
    ...prayers.map((p) => ({ url: u(`/daily-prayers/${p.slug}`), priority: 0.6 })),
    ...songs.map((s) => ({ url: u(`/audio/${s.slug}`), priority: 0.6 })),
    ...books.map((b) => ({ url: u(`/ebooks/${b.slug}`), priority: 0.6 })),
  ]
}
