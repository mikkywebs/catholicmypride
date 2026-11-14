'use client'

import { useMemo, useState } from 'react'
import { ChurchIcon } from './icons'
import { CONTINENTS } from '@/lib/geo'
import type { Church, Diocese } from '@/lib/types'

const field = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 text-ink'
type Row = Church & { diocese: Diocese }

const uniq = (xs: (string | null | undefined)[]) => [...new Set(xs.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b))

/** Continent → Country → Ecclesiastical province → (Arch)diocese → Deanery/Zone → Parish. */
export function ChurchFinder({ churches }: { churches: Church[] }) {
  const rows = useMemo(() => churches.filter((c): c is Row => Boolean(c.diocese)), [churches])
  const continents = CONTINENTS.filter((c) => rows.some((r) => r.diocese.continent === c))
  const [continent, setContinent] = useState<string>(continents.length === 1 ? continents[0] : '')
  const inCont = rows.filter((r) => !continent || r.diocese.continent === continent)
  const countries = uniq(inCont.map((r) => r.diocese.country))
  const [country, setCountry] = useState(countries.length === 1 ? countries[0] : '')
  const inCountry = inCont.filter((r) => !country || r.diocese.country === country)
  const provinces = uniq(inCountry.map((r) => r.diocese.province))
  const [province, setProvince] = useState('')
  const inProv = inCountry.filter((r) => !province || r.diocese.province === province)
  const dioceses = [...new Map(inProv.map((r) => [r.diocese.id, r.diocese])).values()].sort((a, b) => a.name.localeCompare(b.name))
  const [dioceseId, setDioceseId] = useState('')
  const inDio = inProv.filter((r) => !dioceseId || r.diocese.id === dioceseId)
  const deaneries = uniq(inDio.map((r) => r.deanery))
  const [deanery, setDeanery] = useState('')
  const [q, setQ] = useState('')

  const list = inDio.filter((r) => (!deanery || r.deanery === deanery) && (!q || `${r.name} ${r.address}`.toLowerCase().includes(q.toLowerCase())))
  const grouped = new Map<string, { d: Diocese; byDeanery: Map<string, Row[]> }>()
  for (const r of list) {
    const g = grouped.get(r.diocese.id) ?? { d: r.diocese, byDeanery: new Map() }
    const k = r.deanery ?? ''
    g.byDeanery.set(k, [...(g.byDeanery.get(k) ?? []), r])
    grouped.set(r.diocese.id, g)
  }
  const sortedGroups = [...grouped.values()].sort((a, b) => (a.d.kind === 'Archdiocese' ? -1 : 0) - (b.d.kind === 'Archdiocese' ? -1 : 0) || a.d.name.localeCompare(b.d.name))
  const where = [deanery, dioceses.find((d) => d.id === dioceseId)?.name, province && `Province of ${province}`, country, continent].filter(Boolean)[0]

  const reset = (level: number) => {
    if (level <= 1) setCountry('')
    if (level <= 2) setProvince('')
    if (level <= 3) setDioceseId('')
    if (level <= 4) setDeanery('')
  }

  return (
    <>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="grid items-end gap-3.5 rounded-2xl border border-line bg-surface p-5 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Continent
          <select value={continent} onChange={(e) => { setContinent(e.target.value); reset(1) }} className={field}><option value="">All continents</option>{continents.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Country
          <select value={country} onChange={(e) => { setCountry(e.target.value); reset(2) }} className={field}><option value="">All countries</option>{countries.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Ecclesiastical province
          <select value={province} onChange={(e) => { setProvince(e.target.value); reset(3) }} className={field}><option value="">All provinces</option>{provinces.map((p) => <option key={p}>{p}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Archdiocese / Diocese
          <select value={dioceseId} onChange={(e) => { setDioceseId(e.target.value); reset(4) }} className={field}><option value="">All dioceses</option>{dioceses.map((d) => <option key={d.id} value={d.id}>{d.kind} of {d.name}</option>)}</select>
        </label>
        {deaneries.length > 0 && (
          <label className="flex flex-col gap-1.5 text-sm font-semibold">Deanery / Zone
            <select value={deanery} onChange={(e) => setDeanery(e.target.value)} className={field}><option value="">All deaneries</option>{deaneries.map((d) => <option key={d}>{d}</option>)}</select>
          </label>
        )}
        <label className="flex flex-col gap-1.5 text-sm font-semibold">Search
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Parish name or town" className={field} />
        </label>
      </form>
      <p className="m-0 text-[15px] text-muted" aria-live="polite">{list.length} {list.length === 1 ? 'parish' : 'parishes'}{where ? <> in <strong className="text-ink">{where}</strong></> : ''}</p>
      {sortedGroups.map(({ d, byDeanery }) => (
        <section key={d.id} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-2.5">
            <h2 className="m-0 font-serif text-[30px] font-semibold">{d.kind} of {d.name}</h2>
            <span className="text-sm text-muted">{[d.province && `Province of ${d.province}`, d.country].filter(Boolean).join(' · ')}</span>
          </div>
          {[...byDeanery.entries()].sort(([a], [b]) => (a ? a.localeCompare(b) : 1)).map(([dean, parishes]) => (
            <div key={dean || 'none'} className="flex flex-col gap-3">
              {dean && <h3 className="m-0 text-sm font-bold uppercase tracking-[0.12em] text-eyebrow">{dean}</h3>}
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
                {parishes.sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                  <article key={c.id} className="flex gap-3.5 rounded-2xl border border-line bg-surface px-5 py-4">
                    <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><ChurchIcon /></span>
                    <div className="flex min-w-0 flex-col gap-1">
                      <h4 className="m-0 text-lg">{c.name}</h4>
                      <p className="m-0 whitespace-pre-line text-[15px] text-muted">{c.address}</p>
                      <a href={c.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.name}, ${c.address}, ${d.country}`)}`} target="_blank" rel="noopener noreferrer" className="pt-1 text-[15px] font-semibold">Get directions →</a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </>
  )
}
