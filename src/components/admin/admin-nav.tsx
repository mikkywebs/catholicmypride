'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useCallback, useEffect, useRef, useState } from 'react'

type Item = { id: string; name: string | null; detail: string; created_at: string }
type Alert = { key: string; kind: 'prayer' | 'message' | 'asked'; title: string; body: string; href: string }

const PRAYERS = '/admin/prayer-requests'
const MESSAGES = '/admin/messages'
const ASKED = '/admin/faq-requests'

let db: ReturnType<typeof createBrowserClient> | null = null
const client = () => (db ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!))

function chime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    ;[880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.frequency.value = f; o.type = 'sine'
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18)
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + i * 0.18 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.5)
      o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + i * 0.18); o.stop(ctx.currentTime + i * 0.18 + 0.55)
    })
  } catch {}
}

/** Admin menu with live counts, plus a pop-up whenever a prayer request or message arrives. */
export function AdminNav({ nav, children }: { nav: [string, string][]; children?: React.ReactNode }) {
  const path = usePathname()
  const [counts, setCounts] = useState({ prayers: 0, messages: 0, asked: 0 })
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [perm, setPerm] = useState<NotificationPermission | 'unsupported'>('unsupported')
  const seen = useRef<Set<string> | null>(null)

  const announce = useCallback((a: Alert) => {
    setAlerts((x) => (x.some((y) => y.key === a.key) ? x : [a, ...x].slice(0, 5)))
    chime()
    try {
      if ('Notification' in window && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
        const n = new Notification(a.title, { body: a.body, tag: a.key, icon: '/icon-192.png' })
        n.onclick = () => { window.focus(); window.location.href = a.href }
      }
    } catch {}
  }, [])

  const toAlert = (kind: Alert['kind'], r: Item): Alert => ({
    key: `${kind}:${r.id}`,
    kind,
    title: kind === 'prayer' ? 'New prayer request' : kind === 'asked' ? 'New question about the faith' : 'New message',
    body: [r.name || 'Anonymous', r.detail].filter(Boolean).join(' — ').slice(0, 160),
    href: kind === 'prayer' ? PRAYERS : kind === 'asked' ? ASKED : MESSAGES,
  })

  const load = useCallback(async () => {
    const s = client()
    const [p, m, q] = await Promise.all([
      s.from('prayer_requests').select('id, name, country, body, created_at', { count: 'exact' }).eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
      s.from('contact_messages').select('id, name, subject, message, created_at', { count: 'exact' }).eq('is_read', false).order('created_at', { ascending: false }).limit(5),
      s.from('faq_submissions').select('id, name, country, question, created_at', { count: 'exact' }).eq('status', 'new').order('created_at', { ascending: false }).limit(5),
    ])
    if (p.error && m.error) return
    setCounts({ prayers: p.count ?? 0, messages: m.count ?? 0, asked: q.error ? 0 : q.count ?? 0 })
    const items: [Alert['kind'], Item][] = [
      ...((p.data ?? []) as { id: string; name: string | null; country: string | null; body: string; created_at: string }[]).map((r) => ['prayer', { id: r.id, name: r.name, detail: [r.country, r.body].filter(Boolean).join(': '), created_at: r.created_at }] as [Alert['kind'], Item]),
      ...((q.error ? [] : q.data ?? []) as { id: string; name: string | null; country: string | null; question: string; created_at: string }[]).map((r) => ['asked', { id: r.id, name: r.name, detail: [r.country, r.question].filter(Boolean).join(': '), created_at: r.created_at }] as [Alert['kind'], Item]),
      ...((m.data ?? []) as { id: string; name: string; subject: string | null; message: string; created_at: string }[]).map((r) => ['message', { id: r.id, name: r.name, detail: r.subject || r.message, created_at: r.created_at }] as [Alert['kind'], Item]),
    ]
    if (!seen.current) { seen.current = new Set(items.map(([k, r]) => `${k}:${r.id}`)); return }
    for (const [k, r] of items) {
      const key = `${k}:${r.id}`
      if (!seen.current.has(key)) { seen.current.add(key); announce(toAlert(k, r)) }
    }
  }, [announce])

  // Counts on every page change, every 30 seconds, and when the tab comes back.
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t) }, [load, path])
  useEffect(() => {
    const t = setInterval(load, 30000)
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => { clearInterval(t); window.removeEventListener('focus', onFocus) }
  }, [load])

  // Instant alerts.
  useEffect(() => {
    const s = client()
    let channel: ReturnType<typeof s.channel> | null = null
    let alive = true
    s.auth.getSession().then(({ data }: { data: { session: { access_token: string } | null } }) => {
      if (!alive || !data.session) return
      s.realtime.setAuth(data.session.access_token)
      channel = s.channel('admin-alerts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_requests' }, () => load())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => load())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'faq_submissions' }, () => load())
        .subscribe()
    })
    return () => { alive = false; if (channel) s.removeChannel(channel) }
  }, [load])

  useEffect(() => {
    const id = setTimeout(() => {
      const dismissed = (() => { try { return localStorage.getItem('cmp-notify-dismissed') === '1' } catch { return false } })()
      setPerm('Notification' in window ? (dismissed && Notification.permission === 'default' ? 'denied' : Notification.permission) : 'unsupported')
    }, 0)
    return () => clearTimeout(id)
  }, [])

  const total = counts.prayers + counts.messages + counts.asked
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, '')
    document.title = total ? `(${total}) ${base}` : base
  }, [total, path])

  const badge = (href: string) => {
    const n = href === PRAYERS ? counts.prayers : href === MESSAGES ? counts.messages : href === ASKED ? counts.asked : 0
    return n > 0 ? <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[#d93025] px-1.5 text-[12px] font-bold leading-5 text-white" aria-label={`${n} new`}>{n}</span> : null
  }

  return (
    <>
      <nav aria-label="Admin" className="flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
        {nav.map(([label, href]) => (
          <Link key={href} href={href} className={`inline-flex items-center py-2 no-underline hover:text-navy-ink ${path === href ? 'text-navy-ink' : 'text-navy-muted'}`}>{label}{badge(href)}</Link>
        ))}
        {children}
      </nav>

      <div className="fixed bottom-5 right-5 z-50 flex w-[min(380px,calc(100vw-40px))] flex-col gap-3" aria-live="assertive">
        {perm === 'default' && (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5 text-sm text-ink shadow-lg">
            <span className="flex-1">Get a pop-up on this computer even when the admin tab is in the background?</span>
            <button type="button" onClick={() => Notification.requestPermission().then(setPerm)} className="rounded-md bg-accent px-3 py-1.5 font-semibold text-accent-ink">Turn on</button>
            <button type="button" onClick={() => { setPerm('denied'); try { localStorage.setItem('cmp-notify-dismissed', '1') } catch {} }} className="text-muted" aria-label="Not now">✕</button>
          </div>
        )}
        {alerts.map((a) => (
          <div key={a.key} role="alert" className="flex gap-3 rounded-xl border-l-4 border-accent bg-surface p-4 text-ink shadow-xl">
            <span aria-hidden="true" className="text-2xl leading-none">{a.kind === 'prayer' ? '🙏' : a.kind === 'asked' ? '❓' : '✉️'}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <strong>{a.title}</strong>
              <span className="line-clamp-2 text-sm text-muted">{a.body}</span>
              <Link href={a.href} onClick={() => setAlerts((x) => x.filter((y) => y.key !== a.key))} className="pt-1 text-sm font-semibold">Open {a.kind === 'prayer' ? 'prayer requests' : a.kind === 'asked' ? 'asked questions' : 'messages'} →</Link>
            </div>
            <button type="button" onClick={() => setAlerts((x) => x.filter((y) => y.key !== a.key))} className="self-start text-muted" aria-label="Dismiss">✕</button>
          </div>
        ))}
      </div>
    </>
  )
}
