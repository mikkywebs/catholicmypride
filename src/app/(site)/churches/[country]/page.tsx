import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { JsonLd } from '@/components/article-bits'
import { ParishList } from '@/components/parish-list'
import { AddParishBox } from '@/components/add-parish-box'
import { DirRows, Fold } from '@/components/directory-bits'
import { Breadcrumb } from '@/components/ui'
import { getChurches, getDioceses, getDirectoryRegions } from '@/lib/data'
import { breadcrumbLd, continentPath, countryPath, diocesePath, dioceseTitle, dirSlug, isParish, parishItem, plural } from '@/lib/directory'
import { SITE_URL } from '@/lib/format'
import { CONTINENTS } from '@/lib/geo'
import { DIRECTORY_FACTS } from '@/lib/directory-data'
import { ContinentView } from '@/components/continent-view'

async function load(slug: string) {
  const [dioceses, churches, regions] = await Promise.all([getDioceses(), getChurches(), getDirectoryRegions()])
  const mine = dioceses.filter((d) => dirSlug(d.country) === slug)
  if (!mine.length) return null
  const country = mine[0].country
  const ids = new Set(mine.map((d) => d.id))
  const parishes = churches.filter((c) => c.diocese_id && ids.has(c.diocese_id))
  const region = regions.find((r) => r.country === country && !r.province)
  return { country, dioceses: mine, parishes, region }
}

/** /churches/africa etc. share this route with country pages. */
const continentOf = (slug: string) => CONTINENTS.find((c) => dirSlug(c) === slug) ?? null

export async function generateMetadata(props: PageProps<'/churches/[country]'>): Promise<Metadata> {
  const { country: slug } = await props.params
  const cont = continentOf(slug)
  if (cont) {
    const has = (await getDioceses()).some((d) => d.continent === cont)
    const title = `Catholic Churches in ${cont}: Parishes by Country`
    const description = `Find Catholic parishes in ${cont} by country, ecclesiastical province, archdiocese and diocese, with addresses, Mass times and directions.`
    return { title, description, alternates: { canonical: continentPath(cont) }, robots: has ? undefined : { index: false, follow: true } }
  }
  const x = await load(slug)
  if (!x) return {}
  const title = `Catholic Churches in ${x.country}: Parishes by Diocese`
  const description = `Find Catholic parishes in ${x.country} by ecclesiastical province, archdiocese and diocese, with addresses, Mass times and directions. ${x.parishes.some(isParish) ? `${plural(x.parishes.filter(isParish).length, 'parish', 'parishes')} listed so far.` : 'Help us add your parish.'}`
  return { title, description, alternates: { canonical: countryPath(x.country) }, openGraph: { title, description } }
}

export default function Page(props: PageProps<'/churches/[country]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content params={props.params} searchParams={props.searchParams} /></Suspense>
}

async function Content({ params, searchParams }: { params: PageProps<'/churches/[country]'>['params']; searchParams: PageProps<'/churches/[country]'>['searchParams'] }) {
  const { country: slug } = await params
  const sp = await searchParams
  const openProvince = typeof sp.province === 'string' ? sp.province : ''
  const cont = continentOf(slug)
  if (cont) {
    const [dioceses, churches] = await Promise.all([getDioceses(), getChurches()])
    if (!dioceses.some((d) => d.continent === cont)) notFound()
    return <ContinentView continent={cont} dioceses={dioceses} churches={churches} />
  }
  const x = await load(slug)
  if (!x) notFound()
  const continent = x.dioceses[0].continent
  const count = new Map<string, number>()
  for (const c of x.parishes.filter(isParish)) count.set(c.diocese_id!, (count.get(c.diocese_id!) ?? 0) + 1)
  const byProvince = new Map<string, typeof x.dioceses>()
  for (const d of x.dioceses) byProvince.set(d.province || '', [...(byProvince.get(d.province || '') ?? []), d])
  const provinces = [...byProvince.entries()].sort(([a], [b]) => (a ? 0 : 1) - (b ? 0 : 1) || a.localeCompare(b))
  // The province's own see first (Naples before Capua), then other archdioceses, then the rest by name.
  type S = { kind: string; name: string; province: string | null }
  const rank = (d: S) => (d.province && d.name === d.province ? 0 : d.kind === 'Archdiocese' || d.kind === 'Patriarchate' ? 1 : 2)
  const sortD = (a: S, b: S) => rank(a) - rank(b) || a.name.localeCompare(b.name)
  const byId = new Map(x.dioceses.map((d) => [d.id, d]))
  const items = x.parishes.map((c) => parishItem(c, byId.get(c.diocese_id!)!))
  const r = x.region
  const facts = r ? [r.total_dioceses && `${r.total_dioceses} dioceses`, r.total_parishes && `${Number(r.total_parishes).toLocaleString('en-GB')} parishes`, r.catholic_population && `${Number(r.catholic_population).toLocaleString('en-GB')} Catholics`].filter(Boolean) : []
  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-7 px-6 pb-[72px] pt-8">
      <JsonLd data={breadcrumbLd(SITE_URL, [{ name: 'Parish Directory', path: '/churches' }, { name: continent, path: continentPath(continent) }, { name: x.country, path: countryPath(x.country) }])} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Parish Directory', href: '/churches' }, { label: continent, href: continentPath(continent) }, { label: x.country }]} />
      <div className="flex flex-col gap-2 text-center">
        <p className="eyebrow m-0">Catholic Parish Directory</p>
        <h1 className="m-0 font-serif text-[36px] font-semibold leading-tight sm:text-[46px]">Catholic Churches in {x.country}</h1>
        <p className="mx-auto m-0 max-w-2xl text-muted">{[...facts, x.parishes.some(isParish) ? `${plural(x.parishes.filter(isParish).length, 'parish', 'parishes')} listed here so far` : null].filter(Boolean).join(' · ')}</p>
        {DIRECTORY_FACTS[x.country]?.note && <p className="mx-auto m-0 max-w-2xl text-[15px] text-muted">{DIRECTORY_FACTS[x.country].note}</p>}
      </div>
      {items.length > 0 && <ParishList items={items} placeholder={`Search parishes in ${x.country} by name, town or area`} />}
      <section className="flex flex-col gap-3">
        <h2 className="m-0 font-serif text-[28px] font-semibold">Provinces and dioceses</h2>
        {provinces.map(([p, ds]) => (
          <Fold key={p || 'other'} id={p ? dirSlug(p) : 'other'} open={(Boolean(p) && dirSlug(p) === openProvince) || provinces.length === 1} title={p ? `Province of ${p}` : provinces.length === 1 ? 'Dioceses (directly under the Holy See)' : 'Other jurisdictions'} meta={`${ds.length} ${ds.length === 1 ? (p ? 'diocese' : 'jurisdiction') : p ? 'dioceses' : 'jurisdictions'} · ${ds.reduce((n, d) => n + (count.get(d.id) ?? 0), 0).toLocaleString('en-GB')} parishes listed`}>
            <DirRows rows={ds.sort(sortD).map((d) => ({ id: d.id, name: dioceseTitle(d), href: diocesePath(d), sub: d.cathedral ?? null, note: count.get(d.id) ? `${plural(count.get(d.id)!, 'parish', 'parishes')} listed` : 'Add the first parish', img: d.featured_image, alt: d.image_alt }))} />
          </Fold>
        ))}
      </section>
      <AddParishBox href={`/churches/add?country=${encodeURIComponent(x.country)}`} place={x.country} first={!x.parishes.length} />
    </div>
  )
}
