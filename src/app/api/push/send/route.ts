import type { NextRequest } from 'next/server'
import webpush from 'web-push'
import { publicClient } from '@/lib/supabase/public'
import { clock, dueTimed, type TimedPrayer } from '@/lib/schedule'

// Called by Supabase once a minute. Sends each subscribed phone the prayer that is due on its own clock.
// The password is checked by the database itself, so it never has to be stored in Vercel.

type Sub = { endpoint: string; p256dh: string; auth: string; tz: string; last_key: string | null }

/** The wall-clock time in `tz`, as a Date whose local fields read that time (server runs on UTC). */
function wallClock(tz: string, now: Date) {
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now).map((x) => [x.type, x.value]))
    return new Date(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute))
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const db = publicClient()
  const secret = req.headers.get('x-push-secret') ?? ''
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY
  if (!db || !secret || !pub || !priv) return Response.json({ sent: 0, reason: 'not configured' })
  webpush.setVapidDetails('mailto:info@catholicmypride.org', pub, priv)

  const [{ data: subs }, { data: songs }] = await Promise.all([
    db.rpc('push_targets', { p_secret: secret }),
    db.from('songs').select('id, slug, title, audio_url, bar_times, bar_season').not('bar_times', 'is', null),
  ])
  const prayers: (TimedPrayer & { slug: string })[] = (songs ?? [])
    .filter((x) => x.audio_url && x.bar_times?.length)
    .map((x) => ({ id: x.id, slug: x.slug, title: x.title, times: x.bar_times, season: x.bar_season ?? 'all' }))
  if (!subs?.length || !prayers.length) return Response.json({ sent: 0 })

  const now = new Date()
  let sent = 0
  await Promise.allSettled((subs as Sub[]).map(async (s) => {
    const local = wallClock(s.tz, now)
    const due = local && dueTimed(prayers, local)
    if (!due || s.last_key === due.key) return
    const p = prayers.find((x) => x.id === due.id)!
    const time = clock(p.times.find((t) => due.key.includes(`T${t}:`)) ?? p.times[0])
    const payload = JSON.stringify({ title: `${time} · ${p.title}`, body: 'It is time to pray. Tap to pray with us.', url: `/?pray=${encodeURIComponent(p.slug)}`, tag: due.key })
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 600, urgency: 'high' })
      sent++
      await db.rpc('push_sent', { p_secret: secret, p_endpoint: s.endpoint, p_key: due.key, p_gone: false })
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode
      // 404/410: the phone has unsubscribed or the browser data was cleared.
      if (code === 404 || code === 410) await db.rpc('push_sent', { p_secret: secret, p_endpoint: s.endpoint, p_key: '', p_gone: true })
    }
  }))
  return Response.json({ sent })
}
