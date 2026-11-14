'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useClientValue } from './use-client'
import { AudioPlayer } from './audio-player'
import { ShareBar } from './engage'

export type TabPrayer = { key: string; label: string; slug: string; title: string; html: string; audio: string | null; seconds: number | null; image: string | null; alt: string | null; minutes: number } | null

const ORDER = ['morning', 'midday', 'evening', 'night'] as const
const LABELS: Record<string, string> = { morning: 'Morning', midday: 'Midday', evening: 'Evening', night: 'Night' }

/** Morning / Midday / Evening / Night tabs. Opens on the visitor's time of day. */
export function PrayerTabs({ tabs }: { tabs: Record<string, TabPrayer> }) {
  const available = ORDER.filter((k) => tabs[k])
  const nowKey = useClientValue(() => { const h = new Date().getHours(); return h < 11 ? 'morning' : h < 16 ? 'midday' : h < 20 ? 'evening' : 'night' }, '')
  const [picked, setCur] = useState<string | null>(null)
  const cur = picked ?? (nowKey && tabs[nowKey] ? nowKey : available[0] ?? 'morning')
  if (!available.length) return null
  const p = tabs[cur]
  return (
    <>
      <div role="tablist" aria-label="Time of day" className="flex flex-wrap justify-center gap-1.5 self-center rounded-xl border border-line bg-surface p-1.5">
        {available.map((k) => (
          <button key={k} type="button" role="tab" aria-selected={k === cur} onClick={() => setCur(k)} className={`min-h-[42px] rounded-lg px-5 font-semibold ${k === cur ? 'bg-accent text-accent-ink' : 'text-ink'}`}>{LABELS[k]}</button>
        ))}
      </div>
      {p && (
        <article className="mx-auto flex w-full max-w-[780px] flex-col gap-5">
          {p.image && (
            <div className="relative aspect-video w-full overflow-hidden rounded-[18px] bg-ph">
              <Image src={p.image} alt={p.alt ?? ''} fill sizes="780px" className="object-cover" />
            </div>
          )}
          <ShareBar title={p.title} />
          <p className="eyebrow m-0">{LABELS[cur]} prayer · {p.minutes} min</p>
          <h2 className="m-0 font-serif text-[36px] font-semibold leading-tight sm:text-[40px]"><a href={`/daily-prayers/${p.slug}`} className="text-ink no-underline">{p.title}</a></h2>
          {p.audio && <AudioPlayer key={cur} src={p.audio} label="Listen and pray along" initialSeconds={p.seconds} />}
          <div className="prose-cmp" dangerouslySetInnerHTML={{ __html: p.html }} />
        </article>
      )}
    </>
  )
}
