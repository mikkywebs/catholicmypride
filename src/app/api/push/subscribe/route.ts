import type { NextRequest } from 'next/server'
import { publicClient } from '@/lib/supabase/public'

// A phone turns prayer reminders on (POST) or off (DELETE).
export async function POST(req: NextRequest) {
  const db = publicClient()
  let b: { endpoint?: string; keys?: { p256dh?: string; auth?: string }; tz?: string } = {}
  try { b = await req.json() } catch {}
  if (!db || !b.endpoint?.startsWith('https://') || !b.keys?.p256dh || !b.keys?.auth) return Response.json({ ok: false }, { status: 400 })
  const { error } = await db.rpc('push_subscribe', { p_endpoint: b.endpoint, p_p256dh: b.keys.p256dh, p_auth: b.keys.auth, p_tz: b.tz ?? 'UTC' })
  return Response.json({ ok: !error }, { status: error ? 500 : 200 })
}

export async function DELETE(req: NextRequest) {
  const db = publicClient()
  let b: { endpoint?: string } = {}
  try { b = await req.json() } catch {}
  if (db && b.endpoint) await db.rpc('push_unsubscribe', { p_endpoint: b.endpoint })
  return Response.json({ ok: true })
}
