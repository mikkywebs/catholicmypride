import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { cacheLife, cacheTag } from 'next/cache'
import { publicClient } from './supabase/public'

export type QuoteKind = 'jesus' | 'mary' | 'bible' | 'saint' | 'pope' | 'bishop' | 'scholar' | 'church'
export type Quote = { id: string; text: string; author: string; source: string | null; kind: QuoteKind; show_on: string | null }
export const KIND_LABEL: Record<QuoteKind, string> = {
  jesus: 'Jesus', mary: 'Our Lady', bible: 'The Bible', saint: 'The Saints', pope: 'The Popes', bishop: 'Bishops', scholar: 'Catholic Scholars', church: 'The Church',
}

type StarterQuote = Omit<Quote, 'id' | 'show_on'>
let starter: Promise<StarterQuote[]> | null = null
export const loadStarterQuotes = (): Promise<StarterQuote[]> => (starter ??= readFile(path.join(process.cwd(), 'data/faith/quotes.json'), 'utf8').then((t) => JSON.parse(t) as StarterQuote[]).catch(() => [] as StarterQuote[]))

/** All published quotes (database first; the bundled library until quotes are loaded in the admin). */
export async function getQuotes(): Promise<Quote[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('quotes')
  const db = publicClient()
  if (db) {
    const { data, error } = await db.from('quotes').select('id, text, author, source, kind, show_on').eq('status', 'published').limit(5000)
    if (!error && data && data.length) return data as Quote[]
  }
  return (await loadStarterQuotes()).map((q, i) => ({ ...q, id: `starter-${i}`, show_on: null }))
}

/** Quote of the Day: one chosen for that date in the admin, otherwise the library in a fixed mixed order, one per day. */
export function quoteFor(list: Quote[], date: string): Quote | null {
  if (!list.length) return null
  const chosen = list.find((q) => q.show_on === date)
  if (chosen) return chosen
  const pool = list.filter((q) => !q.show_on).sort((a, b) => hash(a.text) - hash(b.text))
  if (!pool.length) return list[0]
  const day = Math.floor(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10)) / 86_400_000)
  return pool[day % pool.length]
}
function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
