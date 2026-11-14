'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

type Today = {
  date: string
  label: string
  season: string
  cycle: string
  weekdayCycle: string
  vestmentHex: string
  title: string | null
  first: string | null
  psalm: string | null
  second: string | null
  gospel: string | null
  hasReading: boolean
}

function localISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Sticky "Today in the Church" bar. Uses the visitor's own date. */
export function Ticker() {
  const [today, setToday] = useState<Today | null>(null)
  const [i, setI] = useState(0)
  const [shown, setShown] = useState(true)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`/api/today?date=${localISO()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d) setToday(d) })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const items = useMemo(() => {
    if (!today) return []
    const head = `${today.title ?? today.season} · Year ${today.cycle} · Weekday Cycle ${today.weekdayCycle}`
    const list = [{ label: 'Today', text: head }]
    if (today.first) list.push({ label: 'First Reading', text: today.first })
    if (today.psalm) list.push({ label: 'Psalm', text: today.psalm })
    if (today.second) list.push({ label: 'Second Reading', text: today.second })
    if (today.gospel) list.push({ label: 'Gospel', text: today.gospel })
    return list
  }, [today])

  const go = (n: number) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setI(n); return }
    setShown(false)
    setTimeout(() => { setI(n); setShown(true) }, 350)
  }

  useEffect(() => {
    if (items.length < 2) return
    timer.current = setInterval(() => go((i + 1) % items.length), 4000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [items.length, i])

  const item = items[i] ?? items[0]

  return (
    <div role="region" aria-label="Today in the Church" className="sticky top-0 z-50 border-b-2 border-gold bg-navy px-6 py-2 text-[15px] text-navy-ink">
      <div className="mx-auto flex min-h-7 max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-1">
        <div className="flex shrink-0 items-center gap-2.5">
          {today && <span aria-hidden="true" title="Vestment colour" className="size-3 rounded-full border border-[#9aa0aa]" style={{ background: today.vestmentHex }} />}
          <strong suppressHydrationWarning>{today?.label ?? ' '}</strong>
        </div>
        <span aria-hidden="true" className="hidden h-[18px] w-px bg-[#4a5060] sm:block" />
        <div aria-live="polite" className="min-w-0 flex-1 basis-80 overflow-hidden">
          {item && (
            <div className={`flex min-w-0 items-baseline gap-2.5 transition duration-300 ${shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
              <span className="shrink-0 text-xs font-bold uppercase tracking-[0.12em] text-gold">{item.label}</span>
              <span className="truncate">{item.text}</span>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {items.length > 1 && items.map((it, n) => (
            <button
              key={it.label}
              type="button"
              aria-label={`Show ${it.label}`}
              onClick={() => { if (timer.current) clearInterval(timer.current); go(n) }}
              className={`h-2 rounded-full transition-all ${n === i ? 'w-[18px] bg-gold' : 'w-2 bg-[#5b6272]'}`}
            />
          ))}
          {today?.hasReading && <Link href={`/mass-readings/${today.date}`} className="ml-2 whitespace-nowrap font-semibold text-navy-ink">Today&apos;s readings →</Link>}
        </div>
      </div>
    </div>
  )
}
