import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { JsonLd } from '@/components/article-bits'
import { DirPicture, DirRows, Fold, type Row } from '@/components/directory-bits'
import { ParishList } from '@/components/parish-list'
import { Breadcrumb } from '@/components/ui'
import { getChurches, getDioceses } from '@/lib/data'
import { breadcrumbLd, continentPath, countryPath, diocesePath, dioceseTitle, dirSlug, parishItem, parishPath, parseRegions } from '@/lib/directory'
import { SITE_URL } from '@/lib/format'
import type { Church } from '@/lib/types'

async function load(countrySlug: string, dioceseSlug: string) {
  const [dioceses, churches] = await Promise.all([getDioceses(), getChurches()])
  const d = dioceses.find((x) => dirSlug(x.country) === countrySlug && dirSlug(x.name) === dioceseSlug)
  if (!d) return null
  const parishes = churches.filter((c) => c.diocese_id === d.id)
  const siblings = d.province ? dioceses.filter((x) => x.country === d.country && x.province === d.province && x.id !== d.id) : []
  // The whole province: its dioceses (this one included) and every parish listed in them.
  const provinceIds = new Set([d.id, ...siblings.map((x) => x.id)])
  const provinceParishes = d.province ? churches.filter((c) => c.diocese_id && provinceIds.has(c.diocese_id)).length : 0
  return { d, parishes, siblings, provinceParishes }
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
  return { title, description, alternates: { canonical: diocesePath(x.d) }, robots: x.parishes.length ? undefined : { index: false, follow: true }, openGraph: { title, description, images: x.d.featured_image ? [x.d.featured_image] : undefined } }
}

export default function Page(props: PageProps<'/churches/[country]/[diocese]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content params={props.params} /></Suspense>
}

const anchor = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

async function Content({ params }: { params: PageProps<'/churches/[country]/[diocese]'>['params'] }) {
  const { country, diocese } = await params
  const x = await load(country, diocese)
  if (!x) notFound()
  const { d, parishes, siblings, provinceParishes } = x
  const t = dioceseTitle(d)
  const rows = (list: Church[]): Row[] => list.map((c) => ({ id: c.id, name: c.name, href: parishPath(c, d), sub: c.address ? c.address.replace(new RegExp(`,\\s*${d.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), '') : null, img: c.featured_image, alt: c.image_alt }))

  // Region › Deanery › Parish (regions only where the diocese has them).
  const reg = parseRegions(d.deanery_regions)
  const deaneries = [...new Set([...(d.deaneries ?? []), ...parishes.map((c) => c.deanery).filter(Boolean) as string[]])].sort()
  const inDeanery = (n: string) => parishes.filter((c) => c.deanery === n)
  const loose = parishes.filter((c) => !c.deanery)
  const regionBlocks = reg.order.map((r) => ({ r, ds: deaneries.filter((n) => reg.regionOf(n) === r) })).filter((b) => b.ds.length)
  const unplaced = reg.order.length ? deaneries.filter((n) => !reg.regionOf(n)) : deaneries
  const deaneryBlock = (n: string) => {
    const ps = inDeanery(n)
    return (
      <section key={n} className="flex flex-col gap-1 px-2">
        <h3 className="m-0 text-[15px] font-semibold uppercase tracking-[0.08em] text-eyebrow">{n} <span className="font-normal normal-case tracking-normal text-muted">· {ps.length || 'none listed yet'}</span></h3>
        {ps.length > 0 && <DirRows rows={rows(ps)} />}
      </section>
    )
  }
  const facts = [parishes.length ? `${parishes.length} parishes listed` : null, d.total_parishes ? `${d.total_parishes.toLocaleString('en-GB')} parishes in all` : null, d.catholic_population ? `${d.catholic_population.toLocaleString('en-GB')} Catholics` : null].filter(Boolean)

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-7 px-6 pb-[72px] pt-8">
      <JsonLd data={breadcrumbLd(SITE_URL, [{ name: 'Parish Directory', path: '/churches' }, { name: d.continent, path: continentPath(d.continent) }, { name: d.country, path: countryPath(d.country) }, { name: t, path: diocesePath(d) }])} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Parish Directory', href: '/churches' }, { label: d.continent, href: continentPath(d.continent) }, { label: d.country, href: countryPath(d.country) }, { label: t }]} />

      <header className={d.featured_image ? 'grid items-center gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]' : 'flex flex-col'}>
        {d.featured_image && <DirPicture src={d.featured_image} alt={d.image_alt ?? d.cathedral} className="aspect-[4/3] w-full rounded-2xl" sizes="(max-width: 768px) 100vw, 460px" priority />}
        <div className="flex flex-col gap-2.5">
          <p className="eyebrow m-0">Catholic parishes · {d.country}</p>
          <h1 className="m-0 font-serif text-[36px] font-semibold leading-tight sm:text-[44px]">{t}</h1>
          {d.cathedral && <p className="m-0 text-[17px]">⛪ {d.cathedral}</p>}
          {facts.length > 0 && <p className="m-0 text-[15px] text-muted">{facts.join(' · ')}</p>}
          {d.province && (
            <p className="m-0 text-[15px]">
              <Link href={`${countryPath(d.country)}?province=${dirSlug(d.province)}#${dirSlug(d.province)}`} className="font-semibold">Province of {d.province}</Link>
              <span className="text-muted">: {siblings.length + 1} {siblings.length ? 'dioceses' : 'diocese'} · {provinceParishes.toLocaleString('en-GB')} parishes listed</span>
            </p>
          )}
          {d.address && <p className="m-0 text-[15px] text-muted">📍 {d.address} · <a href={d.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.address}, ${d.country}`)}`} target="_blank" rel="noopener noreferrer">Directions</a></p>}
        </div>
      </header>

      {parishes.length > 0 && <ParishList items={parishes.map((c) => parishItem(c, d))} placeholder={`Search ${parishes.length} parishes in the ${t}`} />}

      {parishes.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[28px] font-semibold">Browse the parishes</h2>
          {regionBlocks.map(({ r, ds }) => (
            <Fold key={r} id={`region-${anchor(r)}`} title={r} meta={`${ds.length} deaneries · ${ds.reduce((n, x) => n + inDeanery(x).length, 0)} parishes listed`}>{ds.map(deaneryBlock)}</Fold>
          ))}
          {!regionBlocks.length && unplaced.map((n) => <Fold key={n} title={n} meta={`${inDeanery(n).length || 'No'} parishes listed`}><DirRows rows={rows(inDeanery(n))} /></Fold>)}
          {regionBlocks.length > 0 && unplaced.length > 0 && <Fold title="Other deaneries" meta={`${unplaced.length} deaneries`}>{unplaced.map(deaneryBlock)}</Fold>}
          {loose.length > 0 && (deaneries.length ? <Fold title="Parishes without a deanery yet" meta={`${loose.length} parishes`}><DirRows rows={rows(loose)} /></Fold> : <DirRows rows={rows(loose)} />)}
        </section>
      ) : <p className="m-0 rounded-2xl border border-line bg-surface p-6 text-center text-muted">No parishes are listed here yet.</p>}

      <p className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-gold bg-surface px-5 py-4">
        <span><strong>Is your parish missing?</strong> <span className="text-muted">Send its address and Mass times; we add it after a quick check.</span></span>
        <Link href={`/churches/add?diocese=${d.id}`} className="rounded-md bg-accent px-4 py-2 font-semibold text-accent-ink no-underline">➕ Add your parish</Link>
      </p>

      {siblings.length > 0 && (
        <nav aria-label="Other dioceses in the province" className="flex flex-col gap-2">
          <h2 className="m-0 text-lg font-semibold">Other dioceses in the Province of {d.province}</h2>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">{siblings.map((s) => <li key={s.id}><Link href={diocesePath(s)} className="inline-block rounded-full border border-line bg-surface px-3.5 py-1.5 text-[15px] text-ink no-underline hover:border-accent">{dioceseTitle(s)}</Link></li>)}</ul>
        </nav>
      )}
    </div>
  )
}
