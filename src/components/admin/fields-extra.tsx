'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CONTINENTS, COUNTRY_CONTINENT, countriesIn } from '@/lib/geo'
import type { Diocese } from '@/lib/types'

const input = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 py-2.5 font-normal text-ink'

/** A dropdown from a list, with "Other — type it" for names not on the list yet. */
function PickOrType({ name, options, initial, placeholder, noneLabel, disabled, ariaLabel }: { name: string; options: string[]; initial: string; placeholder: string; noneLabel?: string; disabled?: boolean; ariaLabel: string }) {
  const inList = !initial || options.some((o) => o.toLowerCase() === initial.toLowerCase())
  const [mode, setMode] = useState<'pick' | 'type'>(inList ? 'pick' : 'type')
  const [value, setValue] = useState(initial)
  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={value} />
      <select
        value={mode === 'type' ? '__other' : value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => { if (e.target.value === '__other') { setMode('type'); setValue('') } else { setMode('pick'); setValue(e.target.value) } }}
        className={input}
      >
        <option value="">{noneLabel ?? placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
        <option value="__other">Other — type it…</option>
      </select>
      {mode === 'type' && <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Type the name" aria-label={`${ariaLabel} (typed)`} className={input} autoFocus />}
    </div>
  )
}

/** Continent → country (→ province from the country's list), saved as separate fields. */
export function PlaceField({ name, countryName, label, help, initialContinent, initialCountry, provinceName, provinces, initialProvince }: { name: string; countryName: string; label: string; help?: string; initialContinent?: string; initialCountry?: string; provinceName?: string; provinces?: Record<string, string[]>; initialProvince?: string }) {
  const [continent, setContinent] = useState(initialContinent || (initialCountry ? COUNTRY_CONTINENT[initialCountry] ?? '' : ''))
  const [country, setCountry] = useState(initialCountry ?? '')
  const list = (provinces?.[country] ?? [])
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="pb-1.5 text-sm font-semibold">{label}</legend>
      <div className={`grid items-start gap-4 ${provinceName ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        <select name={name} value={continent} required onChange={(e) => { setContinent(e.target.value); setCountry('') }} className={input} aria-label="Continent">
          <option value="">Choose continent…</option>
          {CONTINENTS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select name={countryName} value={country} required disabled={!continent} onChange={(e) => setCountry(e.target.value)} className={input} aria-label="Country">
          <option value="">{continent ? 'Choose country…' : 'Choose a continent first'}</option>
          {continent && countriesIn(continent).map((c) => <option key={c}>{c}</option>)}
        </select>
        {provinceName && (
          <PickOrType key={country} name={provinceName} options={list} initial={country === (initialCountry ?? '') ? initialProvince ?? '' : ''} disabled={!country} ariaLabel="Ecclesiastical province"
            placeholder={country ? (list.length ? 'Ecclesiastical province…' : 'No provinces listed yet') : 'Choose a country first'} />
        )}
      </div>
      {provinceName && country && !list.length && <span className="text-[13px] text-muted">Add this country&apos;s provinces under <a href="/admin/regions" target="_blank">Countries &amp; Provinces</a>, or choose “Other — type it”.</span>}
      {help && <span className="text-[13px] text-muted">{help}</span>}
    </fieldset>
  )
}

/** Continent → country → archdiocese/diocese. Only the diocese is saved; the rest filters the list. */
export function DioceseField({ name, label, help, dioceses, initial, deaneryName, initialDeanery }: { name: string; label: string; help?: string; dioceses: Diocese[]; initial?: string | null; deaneryName?: string; initialDeanery?: string }) {
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
      {deaneryName && (
        <div className="flex flex-col gap-1.5 pt-2.5">
          <span className="text-sm font-semibold">Deanery / Zone (optional)</span>
          <PickOrType key={id} name={deaneryName} options={chosen?.deaneries ?? []} initial={id === (initial ?? '') ? initialDeanery ?? '' : ''} disabled={!chosen} ariaLabel="Deanery or zone"
            placeholder="Choose the diocese first" noneLabel={chosen ? (chosen.deaneries?.length ? 'No deanery / zone' : 'None listed — leave empty or type one') : undefined} />
          {chosen && !chosen.deaneries?.length && <span className="text-[13px] text-muted">List this diocese&apos;s deaneries or zones on its page under Dioceses to choose them here.</span>}
        </div>
      )}
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
      <TimedField row={row} />
    </fieldset>
  )
}

/** A prayer that plays by itself at set times, e.g. the Angelus at 6:00, 12:00 and 18:00. */
function TimedField({ row }: { row: Record<string, unknown> }) {
  const initial = (row.bar_times as string[] | undefined) ?? []
  const [on, setOn] = useState(initial.length > 0)
  const [times, setTimes] = useState(initial.join(', '))
  const preset = (t: string) => { setOn(true); setTimes(t) }
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-3">
      <label className="flex items-center gap-2.5 text-[15px] font-semibold">
        <input type="checkbox" name="timed" checked={on} onChange={(e) => setOn(e.target.checked)} className="size-5 accent-accent" />
        Play at set times (prayers like the Angelus or the Divine Mercy)
      </label>
      <div className={`flex-col gap-3 ${on ? 'flex' : 'hidden'}`}>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="self-center text-muted">Quick fill:</span>
          <button type="button" onClick={() => preset('06:00, 12:00, 18:00')} className="rounded-full border border-field bg-surface px-3 py-1.5 font-semibold">Angelus: 6am, 12 noon, 6pm</button>
          <button type="button" onClick={() => preset('15:00')} className="rounded-full border border-field bg-surface px-3 py-1.5 font-semibold">Divine Mercy: 3pm</button>
          <button type="button" onClick={() => preset('03:00, 15:00')} className="rounded-full border border-field bg-surface px-3 py-1.5 font-semibold">Divine Mercy: 3am and 3pm</button>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Times (24-hour clock, separated by commas)
          <input name="bar_times" value={times} onChange={(e) => setTimes(e.target.value)} placeholder="06:00, 12:00, 18:00" className={input} />
          <span className="text-[13px] font-normal text-muted">At each time the music bar pauses, plays this once, then carries on. Each visitor&apos;s own clock is used, so it is noon wherever they are.</span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">When in the year
          <select name="bar_season" defaultValue={(row.bar_season as string) || 'all'} className={input}>
            <option value="all">All year</option>
            <option value="not_easter">All year except the Easter season (use for the Angelus)</option>
            <option value="easter">Only in the Easter season (use for the Regina Caeli)</option>
          </select>
          <span className="text-[13px] font-normal text-muted">From Easter Sunday to Pentecost the Regina Caeli replaces the Angelus. Upload it as a separate item if you have it.</span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Remind visitors who arrive late (minutes)
          <input name="bar_remind_minutes" type="number" min={0} max={60} defaultValue={(row.bar_remind_minutes as number | null) ?? 15} className={`${input} max-w-[140px]`} />
          <span className="text-[13px] font-normal text-muted">Someone who opens the website within this many minutes after a prayer time sees “🔔 The Angelus was prayed at 12 noon · Pray it now”. 0 = no reminder.</span>
        </label>
        <p className="m-0 text-[13px] text-muted">A prayer with set times plays only at those times, once, and is never part of the ordinary music. &ldquo;Play this on the music bar&rdquo; above is switched off for it automatically.</p>
      </div>
    </div>
  )
}
