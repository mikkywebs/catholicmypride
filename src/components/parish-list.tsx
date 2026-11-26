'use client'

import Link from 'next/link'
import { useState } from 'react'
import { km } from '@/lib/directory'

export type ParishItem = { id: string; name: string; href: string; address: string | null; place: string; deanery: string | null; lat: number | null; lng: number | null; mass: string | null }

const field = 'min-h-12 w-full rounded-xl border border-field bg-surface px-4 text-[16px] text-ink'

/**
 * Parish search with “Near me”. With showAll, every parish is listed (grouped by deanery) in the page itself,
 * so Google can follow each link; otherwise results appear as the visitor types.
 */
export function ParishList({ items, showAll = false, groupByDeanery = false, regions, placeholder = 'Search by parish name, town or area' }: { items: ParishItem[]; showAll?: boolean; groupByDeanery?: boolean; regions?: { order: string[]; of: Record<string, string> }; placeholder?: string }) {
  const [q, setQ] = useState('')
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null)
  const [geo, setGeo] = useState<'idle' | 'busy' | 'denied' | 'none'>('idle')
  const located = items.filter((i) => i.lat != null && i.lng != null)

  const near = () => {
    if (!navigator.geolocation) { setGeo('denied'); return }
    setGeo('busy')
    navigator.geolocation.getCurrentPosition(
      (p) => { setMe({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeo(located.length ? 'idle' : 'none') },
      () => setGeo('denied'),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
    )
  }

  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
  let list = words.length ? items.filter((i) => words.every((w) => `${i.name} ${i.address ?? ''} ${i.place} ${i.deanery ?? ''}`.toLowerCase().includes(w))) : showAll || me ? items : []
  let dist = new Map<string, number>()
  if (me) {
    dist = new Map(located.map((i) => [i.id, km(me, { lat: i.lat!, lng: i.lng! })]))
    list = list.filter((i) => dist.has(i.id)).sort((a, b) => dist.get(a.id)! - dist.get(b.id)!).slice(0, 30)
  } else if (!showAll) list = list.slice(0, 60)

  const card = (i: ParishItem) => (
    <li key={i.id}>
      <Link href={i.href} className="flex h-full flex-col gap-1 rounded-xl border border-line bg-surface px-4 py-3 text-ink no-underline hover:border-accent">
        <strong className="leading-snug">{i.name}</strong>
        <span className="text-[14px] text-muted">{[i.address, i.place].filter(Boolean).join(' · ')}</span>
        {i.mass && <span className="text-[13px] text-eyebrow">⛪ {i.mass}</span>}
        {dist.has(i.id) && <span className="text-[13px] font-semibold text-accent">{dist.get(i.id)! < 1 ? 'Under 1 km away' : `${dist.get(i.id)!.toFixed(dist.get(i.id)! < 10 ? 1 : 0)} km away`}</span>}
      </Link>
    </li>
  )
  const grid = 'm-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]'
  const grouped = groupByDeanery && !words.length && !me
  const regionOf = (d: string) => regions?.of[d] ?? ''
  const rank = (d: string) => { const r = regionOf(d); const i = regions ? regions.order.indexOf(r) : -1; return i < 0 ? 999 : i }
  const groups = grouped ? [...list.reduce((m, i) => m.set(i.deanery ?? '', [...(m.get(i.deanery ?? '') ?? []), i]), new Map<string, ParishItem[]>())].sort(([a], [b]) => (a ? 0 : 1) - (b ? 0 : 1) || rank(a) - rank(b) || a.localeCompare(b)) : []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label="Search parishes" className={`${field} min-w-0 flex-1 basis-64`} />
        <button type="button" onClick={near} className="min-h-12 rounded-xl bg-accent px-5 font-semibold text-accent-ink">{geo === 'busy' ? 'Finding you…' : '📍 Parishes near me'}</button>
      </div>
      {geo === 'denied' && <p className="m-0 text-[14px] text-muted">Your location is not available. Allow location for this site in your browser, or search by town instead.</p>}
      {(geo === 'none' || (me && list.length === 0)) && <p className="m-0 text-[14px] text-muted">No parish here has its map position yet. Search by town, or help us by adding your parish with its Google Maps link.</p>}
      {me && list.length > 0 && <p className="m-0 text-[14px] text-muted">Nearest parishes with a map position, closest first. <button type="button" className="font-semibold text-accent" onClick={() => setMe(null)}>Clear</button></p>}
      {words.length > 0 && list.length === 0 && <p className="m-0 text-muted">No parish found for “{q}”. Is it missing? <Link href="/churches/add">Add it</Link>.</p>}
      {grouped
        ? groups.map(([d, ps], gi) => (
            <section key={d || 'none'} className="flex flex-col gap-2">
              {regions && regionOf(d) && regionOf(d) !== regionOf(groups[gi - 1]?.[0] ?? '') && <h3 id={`region-${regionOf(d).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="m-0 mt-3 border-b border-line pb-1.5 font-serif text-[26px] font-semibold">{regionOf(d)}</h3>}
              {groups.length > 1 && <h4 className="m-0 text-[17px] font-semibold">{d || 'Other parishes'} <span className="font-normal text-muted">· {ps.length}</span></h4>}
              <ul className={grid}>{ps.map(card)}</ul>
            </section>
          ))
        : list.length > 0 && <ul className={grid}>{list.map(card)}</ul>}
    </div>
  )
}
