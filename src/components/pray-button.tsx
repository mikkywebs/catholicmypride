'use client'

import { useState } from 'react'
import { HeartIcon } from './icons'
import { useClientValue } from './use-client'

export function PrayButton({ id, initial }: { id: string; initial: number }) {
  const key = `cmp-prayed:${id}`
  const stored = useClientValue(() => localStorage.getItem(key) === '1', false)
  const [override, setOn] = useState<boolean | null>(null)
  const on = override ?? stored
  const [n, setN] = useState(initial)
  const toggle = () => {
    const next = !on
    setOn(next); setN((x) => Math.max(0, x + (next ? 1 : -1)))
    try { if (next) localStorage.setItem(key, '1'); else localStorage.removeItem(key) } catch {}
    fetch('/api/pray', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, delta: next ? 1 : -1 }) })
      .then((r) => (r.ok ? r.json() : null)).then((d) => { if (d && typeof d.count === 'number') setN(d.count) }).catch(() => {})
  }
  return (
    <button type="button" onClick={toggle} aria-pressed={on} className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[15px] font-semibold ${on ? 'border-accent bg-accent text-accent-ink' : 'border-field bg-surface text-ink'}`}>
      <HeartIcon /> {on ? 'You prayed' : 'I prayed'} · {n}
    </button>
  )
}
