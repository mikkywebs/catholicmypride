'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useClientValue } from './use-client'
import { browserPublicClient } from '@/lib/supabase/browser'
import { ArrowUp, BrandIcon, BRANDS, EyeIcon, LinkIcon, MailIcon } from './icons'

/** Thin reading-progress bar at the top, and a back-to-top button. */
export function ScrollTools() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const on = () => {
      const d = document.documentElement
      const max = d.scrollHeight - window.innerHeight
      setP(max > 0 ? Math.min(100, Math.max(0, (d.scrollTop / max) * 100)) : 0)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [])
  return (
    <>
      <div role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p)} className="fixed inset-x-0 top-0 z-[60] h-1 bg-accent/15">
        <div className="h-1 rounded-r bg-accent" style={{ width: `${p}%` }} />
      </div>
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-28 right-6 z-[60] flex size-13 items-center justify-center rounded-full bg-navy text-navy-ink shadow-[0_8px_20px_rgba(31,36,48,0.25)] transition ${p > 8 ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <ArrowUp />
      </button>
    </>
  )
}

/** Share buttons shown right after each featured image. */
export function ShareBar({ title }: { title: string }) {
  const url = useClientValue(() => window.location.href, '')
  const [copied, setCopied] = useState(false)
  const u = encodeURIComponent(url)
  const tt = encodeURIComponent(title)
  const nets = [
    { name: 'WhatsApp', icon: BRANDS.whatsapp, href: `https://wa.me/?text=${tt}%20${u}` },
    { name: 'Facebook', icon: BRANDS.facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: 'X', icon: BRANDS.x, href: `https://x.com/intent/post?text=${tt}&url=${u}` },
    { name: 'Telegram', icon: BRANDS.telegram, href: `https://t.me/share/url?url=${u}&text=${tt}` },
  ]
  const pill = 'inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-sm font-semibold text-ink no-underline hover:border-ink hover:text-ink'
  return (
    <div role="group" aria-label="Share this page" className="flex flex-wrap items-center gap-2.5">
      <span className="mr-1 text-sm font-semibold text-muted">Share</span>
      {nets.map((n) => (
        <a key={n.name} href={n.href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${n.name}`} className={pill}>
          <BrandIcon icon={n.icon} size={18} color={n.name === 'X' ? 'currentColor' : undefined} /> {n.name}
        </a>
      ))}
      <a href={`mailto:?subject=${tt}&body=${u}`} className={pill} aria-label="Share by email"><MailIcon /> Email</a>
      <button
        type="button"
        className={pill}
        onClick={async () => {
          try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch {}
        }}
      >
        <LinkIcon /> <span aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
      </button>
    </div>
  )
}

/** Records a view for this page and shows the count once it passes the admin's threshold. */
export function ViewCount({ section, threshold }: { section: string; threshold: number }) {
  const path = usePathname()
  const [n, setN] = useState<number | null>(null)
  useEffect(() => {
    const key = `cmp-viewed:${path}`
    const already = (() => { try { return sessionStorage.getItem(key) } catch { return null } })()
    fetch('/api/views', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ path, section, count: Boolean(already) }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.views === 'number') setN(d.views) })
      .catch(() => {})
    try { sessionStorage.setItem(key, '1') } catch {}
  }, [path, section])
  if (n === null || n < threshold) return null
  return <span className="inline-flex items-center gap-1.5"><EyeIcon />{n.toLocaleString()} views</span>
}

export type Kind = 'wow' | 'awesome' | 'emotional' | 'love' | 'amen' | 'thumbs'
const LABEL: Record<Kind, string> = { wow: 'Wow', awesome: 'Awesome', emotional: 'Emotional', love: 'Love', amen: 'Amen', thumbs: 'Thumbs up' }
type ContentKind = 'song' | 'reading' | 'post' | 'novena' | 'chaplet'

/**
 * Reaction buttons. One reaction per visitor per item, remembered in the browser.
 * Counts update live for everyone on the page.
 */
export function Reactions({ type, id, kinds, title, labels, compact }: { type: ContentKind; id: string; kinds: Kind[]; title: string; labels?: Partial<Record<Kind, string>>; compact?: boolean }) {
  const key = `cmp-react:${type}:${id}`
  const [counts, setCounts] = useState<Record<string, number>>({})
  const stored = useClientValue(() => localStorage.getItem(key), null)
  const [override, setMine] = useState<string | null | undefined>(undefined)
  const mine = override === undefined ? stored : override

  useEffect(() => {
    let alive = true
    fetch(`/api/reactions?type=${type}&id=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => { if (alive) setCounts(d ?? {}) })
      .catch(() => {})
    const db = browserPublicClient()
    if (!db) return () => { alive = false }
    const channel = db
      .channel(`reactions:${type}:${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions', filter: `content_id=eq.${id}` }, (payload) => {
        const row = payload.new as { content_type?: string; kind?: string; count?: number }
        if (row?.content_type === type && row.kind && typeof row.count === 'number') {
          setCounts((c) => ({ ...c, [row.kind!]: row.count! }))
        }
      })
      .subscribe()
    return () => { alive = false; db.removeChannel(channel) }
  }, [type, id])

  const send = (kind: Kind, delta: number) =>
    fetch('/api/reactions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type, id, kind, delta }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.count === 'number') setCounts((c) => ({ ...c, [kind]: d.count })) })
      .catch(() => {})

  const pick = (k: Kind) => {
    const prev = mine as Kind | null
    if (prev === k) {
      setMine(null); try { localStorage.removeItem(key) } catch {}
      setCounts((c) => ({ ...c, [k]: Math.max(0, (c[k] ?? 1) - 1) })); send(k, -1); return
    }
    if (prev) { setCounts((c) => ({ ...c, [prev]: Math.max(0, (c[prev] ?? 1) - 1) })); send(prev, -1) }
    setMine(k); try { localStorage.setItem(key, k) } catch {}
    setCounts((c) => ({ ...c, [k]: (c[k] ?? 0) + 1 })); send(k, 1)
  }

  return (
    <section className={`flex flex-col items-center gap-3 text-center ${compact ? '' : 'reveal'}`}>
      <h2 className={`m-0 font-serif font-semibold ${compact ? 'text-[22px]' : 'text-[28px]'}`}>{title}</h2>
      <div className="flex flex-wrap justify-center gap-3">
        {kinds.map((k) => {
          const on = mine === k
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => pick(k)}
              className={`inline-flex min-h-[46px] items-center gap-2.5 rounded-full border px-5 font-semibold transition ${on ? 'border-accent bg-accent text-accent-ink' : 'border-field bg-surface text-ink'}`}
            >
              {labels?.[k] ?? LABEL[k]} <span className="text-sm tabular-nums opacity-80" aria-live="polite">{counts[k] ?? 0}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
