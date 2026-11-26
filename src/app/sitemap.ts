import type { MetadataRoute } from 'next'
import { getBooks, getChaplets, getChurches, getDioceses, getNovenas, getPosts, getPrayers, getRecentReadings, getSongs } from '@/lib/data'
import { continentPath, countryPath, diocesePath, parishPath } from '@/lib/directory'
import { getFaqs, getQuizBank } from '@/lib/faith'
import { QUIZ_PER_PAGE, QUIZ_TOPICS, topicOf } from '@/lib/quiz-topics'
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
  const [posts, songs, books, novenas, prayers, readings, saints, chaplets, dioceses, churches] = await Promise.all([
    getPosts(1000), getSongs(1000), getBooks(), getNovenas(), getPrayers(), getRecentReadings(400), saintSlugs(), getChaplets(), getDioceses(), getChurches(),
  ])
  const [faqs, quiz] = await Promise.all([getFaqs(), getQuizBank()])
  // Catholic Q&A pages and quiz topic pages (every part of each topic).
  const faith = [
    ...faqs.map((f) => ({ url: u(`/faith-questions/${f.slug}`), priority: 0.7 })),
    ...QUIZ_TOPICS.flatMap((t) => {
      const n = Math.max(1, Math.ceil(quiz.filter((q) => topicOf(q) === t.slug).length / QUIZ_PER_PAGE))
      return Array.from({ length: n }, (_, i) => ({ url: u(`/quiz/topics/${t.slug}${i ? `?page=${i + 1}` : ''}`), priority: i ? 0.5 : 0.7 }))
    }),
  ]
  // Parish directory: every country, each diocese that has parishes (empty ones are kept out of Google), and every parish.
  const byId = new Map(dioceses.map((d) => [d.id, d]))
  const withParishes = new Set(churches.map((c) => c.diocese_id))
  const directory = [
    ...[...new Set(dioceses.map((d) => d.continent))].map((c) => ({ url: u(continentPath(c)), priority: 0.6 })),
    ...[...new Set(dioceses.map((d) => d.country))].map((c) => ({ url: u(countryPath(c)), priority: 0.6 })),
    ...dioceses.filter((d) => withParishes.has(d.id)).map((d) => ({ url: u(diocesePath(d)), priority: 0.6 })),
    ...churches.filter((c) => c.diocese_id && byId.has(c.diocese_id)).map((c) => ({ url: u(parishPath(c, byId.get(c.diocese_id!)!)), lastModified: c.updated_at ?? undefined, priority: 0.5 })),
  ]
  const fixed = ['', '/about', '/contact', '/donate', '/prayer-requests', '/mass-readings', '/novenas', '/daily-prayers', '/chaplets', '/saint-of-the-day', '/blog', '/audio', '/quotes', '/rosary', '/faith-questions', '/quiz', '/quiz/bank', '/write-for-us', '/ebooks', '/churches', '/privacy', '/terms', '/cookies', '/disclaimer']
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
    ...faith,
    ...directory,
    { url: u('/churches/add'), priority: 0.5 },
  ]
}
