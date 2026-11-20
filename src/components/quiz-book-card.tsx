'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useClientValue } from './use-client'
import { countryName } from '@/lib/country-codes'
import { downloadQuizBook } from '@/lib/quiz-book'

const KEY = 'cmp-quiz-v1'
export const BOOK_WINS = 3

/** Download button for the personalised ebook (for players with 3 wins, in a row or not). */
export function QuizBookButton({ name, country, logoUrl, className = '' }: { name: string; country: string; logoUrl: string; className?: string }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  return (
    <>
      <button type="button" disabled={busy} onClick={async () => {
        setBusy(true); setErr('')
        try { await downloadQuizBook({ name, country, logoUrl }) } catch { setErr('Sorry, the book could not be made. Please try again.') }
        setBusy(false)
      }} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gold px-6 font-bold text-[#1f2430] disabled:opacity-60 ${className}`}>
        {busy ? 'Preparing your book…' : '📘 Download my free ebook (PDF)'}
      </button>
      {err && <p role="alert" className="m-0 text-sm font-semibold text-[#b42318]">{err}</p>}
    </>
  )
}

/** Card on the Ebooks page: the quiz ebook, free for anyone who wins Quiz Time three times. */
export function QuizBookCard({ logoUrl }: { logoUrl: string }) {
  const raw = useClientValue<string | null>(() => localStorage.getItem(KEY), null)
  const saved = useMemo(() => { try { return raw ? JSON.parse(raw) as { profile?: { first: string; last: string; country: string } | null; wins?: number } : null } catch { return null } }, [raw])
  const wins = saved?.wins ?? 0
  const p = saved?.profile
  const unlocked = wins >= BOOK_WINS && p
  return (
    <section className="flex flex-wrap items-center gap-6 rounded-[18px] bg-navy px-6 py-7 text-navy-ink sm:px-9">
      <div className="flex h-44 w-32 shrink-0 flex-col items-center justify-center gap-2 rounded-lg border-2 border-gold bg-[#2a3040] px-3 text-center shadow-[6px_6px_0_rgba(242,166,90,0.35)]">
        <span className="text-3xl" aria-hidden="true">📘</span>
        <span className="font-serif text-[15px] font-semibold leading-tight">Catholic Quiz Questions A–Z</span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-gold">Made for you</span>
      </div>
      <div className="flex min-w-0 flex-1 basis-72 flex-col gap-2.5">
        <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-gold">Free for Quiz Time winners</p>
        <h2 className="m-0 font-serif text-[30px] font-semibold leading-tight">Our Catholic quiz ebook, written specially for you</h2>
        <p className="m-0 text-navy-muted">Hundreds of verified questions about the Catholic faith, from A to Z, with answers, explanations and sources. Win Quiz Time three times (not necessarily in a row) and download your own copy, dedicated to you by name.</p>
        {unlocked ? (
          <div className="flex flex-col items-start gap-2 pt-1">
            <p className="m-0 font-semibold">🎉 Congratulations, {p.first}! Your book is ready.</p>
            <QuizBookButton name={`${p.first} ${p.last}`.trim()} country={countryName(p.country)} logoUrl={logoUrl} />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="rounded-full border border-gold px-3 py-1 text-sm font-semibold">{Math.min(wins, BOOK_WINS)} of {BOOK_WINS} wins</span>
            <Link href="/quiz" className="inline-flex min-h-11 items-center rounded-md bg-gold px-5 font-bold text-[#1f2430] no-underline hover:text-[#1f2430]">Play Quiz Time</Link>
          </div>
        )}
      </div>
    </section>
  )
}
