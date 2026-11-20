'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { BRANDS, BrandIcon } from './icons'

export type MilestoneLinks = { whatsapp: string | null; youtube: string | null }

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100
  return `${n.toLocaleString()}${s[(v - 20) % 10] || s[v] || s[0]}`
}
const done = (k: string) => { try { return localStorage.getItem(k) === '1' } catch { return false } }
export const markJoined = (k: 'cmp-joined-whatsapp' | 'cmp-followed-youtube') => { try { localStorage.setItem(k, '1') } catch {} }

/** Confetti thank-you for the visitor who brought a page to a milestone (50, 100, 200, 500, 1,000…). */
export function MilestoneCelebration({ views, links }: { views: number; links: MilestoneLinks }) {
  const [open, setOpen] = useState(true)
  const [joined] = useState(() => ({ wa: done('cmp-joined-whatsapp'), yt: done('cmp-followed-youtube') }))

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    import('canvas-confetti').then(({ default: confetti }) => {
      const colors = ['#f2a65a', '#a64f0c', '#1f2430', '#ffffff']
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors, zIndex: 80 })
      setTimeout(() => confetti({ particleCount: 90, spread: 110, origin: { y: 0.5 }, colors, zIndex: 80 }), 400)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-[rgba(20,23,31,0.55)] p-4" onClick={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-labelledby="ms-title" onClick={(e) => e.stopPropagation()} className="flex w-full max-w-[460px] flex-col items-center gap-3 rounded-2xl bg-bg px-6 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <span className="text-5xl" aria-hidden="true">🎉</span>
        <p className="eyebrow m-0">A milestone, thanks to you!</p>
        <h2 id="ms-title" className="m-0 font-serif text-[30px] font-semibold leading-tight">You are our {ordinal(views)} visitor on this page</h2>
        <p className="m-0 text-muted">Thank you for helping us share the faith. As our way of saying thank you, we would love to pray for you and your intentions.</p>
        <Link href="/prayer-requests" onClick={() => setOpen(false)} className="mt-1 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 font-bold text-accent-ink no-underline hover:text-accent-ink">🙏 Send us your prayer request</Link>
        {links.whatsapp && !joined.wa && (
          <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => markJoined('cmp-joined-whatsapp')} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#25d366] px-6 font-bold text-[#0b3d1f] no-underline hover:text-[#0b3d1f]">
            <BrandIcon icon={BRANDS.whatsapp} size={20} color="currentColor" /> Join our WhatsApp Channel
          </a>
        )}
        {links.youtube && !joined.yt && (
          <a href={links.youtube} target="_blank" rel="noopener noreferrer" onClick={() => markJoined('cmp-followed-youtube')} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-line bg-surface px-6 font-bold text-ink no-underline hover:text-ink">
            <BrandIcon icon={BRANDS.youtube} size={22} /> Subscribe on YouTube
          </a>
        )}
        <button type="button" onClick={() => setOpen(false)} className="mt-1 text-sm font-semibold text-muted">Continue reading</button>
      </div>
    </div>
  )
}
