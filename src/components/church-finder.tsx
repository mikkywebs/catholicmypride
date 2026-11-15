'use client'

import { useMemo, useState } from 'react'
import { ChurchIcon } from './icons'
import { PlaceMap } from './place-map'
import { CONTINENTS } from '@/lib/geo'
import type { Church, Diocese, Region } from '@/lib/types'

const field = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 text-ink'
type Row = Church & { diocese: Diocese }

const uniq = (xs: (string | null | undefined)[]) => [...new Set(xs.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b))

/** Continent → Country → Ecclesiastical province → (Arch)diocese → Deanery/Zone → Parish. */
export function ChurchFinder({ churches, regions = [] }: { churches: Church[]; regions?: Region[] }) {
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

  const list = inDio.filter((r) => (!deanery || r.deanery === deanery) && (!q || `${r.name} ${r.address ?? ''} ${r.diocese.name} ${r.deanery ?? ''}`.toLowerCase().includes(q.toLowerCase())))
  // Country → Province → (Arch)diocese → Deanery → parishes
  const key = (x: string | null | undefined) => (x ?? '').trim().toLowerCase()
  const tree = new Map<string, Map<string, Map<string, { d: Diocese; byDeanery: Map<string, Row[]> }>>>()
  for (const r of list) {
    const byProv = tree.get(r.diocese.country) ?? new Map()
    const pk = r.diocese.province?.trim() ?? ''
    const byDio = byProv.get(pk) ?? new Map()
    const g = byDio.get(r.diocese.id) ?? { d: r.diocese, byDeanery: new Map() }
    const k = r.deanery ?? ''
    g.byDeanery.set(k, [...(g.byDeanery.get(k) ?? []), r])
    byDio.set(r.diocese.id, g)
    byProv.set(pk, byDio)
    tree.set(r.diocese.country, byProv)
  }
  const official = (country: string, province: string | null) => regions.find((x) => key(x.country) === key(country) && key(x.province) === key(province))
  const dioSort = (a: Diocese, b: Diocese) => (a.kind === 'Archdiocese' ? -1 : 0) - (b.kind === 'Archdiocese' ? -1 : 0) || a.name.localeCompare(b.name)
  const parishCount = (m: Map<string, { byDeanery: Map<string, Row[]> }>) => [...m.values()].reduce((n, g) => n + [...g.byDeanery.values()].reduce((x, ps) => x + ps.length, 0), 0)
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
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Parish, town or diocese" className={field} />
        </label>
      </form>
      <p className="m-0 text-[15px] text-muted" aria-live="polite">{list.length} {list.length === 1 ? 'parish' : 'parishes'}{where ? <> in <strong className="text-ink">{where}</strong></> : ''}</p>
      {[...tree.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([ctry, byProv]) => {
        const allDio = [...byProv.values()].flatMap((m) => [...m.values()])
        const named = [...byProv.keys()].filter(Boolean)
        const co = official(ctry, null)
        return (
          <section key={ctry} className="flex flex-col gap-8">
            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <h2 className="m-0 font-serif text-[36px] font-semibold leading-tight">{ctry}</h2>
              <Stats official={co && [[co.total_provinces, 'Ecclesiastical provinces'], [co.total_dioceses, 'Archdioceses & dioceses'], [co.total_parishes, 'Parishes'], [co.total_priests, 'Priests'], [co.catholic_population, 'Catholics']]}
                listed={[[named.length, named.length === 1 ? 'province' : 'provinces'], [allDio.length, allDio.length === 1 ? 'diocese' : 'dioceses'], [allDio.reduce((n, g) => n + [...g.byDeanery.values()].reduce((x, ps) => x + ps.length, 0), 0), 'parishes']]} />
            </div>
            {[...byProv.entries()].sort(([a], [b]) => (a ? (b ? a.localeCompare(b) : -1) : 1)).map(([prov, byDio]) => {
              const po = prov ? official(ctry, prov) : undefined
              const n = parishCount(byDio)
              return (
                <div key={prov || 'none'} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2.5 border-l-4 border-accent pl-4">
                    <h3 className="m-0 font-serif text-[28px] font-semibold leading-tight">{prov ? `Ecclesiastical Province of ${prov}` : 'Other dioceses'}</h3>
                    <Stats official={po && [[po.total_dioceses, 'Archdioceses & dioceses'], [po.total_parishes, 'Parishes'], [po.total_priests, 'Priests'], [po.catholic_population, 'Catholics']]}
                      listed={[[byDio.size, byDio.size === 1 ? 'diocese' : 'dioceses'], [n, n === 1 ? 'parish' : 'parishes']]} />
                  </div>
                  {[...byDio.values()].sort((a, b) => dioSort(a.d, b.d)).map(({ d, byDeanery }) => (
                    <section key={d.id} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2 border-b border-line pb-3">
                        <h4 className="m-0 font-serif text-[26px] font-semibold">{d.kind} of {d.name}</h4>
                        <Stats official={[[d.total_parishes, 'Parishes'], [d.total_priests, 'Priests'], [d.catholic_population, 'Catholics']]} />
                        {(d.address || d.map_url) && (
                          <div className="flex max-w-[640px] flex-col gap-1.5">
                            {d.address && <p className="m-0 whitespace-pre-line text-[15px] text-muted">{d.address}</p>}
                            <PlaceMap name={`${d.kind} of ${d.name}`} address={d.address} country={d.country} mapUrl={d.map_url} />
                          </div>
                        )}
                      </div>
                      {[...byDeanery.entries()].sort(([a], [b]) => (a ? (b ? a.localeCompare(b) : -1) : 1)).map(([dean, parishes]) => (
                        <div key={dean || 'none'} className="flex flex-col gap-3">
                          {dean && <p className="m-0 text-sm font-bold uppercase tracking-[0.12em] text-eyebrow">{dean}</p>}
                          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
                            {parishes.sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                              <article key={c.id} className="flex gap-3.5 rounded-2xl border border-line bg-surface px-5 py-4">
                                <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><ChurchIcon /></span>
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                  <h5 className="m-0 text-lg font-semibold">{c.name}</h5>
                                  <p className="m-0 text-sm font-semibold text-eyebrow">{[`${d.kind} of ${d.name}`, c.deanery].filter(Boolean).join(' · ')}</p>
                                  {c.address && <p className="m-0 whitespace-pre-line text-[15px] text-muted">{c.address}</p>}
                                  <div className="pt-1"><PlaceMap name={c.name} address={c.address} country={d.country} mapUrl={c.map_url} /></div>
                                </div>
                              </article>
                            ))}
                          </div>
                        </div>
                      ))}
                    </section>
                  ))}
                </div>
              )
            })}
          </section>
        )
      })}
    </>
  )
}

type Stat = [number | null | undefined, string]
const nf = new Intl.NumberFormat('en-GB')

/** Official totals (only those filled in) as figures, plus a quiet line counting what is listed here. */
function Stats({ official, listed }: { official?: Stat[] | null | false; listed?: Stat[] }) {
  const shown = (official || []).filter(([v]) => v != null && v > 0) as [number, string][]
  if (!shown.length && !listed) return null
  return (
    <div className="flex flex-col gap-2">
      {shown.length > 0 && (
        <dl className="m-0 flex flex-wrap gap-x-8 gap-y-3">
          {shown.map(([v, label]) => (
            <div key={label} className="flex flex-col">
              <dt className="order-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</dt>
              <dd className="order-1 m-0 font-serif text-[26px] font-semibold leading-none text-ink">{nf.format(v)}</dd>
            </div>
          ))}
        </dl>
      )}
      {listed && <p className="m-0 text-[13px] text-muted">Listed here: {listed.map(([v, l]) => `${nf.format(v ?? 0)} ${l}`).join(' · ')}</p>}
    </div>
  )
}
