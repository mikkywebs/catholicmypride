// Web addresses and helpers for the parish directory: /churches/<country>/<diocese>/<parish>.
import { slugify } from './text'
import type { Church, Diocese } from './types'

/** “Murang'a” → “muranga”, “St Joseph's Parish” → “st-josephs-parish”. Matches the database rule in update 0040. */
export const dirSlug = (s: string) => slugify(s.replace(/['’]/g, '')) || 'parish'

export const countryPath = (country: string) => `/churches/${dirSlug(country)}`
export const diocesePath = (d: Pick<Diocese, 'country' | 'name'>) => `${countryPath(d.country)}/${dirSlug(d.name)}`
export const parishPath = (c: Pick<Church, 'id' | 'slug'>, d: Pick<Diocese, 'country' | 'name'>) => `${diocesePath(d)}/${c.slug || c.id}`

/** “Archdiocese of Lagos”, “Diocese of Kumbo”; a military ordinariate or eparchy keeps its full name. */
export function dioceseTitle(d: Pick<Diocese, 'kind' | 'name'>) {
  if (/ordinariate|eparchy/i.test(d.kind) || /^military ordinariate/i.test(d.name)) return d.name
  return `${d.kind} of ${d.name}`
}

/** Map position from a Google Maps link (…/@6.5244,3.3792,… or ?q=6.5244,3.3792 or !3d6.52!4d3.37). */
export function coordsFromMapUrl(url: string | null | undefined): { lat: number; lng: number } | null {
  if (!url) return null
  const m = url.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/) ?? url.match(/[?&](?:q|query|ll|destination)=(-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/) ?? url.match(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/)
  if (!m) return null
  const lat = Number(m[1]), lng = Number(m[2])
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null
}

/** Distance in km between two points (haversine). */
export function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const r = (x: number) => (x * Math.PI) / 180
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

/** Mass times typed one per line (“Sunday: 7am, 9am”) → [label, times] pairs for display. */
export function massLines(text: string | null | undefined): [string, string][] {
  return (text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
    const i = l.indexOf(':')
    return i > 0 && i < 40 && !/^\d/.test(l) ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : ['', l]
  })
}

/** A parish as shown in search lists. */
export function parishItem(c: Church, d: Diocese) {
  const first = massLines(c.mass_times).find(([k]) => /sun/i.test(k)) ?? massLines(c.mass_times)[0]
  return {
    id: c.id, name: c.name, href: parishPath(c, d), address: c.address, place: d.name, deanery: c.deanery,
    img: c.featured_image ?? null, lat: c.lat ?? null, lng: c.lng ?? null, mass: first ? (first[0] ? `${first[0]}: ${first[1]}` : first[1]).slice(0, 70) : null,
  }
}

/** Google breadcrumb data for a directory page. */
export function breadcrumbLd(site: string, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${site}${it.path}` })),
  }
}

/** Regions of a large diocese, typed as lines “Ikeja Region: Agege, Ikeja, Ijede”.
 *  Returns the regions in order, and a lookup from deanery (with or without the word “Deanery”) to its region. */
export function parseRegions(text: string | null | undefined) {
  const key = (s: string) => s.toLowerCase().replace(/\s+(deanery|zone)$/i, '').replace(/[^a-z0-9]/g, '')
  const order: string[] = []
  const of = new Map<string, string>()
  for (const line of (text ?? '').split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i < 1) continue
    const region = line.slice(0, i).trim()
    order.push(region)
    for (const d of line.slice(i + 1).split(',')) if (d.trim()) of.set(key(d), region)
  }
  return { order, regionOf: (deanery: string | null | undefined) => (deanery ? of.get(key(deanery)) ?? null : null) }
}
