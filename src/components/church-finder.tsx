'use client'

import { useMemo, useState } from 'react'
import { ChurchIcon } from './icons'
import type { Church } from '@/lib/types'

const field = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 text-ink'

export function ChurchFinder({ churches }: { churches: Church[] }) {
  const countries = useMemo(() => [...new Set(churches.map((c) => c.country))].sort(), [churches])
  const [country, setCountry] = useState(countries[0] ?? '')
  const states = useMemo(() => [...new Set(churches.filter((c) => c.country === country).map((c) => c.state))].sort(), [churches, country])
  const [state, setState] = useState('')
  const dioceses = useMemo(() => [...new Set(churches.filter((c) => c.country === country && (!state || c.state === state)).map((c) => c.diocese))].sort(), [churches, country, state])
  const [diocese, setDiocese] = useState('')
  const [q, setQ] = useState('')

  const list = churches.filter((c) =>
    c.country === country && (!state || c.state === state) && (!diocese || c.diocese === diocese) &&
    (!q || `${c.name} ${c.address}`.toLowerCase().includes(q.toLowerCase())),
  )
  const grouped = list.reduce<Record<string, Church[]>>((acc, c) => { (acc[c.diocese] ??= []).push(c); return acc }, {})

  return (
    <>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="grid items-end gap-3.5 rounded-2xl border border-line bg-surface p-5 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Country
          <select value={country} onChange={(e) => { setCountry(e.target.value); setState(''); setDiocese('') }} className={field}>{countries.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">State / Region
          <select value={state} onChange={(e) => { setState(e.target.value); setDiocese('') }} className={field}><option value="">All states</option>{states.map((s) => <option key={s}>{s}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Diocese / Archdiocese
          <select value={diocese} onChange={(e) => setDiocese(e.target.value)} className={field}><option value="">All dioceses</option>{dioceses.map((d) => <option key={d}>{d}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Search
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Church name or town" className={field} />
        </label>
      </form>
      <p className="m-0 text-[15px] text-muted" aria-live="polite">{list.length} {list.length === 1 ? 'church' : 'churches'} in <strong className="text-ink">{[state, country].filter(Boolean).join(', ')}</strong></p>
      {Object.entries(grouped).map(([d, cs]) => (
        <section key={d} className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center gap-2.5 border-b border-line pb-2.5">
            <h2 className="m-0 font-serif text-[30px] font-semibold">{d}</h2>
            <span className="rounded-full bg-sky px-3 py-1 text-[13px] font-semibold">{cs[0].diocese_kind}</span>
          </div>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
            {cs.map((c) => (
              <article key={c.id} className="flex gap-3.5 rounded-2xl border border-line bg-surface px-5 py-4">
                <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><ChurchIcon /></span>
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="m-0 text-lg">{c.name}</h3>
                  <p className="m-0 text-[15px] text-muted">{c.address}</p>
                  <a href={c.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.name}, ${c.address}`)}`} target="_blank" rel="noopener noreferrer" className="pt-1 text-[15px] font-semibold">Get directions →</a>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
