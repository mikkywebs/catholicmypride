import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { JsonLd } from '@/components/article-bits'
import { ParishList } from '@/components/parish-list'
import { AddParishBox } from '@/components/add-parish-box'
import { Breadcrumb } from '@/components/ui'
import { getChurches, getDioceses, getDirectoryRegions } from '@/lib/data'
import { breadcrumbLd, countryPath, diocesePath, dioceseTitle, dirSlug, parishItem } from '@/lib/directory'
import { SITE_URL } from '@/lib/format'

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

export async function generateMetadata(props: PageProps<'/churches/[country]'>): Promise<Metadata> {
  const { country: slug } = await props.params
  const x = await load(slug)
  if (!x) return {}
  const title = `Catholic Churches in ${x.country}: Parishes by Diocese`
  const description = `Find Catholic parishes in ${x.country} by ecclesiastical province, archdiocese and diocese, with addresses, Mass times and directions. ${x.parishes.length ? `${x.parishes.length} parishes listed so far.` : 'Help us add your parish.'}`
  return { title, description, alternates: { canonical: countryPath(x.country) }, openGraph: { title, description } }
}

export default function Page(props: PageProps<'/churches/[country]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content params={props.params} /></Suspense>
}

async function Content({ params }: { params: PageProps<'/churches/[country]'>['params'] }) {
  const { country: slug } = await params
  const x = await load(slug)
  if (!x) notFound()
  const count = new Map<string, number>()
  for (const c of x.parishes) count.set(c.diocese_id!, (count.get(c.diocese_id!) ?? 0) + 1)
  const byProvince = new Map<string, typeof x.dioceses>()
  for (const d of x.dioceses) byProvince.set(d.province || '', [...(byProvince.get(d.province || '') ?? []), d])
  const provinces = [...byProvince.entries()].sort(([a], [b]) => (a ? 0 : 1) - (b ? 0 : 1) || a.localeCompare(b))
  const sortD = (a: { kind: string; name: string }, b: { kind: string; name: string }) => (a.kind === 'Archdiocese' ? -1 : 0) - (b.kind === 'Archdiocese' ? -1 : 0) || a.name.localeCompare(b.name)
  const byId = new Map(x.dioceses.map((d) => [d.id, d]))
  const items = x.parishes.map((c) => parishItem(c, byId.get(c.diocese_id!)!))
  const r = x.region
  const stats = r ? ([['Provinces', r.total_provinces], ['Dioceses', r.total_dioceses], ['Parishes', r.total_parishes], ['Priests', r.total_priests], ['Catholics', r.catholic_population]] as const).filter(([, v]) => v) : []
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-6 pb-[72px] pt-8">
      <JsonLd data={breadcrumbLd(SITE_URL, [{ name: 'Parish Directory', path: '/churches' }, { name: x.country, path: countryPath(x.country) }])} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Parish Directory', href: '/churches' }, { label: x.country }]} />
      <div className="flex flex-col gap-3 text-center">
        <p className="eyebrow m-0">Catholic Parish Directory</p>
        <h1 className="m-0 font-serif text-[38px] font-semibold leading-tight sm:text-[48px]">Catholic Churches in {x.country}</h1>
        <p className="mx-auto m-0 max-w-2xl text-muted">Find a parish by ecclesiastical province, archdiocese and diocese. {x.parishes.length ? `${x.parishes.length} parishes listed so far, ` : ''}with addresses, Mass times and directions.</p>
      </div>
      {stats.length > 0 && (
        <dl className="m-0 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
          {stats.map(([k, v]) => <div key={k} className="rounded-2xl border border-line bg-surface px-4 py-3 text-center"><dt className="text-[13px] text-muted">{k}</dt><dd className="m-0 text-xl font-semibold">{Number(v).toLocaleString('en-GB')}</dd></div>)}
        </dl>
      )}
      {items.length > 0 && <ParishList items={items} placeholder={`Search parishes in ${x.country} by name, town or area`} />}
      <section className="flex flex-col gap-6">
        <h2 className="m-0 font-serif text-[30px] font-semibold">Provinces and dioceses</h2>
        {provinces.map(([p, ds]) => (
          <div key={p || 'other'} className="flex flex-col gap-2.5">
            <h3 id={p ? dirSlug(p) : 'other'} className="m-0 text-xl font-semibold">{p ? `Ecclesiastical Province of ${p}` : 'Other jurisdictions'}</h3>
            <ul className="m-0 grid list-none gap-2.5 p-0 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
              {ds.sort(sortD).map((d) => (
                <li key={d.id}><Link href={diocesePath(d)} className="flex flex-col rounded-xl border border-line bg-surface px-4 py-3 text-ink no-underline hover:border-accent">
                  <strong>{dioceseTitle(d)}</strong>
                  <span className="text-[14px] text-muted">{count.get(d.id) ? `${count.get(d.id)} parishes listed` : 'Add the first parish'}</span>
                </Link></li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <AddParishBox href={`/churches/add?country=${encodeURIComponent(x.country)}`} />
    </div>
  )
}
