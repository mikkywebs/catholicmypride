import type { NextRequest } from 'next/server'
import { publicClient } from '@/lib/supabase/public'
import { getSettings } from '@/lib/data'

// Totals for a list of pages: GET /api/views?p=/music/a&p=/music/b
export async function GET(req: NextRequest) {
  const db = publicClient()
  const paths = req.nextUrl.searchParams.getAll('p').filter((p) => p.startsWith('/') && p.length <= 300).slice(0, 60)
  if (!db || !paths.length) return Response.json({ threshold: 0, views: {} })
  const [{ data }, s] = await Promise.all([db.rpc('view_counts', { p_paths: paths }), getSettings()])
  const views = Object.fromEntries(((data ?? []) as { path: string; views: number }[]).map((r) => [r.path, Number(r.views)]))
  return Response.json({ threshold: s.view_threshold, views }, { headers: { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=300' } })
}

// Records a page view (country only, from Vercel's header) and returns the total.
export async function POST(req: NextRequest) {
  const db = publicClient()
  if (!db) return Response.json({ views: 0 })
  let body: { path?: string; section?: string; count?: boolean } = {}
  try { body = await req.json() } catch {}
  const path = typeof body.path === 'string' ? body.path.slice(0, 300) : ''
  if (!path.startsWith('/') || path.startsWith('/admin')) return Response.json({ views: 0 })
  if (body.count) {
    // Same visitor reloading: report the total without adding another view.
    const { data, error } = await db.rpc('view_count', { p_path: path })
    if (!error) return Response.json({ views: Number(data ?? 0) })
  }
  const country = req.headers.get('x-vercel-ip-country') ?? null
  const { data } = await db.rpc('record_view', { p_path: path, p_section: body.section ?? null, p_country: country })
  return Response.json({ views: Number(data ?? 0) })
}
