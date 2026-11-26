import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { AddParishBox } from '@/components/add-parish-box'
import { JsonLd } from '@/components/article-bits'
import { ParishList } from '@/components/parish-list'
import { PlaceMap } from '@/components/place-map'
import { Breadcrumb } from '@/components/ui'
import { getChurches, getDioceses } from '@/lib/data'
import { breadcrumbLd, countryPath, diocesePath, dioceseTitle, dirSlug, parishItem } from '@/lib/directory'
import { SITE_URL } from '@/lib/format'

async function load(countrySlug: string, dioceseSlug: string) {
  const [dioceses, churches] = await Promise.all([getDioceses(), getChurches()])
  const d = dioceses.find((x) => dirSlug(x.country) === countrySlug && dirSlug(x.name) === dioceseSlug)
  if (!d) return null
  const parishes = churches.filter((c) => c.diocese_id === d.id)
  const siblings = d.province ? dioceses.filter((x) => x.country === d.country && x.province === d.province && x.id !== d.id) : []
  return { d, parishes, siblings }
}

export async function generateMetadata(props: PageProps<'/churches/[country]/[diocese]'>): Promise<Metadata> {
  const { country, diocese } = await props.params
  const x = await load(country, diocese)
  if (!x) return {}
  const t = dioceseTitle(x.d)
  const title = `Catholic Parishes in the ${t}, ${x.d.country}: Addresses and Mass Times`
  const description = x.parishes.length
    ? `${x.parishes.length} Catholic parishes in the ${t}${x.d.province ? ` (Province of ${x.d.province})` : ''}, ${x.d.country}: addresses, Mass times, deaneries and directions.`
    : `Catholic parishes in the ${t}, ${x.d.country}. Help us list them: add your parish with its address and Mass times.`
  // Until a parish is listed, the page is not offered to Google (empty pages harm a site's ranking).
  return { title, description, alternates: { canonical: diocesePath(x.d) }, robots: x.parishes.length ? undefined : { index: false, follow: true }, openGraph: { title, description } }
}

export default function Page(props: PageProps<'/churches/[country]/[diocese]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content params={props.params} /></Suspense>
}

async function Content({ params }: { params: PageProps<'/churches/[country]/[diocese]'>['params'] }) {
  const { country, diocese } = await params
  const x = await load(country, diocese)
  if (!x) notFound()
  const { d, parishes, siblings } = x
  const t = dioceseTitle(d)
  const items = parishes.map((c) => parishItem(c, d))
  const facts = ([['Province', d.province ? `Ecclesiastical Province of ${d.province}` : null], ['Parishes (official)', d.total_parishes], ['Priests', d.total_priests], ['Catholics', d.catholic_population]] as const).filter(([, v]) => v)
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-6 pb-[72px] pt-8">
      <JsonLd data={breadcrumbLd(SITE_URL, [{ name: 'Parish Directory', path: '/churches' }, { name: d.country, path: countryPath(d.country) }, { name: t, path: diocesePath(d) }])} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Parish Directory', href: '/churches' }, { label: d.country, href: countryPath(d.country) }, { label: t }]} />
      <div className="flex flex-col gap-3 text-center">
        <p className="eyebrow m-0">{d.province ? `Province of ${d.province} · ${d.country}` : d.country}</p>
        <h1 className="m-0 font-serif text-[36px] font-semibold leading-tight sm:text-[46px]">Catholic Parishes in the {t}</h1>
        <p className="mx-auto m-0 max-w-2xl text-muted">{parishes.length ? `${parishes.length} parishes listed, with addresses, Mass times and directions.` : 'No parishes are listed here yet. Be the first to add yours.'}</p>
      </div>
      {facts.length > 0 && (
        <dl className="m-0 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
          {facts.map(([k, v]) => <div key={k} className="rounded-2xl border border-line bg-surface px-4 py-3 text-center"><dt className="text-[13px] text-muted">{k}</dt><dd className="m-0 font-semibold">{typeof v === 'number' ? v.toLocaleString('en-GB') : v}</dd></div>)}
        </dl>
      )}
      {(d.address || d.map_url) && (
        <section className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-5">
          <h2 className="m-0 text-lg font-semibold">Diocesan office</h2>
          {d.address && <p className="m-0 text-muted">{d.address}</p>}
          <PlaceMap name={t} address={d.address} country={d.country} mapUrl={d.map_url} />
        </section>
      )}
      {items.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[30px] font-semibold">Parishes</h2>
          <ParishList items={items} showAll groupByDeanery placeholder={`Search parishes in the ${t}`} />
        </section>
      )}
      <AddParishBox href={`/churches/add?diocese=${d.id}`} text={`Know a parish in the ${t} that is not listed? Send its address and Mass times, and we will add it after a quick check.`} />
      {siblings.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="m-0 text-xl font-semibold">Other dioceses in the Province of {d.province}</h2>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">{siblings.map((s) => <li key={s.id}><Link href={diocesePath(s)} className="inline-block rounded-full border border-line bg-surface px-4 py-2 text-ink no-underline hover:border-accent">{dioceseTitle(s)}</Link></li>)}</ul>
        </section>
      )}
    </div>
  )
}
