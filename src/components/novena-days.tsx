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

/** Day picker (opening day + Day 1…length). Opens on today's day if the novena is running. */
export function NovenaDays({ novenaId, days, startISO, length, hasOpening, commonHtml, repeat, initial }: {
  novenaId: string; days: Day[]; startISO: string; length: number; hasOpening: boolean; commonHtml: string
  repeat: { html: string; count: number | null } | null; initial: number | null
}) {
  const first = hasOpening ? 0 : 1
  const today = useClientValue(() => {
    const start = new Date(startISO + 'T00:00:00')
    const now = new Date(localISO() + 'T00:00:00')
    const n = Math.round((now.getTime() - start.getTime()) / 86_400_000) + 1
    return n >= first && n <= length ? n : null
  }, null)
  const [picked, setSel] = useState<number | null>(initial)
  const sel = picked ?? today ?? first

  const d = days.find((x) => x.day === sel)
  const go = (n: number) => {
    setSel(n)
    const url = new URL(window.location.href)
    url.searchParams.set('day', String(n))
    window.history.replaceState(null, '', url)
  }
  const label = (n: number) => (n === 0 ? 'Opening' : `Day ${n}`)
  const buttons = Array.from({ length: length - first + 1 }, (_, i) => i + first)
  // Up to 10 buttons share one row; longer novenas wrap into rows of small squares.
  const cols = buttons.length <= 10 ? `repeat(${buttons.length}, minmax(0, 1fr))` : 'repeat(auto-fill, minmax(2.9rem, 1fr))'

  return (
    <>
      <section className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface px-6 py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="m-0 font-serif text-[26px] font-semibold">Choose a day</h2>
          {today !== null && <span className="text-[15px] text-muted">Today is <strong className="text-ink">{today === 0 ? 'the opening day' : `Day ${today}`}</strong></span>}
        </div>
        <div role="tablist" aria-label="Novena days" className="grid gap-2" style={{ gridTemplateColumns: cols }}>
          {buttons.map((n) => {
            const on = n === sel
            const done = today !== null && n <= today
            return (
              <button
                key={n}
                type="button"
                role="tab"
                aria-selected={on}
                aria-label={label(n)}
                onClick={() => go(n)}
                className={`aspect-square min-h-11 rounded-xl border-2 font-bold ${n === 0 ? 'text-xs' : ''} ${on ? 'border-accent bg-accent text-accent-ink' : done ? 'border-[#f2c99e] bg-accent-soft text-eyebrow' : 'border-line bg-surface text-muted'}`}
              >
                {n === 0 ? 'Open' : n}
              </button>
            )
          })}
        </div>
      </section>
      <article className="flex flex-col gap-5">
        <p className="eyebrow m-0">{sel === 0 ? 'Opening day' : `Day ${sel} of ${length}`}</p>
        <h2 className="m-0 font-serif text-[36px] font-semibold leading-tight sm:text-[40px]">{d?.title || label(sel)}</h2>
        {d?.audio_url && <AudioPlayer key={sel} src={d.audio_url} label={`Pray along · ${label(sel)}`} initialSeconds={d.audio_seconds} downloadName={`novena-${sel === 0 ? 'opening' : `day-${sel}`}.mp3`} />}
        {d?.html ? <div className="prose-cmp" dangerouslySetInnerHTML={{ __html: d.html }} /> : <p className="text-muted">This day&apos;s prayer will be added soon.</p>}
        {repeat && sel > 0 && <RepeatPrayer key={sel} id={`${novenaId}:${sel}`} html={repeat.html} count={repeat.count} />}
        {commonHtml && (
          <div className="rounded-2xl bg-sky px-6 py-5">
            <p className="eyebrow m-0 mb-2">Said every day</p>
            <div className="prose-cmp" dangerouslySetInnerHTML={{ __html: commonHtml }} />
          </div>
        )}
        <Reactions key={`r${sel}`} type="novena" id={`${novenaId}:day${sel}`} kinds={['love', 'amen', 'thumbs']} title={`Did you pray ${sel === 0 ? 'the opening prayer' : `Day ${sel}`}?`} compact />
        <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-4">
          <button type="button" disabled={sel === first} onClick={() => go(sel - 1)} className="min-h-12 rounded-md border border-ink px-6 font-semibold text-ink disabled:opacity-40">← {label(Math.max(first, sel - 1))}</button>
          <button type="button" disabled={sel === length} onClick={() => go(sel + 1)} className="min-h-12 rounded-md bg-accent px-6 font-semibold text-accent-ink disabled:opacity-40">{label(Math.min(length, sel + 1))} →</button>
        </div>
      </article>
    </>
  )
}

/** The prayer said several times a day, with a tap counter kept on this device for today. */
function RepeatPrayer({ id, html, count }: { id: string; html: string; count: number | null }) {
  // Read the date only in the browser (the count belongs to the visitor's own day).
  const key = () => `cmp-novena-count:${id}:${localISO()}`
  const stored = useClientValue(() => Number(localStorage.getItem(key()) || 0), 0)
  const [tapped, setTapped] = useState<number | null>(null)
  const n = tapped ?? stored
  const set = (v: number) => {
    setTapped(v)
    try { localStorage.setItem(key(), String(v)) } catch { /* private browsing */ }
  }
  const done = count !== null && n >= count
  const groups = count ? Math.ceil(count / 5) : 0
  return (
    <section className="flex flex-col gap-4 rounded-2xl border-2 border-[#f2c99e] bg-accent-soft/40 px-6 py-5">
      <p className="eyebrow m-0">{count ? `Pray this ${count} times today` : 'Pray this prayer'}</p>
      <div className="prose-cmp" dangerouslySetInnerHTML={{ __html: html }} />
      {count && (
        <>
          {/* Each circle can be tapped: it sets the count to that number; tapping the last filled one empties it. */}
          <div className="flex flex-wrap gap-x-4 gap-y-1" role="group" aria-label={`${Math.min(n, count)} of ${count} prayed. Tap a circle to set the count.`}>
            {Array.from({ length: groups }, (_, g) => (
              <span key={g} className="flex">
                {Array.from({ length: Math.min(5, count - g * 5) }, (_, i) => {
                  const k = g * 5 + i + 1
                  return (
                    <button key={k} type="button" onClick={() => set(k === n ? k - 1 : k)} aria-label={`Prayer ${k}`} aria-pressed={k <= n}
                      className="flex size-10 items-center justify-center rounded-full sm:size-9">
                      <span className={`size-6 rounded-full transition-colors sm:size-5 ${k <= n ? 'bg-accent' : 'border-2 border-[#d9b38c] bg-surface hover:border-accent'}`} />
                    </button>
                  )
                })}
              </span>
            ))}
          </div>
          {done ? (
            <p className="m-0 font-semibold text-[#1f5c38]" role="status">✓ Prayed {count} times. God bless you!</p>
          ) : (
            <button type="button" onClick={() => set(n + 1)} className="min-h-14 self-start rounded-md bg-accent px-7 text-lg font-bold text-accent-ink">
              Tap after each prayer · {n} of {count}
            </button>
          )}
          {n > 0 && <button type="button" onClick={() => set(0)} className="self-start text-sm text-muted underline">Start the count again</button>}
          <p className="m-0 text-sm text-muted">Tap the button or a circle after each prayer.{count >= 10 && <> You can split them across the day in {groups} sets of up to 5. </>} Your count is kept on this device until midnight.</p>
        </>
      )}
    </section>
  )
}
