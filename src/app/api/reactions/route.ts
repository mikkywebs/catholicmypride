import type { NextRequest } from 'next/server'
import { publicClient } from '@/lib/supabase/public'

const TYPES = new Set(['song', 'reading', 'post'])
const KINDS = new Set(['wow', 'awesome', 'emotional', 'love', 'amen', 'thumbs'])

export async function GET(req: NextRequest) {
  const db = publicClient()
  const type = req.nextUrl.searchParams.get('type') ?? ''
  const id = req.nextUrl.searchParams.get('id') ?? ''
  if (!db || !TYPES.has(type) || !id) return Response.json({})
  const { data } = await db.from('reactions').select('kind, count').eq('content_type', type).eq('content_id', id)
  return Response.json(Object.fromEntries((data ?? []).map((r) => [r.kind, r.count])))
}

export async function POST(req: NextRequest) {
  const db = publicClient()
  let b: { type?: string; id?: string; kind?: string; delta?: number } = {}
  try { b = await req.json() } catch {}
  if (!db || !b.type || !TYPES.has(b.type) || !b.kind || !KINDS.has(b.kind) || !b.id) return Response.json({ count: 0 }, { status: 400 })
  const { data } = await db.rpc('react', { p_type: b.type, p_id: String(b.id).slice(0, 80), p_kind: b.kind, p_delta: b.delta && b.delta < 0 ? -1 : 1 })
  return Response.json({ count: Number(data ?? 0) })
}
