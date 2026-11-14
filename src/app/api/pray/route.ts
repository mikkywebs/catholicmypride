import type { NextRequest } from 'next/server'
import { publicClient } from '@/lib/supabase/public'

// "I prayed" on the Prayer Wall.
export async function POST(req: NextRequest) {
  const db = publicClient()
  let b: { id?: string; delta?: number } = {}
  try { b = await req.json() } catch {}
  if (!db || !b.id || !/^[0-9a-f-]{36}$/i.test(b.id)) return Response.json({ count: 0 }, { status: 400 })
  const { data } = await db.rpc('pray_for', { p_id: b.id, p_delta: b.delta && b.delta < 0 ? -1 : 1 })
  return Response.json({ count: Number(data ?? 0) })
}
