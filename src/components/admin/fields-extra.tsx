'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CONTINENTS, COUNTRY_CONTINENT, countriesIn } from '@/lib/geo'
import type { Diocese } from '@/lib/types'

const input = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 py-2.5 font-normal text-ink'

export type SongOption = { id: string; title: string; kind: string }

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

/** Hand-picked, ordered list of songs and audio messages. */
export function PlaylistField({ name, label, help, songs, initial }: { name: string; label: string; help?: string; songs: SongOption[]; initial?: string[] }) {
  const [ids, setIds] = useState<string[]>((initial ?? []).filter((x) => songs.some((s) => s.id === x)))
  const [add, setAdd] = useState('')
  const byId = new Map(songs.map((s) => [s.id, s]))
  const move = (i: number, d: number) => setIds((l) => { const n = [...l]; const j = i + d; if (j < 0 || j >= n.length) return n; [n[i], n[j]] = [n[j], n[i]]; return n })
  const btn = 'flex size-9 items-center justify-center rounded-md border border-field bg-surface text-sm disabled:opacity-30'
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="pb-1.5 text-sm font-semibold">{label}</legend>
      <input type="hidden" name={name} value={JSON.stringify(ids)} />
      {ids.length === 0 && <p className="m-0 text-sm text-muted">Nothing added yet.</p>}
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {ids.map((id, i) => {
          const s = byId.get(id)
          return (
            <li key={id} className="flex items-center gap-2 rounded-lg border border-line bg-bg px-3 py-2">
              <span className="w-6 text-sm text-muted">{i + 1}.</span>
              <span className="flex-1 font-semibold">{s?.title ?? 'Removed item'}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${s?.kind === 'audio' ? 'bg-sky text-ink' : 'bg-accent-soft text-eyebrow'}`}>{s?.kind === 'audio' ? 'Audio' : 'Song'}</span>
              <button type="button" className={btn} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
              <button type="button" className={btn} onClick={() => move(i, 1)} disabled={i === ids.length - 1} aria-label="Move down">↓</button>
              <button type="button" className={btn} onClick={() => setIds((l) => l.filter((x) => x !== id))} aria-label="Remove">✕</button>
            </li>
          )
        })}
      </ol>
      <div className="flex flex-wrap gap-2">
        <select value={add} onChange={(e) => setAdd(e.target.value)} className={`${input} flex-1 basis-60`} aria-label="Add a song or audio">
          <option value="">Add a song or audio message…</option>
          <optgroup label="Songs">{songs.filter((s) => s.kind !== 'audio' && !ids.includes(s.id)).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</optgroup>
          <optgroup label="Audio messages & prayers">{songs.filter((s) => s.kind === 'audio' && !ids.includes(s.id)).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</optgroup>
        </select>
        <button type="button" disabled={!add} onClick={() => { setIds((l) => [...l, add]); setAdd('') }} className="min-h-11 rounded-md bg-navy px-5 font-semibold text-navy-ink disabled:opacity-40">Add</button>
      </div>
      {help && <span className="text-[13px] text-muted">{help} Only published items with an MP3 can play.</span>}
    </fieldset>
  )
}
