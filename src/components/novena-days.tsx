'use client'

import { useState } from 'react'
import { useClientValue } from './use-client'
import { AudioPlayer } from './audio-player'
import { Reactions } from './engage'

type Day = { day: number; title: string | null; html: string; audio_url: string | null; audio_seconds: number | null }

function localISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Day 1–9 picker. Opens on today's day if the novena is running. */
export function NovenaDays({ novenaId, days, startISO, commonHtml, initial }: { novenaId: string; days: Day[]; startISO: string; commonHtml: string; initial: number | null }) {
  const today = useClientValue(() => {
    const start = new Date(startISO + 'T00:00:00')
    const now = new Date(localISO() + 'T00:00:00')
    const n = Math.round((now.getTime() - start.getTime()) / 86_400_000) + 1
    return n >= 1 && n <= 9 ? n : null
  }, null)
  const [picked, setSel] = useState<number | null>(initial)
  const sel = picked ?? today ?? 1

  const d = days.find((x) => x.day === sel)
  const go = (n: number) => {
    setSel(n)
    const url = new URL(window.location.href)
    url.searchParams.set('day', String(n))
    window.history.replaceState(null, '', url)
  }

  return (
    <>
      <section className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface px-6 py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="m-0 font-serif text-[26px] font-semibold">Choose a day</h2>
          {today && <span className="text-[15px] text-muted">Today is <strong className="text-ink">Day {today}</strong></span>}
        </div>
        <div role="tablist" aria-label="Novena days" className="grid grid-cols-9 gap-2">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
            const on = n === sel
            const done = today !== null && n <= today
            return (
              <button
                key={n}
                type="button"
                role="tab"
                aria-selected={on}
                aria-label={`Day ${n}`}
                onClick={() => go(n)}
                className={`aspect-square min-h-11 rounded-xl border-2 font-bold ${on ? 'border-accent bg-accent text-accent-ink' : done ? 'border-[#f2c99e] bg-accent-soft text-eyebrow' : 'border-line bg-surface text-muted'}`}
              >
                {n}
              </button>
            )
          })}
        </div>
      </section>
      <article className="flex flex-col gap-5">
        <p className="eyebrow m-0">Day {sel} of 9</p>
        <h2 className="m-0 font-serif text-[36px] font-semibold leading-tight sm:text-[40px]">{d?.title || `Day ${sel}`}</h2>
        {d?.audio_url && <AudioPlayer key={sel} src={d.audio_url} label={`Pray along · Day ${sel}`} initialSeconds={d.audio_seconds} downloadName={`novena-day-${sel}.mp3`} />}
        {d?.html ? <div className="prose-cmp" dangerouslySetInnerHTML={{ __html: d.html }} /> : <p className="text-muted">This day&apos;s prayer will be added soon.</p>}
        {commonHtml && (
          <div className="rounded-2xl bg-sky px-6 py-5">
            <p className="eyebrow m-0 mb-2">Said every day</p>
            <div className="prose-cmp" dangerouslySetInnerHTML={{ __html: commonHtml }} />
          </div>
        )}
        <Reactions key={sel} type="novena" id={`${novenaId}:day${sel}`} kinds={['love', 'amen', 'thumbs']} title={`Did you pray Day ${sel}?`} compact />
        <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-4">
          <button type="button" disabled={sel === 1} onClick={() => go(sel - 1)} className="min-h-12 rounded-md border border-ink px-6 font-semibold text-ink disabled:opacity-40">← Day {Math.max(1, sel - 1)}</button>
          <button type="button" disabled={sel === 9} onClick={() => go(sel + 1)} className="min-h-12 rounded-md bg-accent px-6 font-semibold text-accent-ink disabled:opacity-40">Day {Math.min(9, sel + 1)} →</button>
        </div>
      </article>
    </>
  )
}
