'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CONTINENTS, COUNTRY_CONTINENT, countriesIn } from '@/lib/geo'
import type { Diocese } from '@/lib/types'

const input = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 py-2.5 font-normal text-ink'

/** Continent → country (saved as two fields). */
export function PlaceField({ name, countryName, label, help, initialContinent, initialCountry }: { name: string; countryName: string; label: string; help?: string; initialContinent?: string; initialCountry?: string }) {
  const [continent, setContinent] = useState(initialContinent || (initialCountry ? COUNTRY_CONTINENT[initialCountry] ?? '' : ''))
  const [country, setCountry] = useState(initialCountry ?? '')
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="pb-1.5 text-sm font-semibold">{label}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <select name={name} value={continent} required onChange={(e) => { setContinent(e.target.value); setCountry('') }} className={input} aria-label="Continent">
          <option value="">Choose continent…</option>
          {CONTINENTS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select name={countryName} value={country} required disabled={!continent} onChange={(e) => setCountry(e.target.value)} className={input} aria-label="Country">
          <option value="">{continent ? 'Choose country…' : 'Choose a continent first'}</option>
          {continent && countriesIn(continent).map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      {help && <span className="text-[13px] text-muted">{help}</span>}
    </fieldset>
  )
}

/** Continent → country → archdiocese/diocese. Only the diocese is saved; the rest filters the list. */
export function DioceseField({ name, label, help, dioceses, initial }: { name: string; label: string; help?: string; dioceses: Diocese[]; initial?: string | null }) {
  const start = dioceses.find((d) => d.id === initial)
  const [continent, setContinent] = useState(start?.continent ?? '')
  const [country, setCountry] = useState(start?.country ?? '')
  const [id, setId] = useState(initial ?? '')
  const continents = useMemo(() => CONTINENTS.filter((c) => dioceses.some((d) => d.continent === c)), [dioceses])
  const countries = useMemo(() => [...new Set(dioceses.filter((d) => d.continent === continent).map((d) => d.country))].sort(), [dioceses, continent])
  const list = useMemo(() => dioceses.filter((d) => d.country === country).sort((a, b) => (a.kind === 'Archdiocese' ? -1 : 0) - (b.kind === 'Archdiocese' ? -1 : 0) || a.name.localeCompare(b.name)), [dioceses, country])
  const chosen = dioceses.find((d) => d.id === id)
  if (!dioceses.length) {
    return <p className="m-0 rounded-lg bg-[#fbe7dc] p-3 text-sm text-[#9a3412]">No dioceses yet. Add one under <Link href="/admin/dioceses/new">Dioceses</Link> first, then come back.</p>
  }
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="pb-1.5 text-sm font-semibold">{label}</legend>
      <input type="hidden" name={name} value={id} />
      <div className="grid gap-3 sm:grid-cols-3">
        <select value={continent} onChange={(e) => { setContinent(e.target.value); setCountry(''); setId('') }} className={input} aria-label="Continent">
          <option value="">Continent…</option>
          {continents.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={country} disabled={!continent} onChange={(e) => { setCountry(e.target.value); setId('') }} className={input} aria-label="Country">
          <option value="">Country…</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={id} disabled={!country} onChange={(e) => setId(e.target.value)} className={input} aria-label="Archdiocese or diocese">
          <option value="">Archdiocese / Diocese…</option>
          {list.map((d) => <option key={d.id} value={d.id}>{d.kind} of {d.name}</option>)}
        </select>
      </div>
      {chosen && <span className="text-[13px] text-muted">Ecclesiastical province: <strong className="text-ink">{chosen.province || '—'}</strong></span>}
      {help && <span className="text-[13px] text-muted">{help} <a href="/admin/dioceses/new" target="_blank">+ Add a diocese</a></span>}
    </fieldset>
  )
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function WeekdaysField({ name, label, help, initial }: { name: string; label: string; help?: string; initial?: number[] }) {
  const set = new Set(initial ?? [])
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="pb-1.5 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {DAYS.map((d, i) => (
          <label key={d} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-field bg-surface px-3 has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
            <input type="checkbox" name={name} value={i} defaultChecked={set.has(i)} className="size-4 accent-accent" />{d}
          </label>
        ))}
      </div>
      {help && <span className="text-[13px] text-muted">{help}</span>}
    </fieldset>
  )
}

export function TimeField({ name, label, help, initial }: { name: string; label: string; help?: string; initial?: string | null }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">{label}
      <input type="time" name={name} defaultValue={initial ? initial.slice(0, 5) : ''} className={input} />
      {help && <span className="text-[13px] font-normal text-muted">{help}</span>}
    </label>
  )
}

/** "Play this on the music bar" — ticking it opens the schedule options. */
export function MusicBarField({ row }: { row: Record<string, unknown> }) {
  const [on, setOn] = useState(Boolean(row.on_bar))
  return (
    <fieldset className="flex flex-col gap-3 rounded-2xl border border-line bg-bg p-4">
      <legend className="px-1 text-sm font-semibold">Music bar</legend>
      <label className="flex items-center gap-2.5 text-[15px] font-semibold">
        <input type="checkbox" name="on_bar" checked={on} onChange={(e) => setOn(e.target.checked)} className="size-5 accent-accent" />
        Play this on the music bar
      </label>
      {/* Hidden rather than removed, so choices are kept if you untick and tick again. */}
      <div className={`flex-col gap-4 ${on ? 'flex' : 'hidden'}`}>
        <WeekdaysField name="bar_days" label="Days" help="Tick none for every day." initial={(row.bar_days as number[] | undefined) ?? []} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TimeField name="bar_start" label="From" help="Leave both empty for all day. Visitors' own clock." initial={row.bar_start as string | null} />
          <TimeField name="bar_end" label="Until" initial={row.bar_end as string | null} />
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Position in the music bar
          <input type="number" name="bar_order" min={0} defaultValue={row.bar_order == null ? '' : String(row.bar_order)} placeholder="1" className={input} />
          <span className="text-[13px] font-normal text-muted">1 plays first. Items with the same number play in alphabetical order.</span>
        </label>
      </div>
    </fieldset>
  )
}
