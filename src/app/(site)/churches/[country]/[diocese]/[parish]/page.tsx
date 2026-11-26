import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { JsonLd } from '@/components/article-bits'
import { ShareBar } from '@/components/engage'
import { PlaceMap } from '@/components/place-map'
import { Breadcrumb } from '@/components/ui'
import { DirPicture, DirRows } from '@/components/directory-bits'
import { getChurches, getDioceses } from '@/lib/data'
import { breadcrumbLd, countryPath, diocesePath, dioceseTitle, dirSlug, massLines, parishPath, parseRegions } from '@/lib/directory'
import { SITE_URL } from '@/lib/format'

async function load(countrySlug: string, dioceseSlug: string, parishSlug: string) {
  const [dioceses, churches] = await Promise.all([getDioceses(), getChurches()])
  const d = dioceses.find((x) => dirSlug(x.country) === countrySlug && dirSlug(x.name) === dioceseSlug)
  if (!d) return null
  const c = churches.find((x) => x.diocese_id === d.id && (x.slug === parishSlug || x.id === parishSlug))
  if (!c) return null
  const nearby = churches.filter((x) => x.diocese_id === d.id && x.id !== c.id).sort((a, b) => (a.deanery === c.deanery ? 0 : 1) - (b.deanery === c.deanery ? 0 : 1) || a.name.localeCompare(b.name)).slice(0, 8)
  return { d, c, nearby }
}

const area = (deanery: string | null) => (deanery ? deanery.replace(/\s+(deanery|zone)$/i, '') : null)

export async function generateMetadata(props: PageProps<'/churches/[country]/[diocese]/[parish]'>): Promise<Metadata> {
  const { country, diocese, parish } = await props.params
  const x = await load(country, diocese, parish)
  if (!x) return {}
  const where = area(x.c.deanery) ?? x.d.name
  const title = `${x.c.name}, ${where}: Mass Times, Address and Map`
  const description = `${x.c.name} is a Catholic parish in the ${dioceseTitle(x.d)}, ${x.d.country}.${x.c.address ? ` Address: ${x.c.address}.` : ''}${x.c.mass_times ? ' See Mass times,' : ' Find'} directions and contact details.`
  return { title, description: description.slice(0, 300), alternates: { canonical: parishPath(x.c, x.d) }, openGraph: { title, description } }
}

export default function Page(props: PageProps<'/churches/[country]/[diocese]/[parish]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content params={props.params} /></Suspense>
}

async function Content({ params }: { params: PageProps<'/churches/[country]/[diocese]/[parish]'>['params'] }) {
  const { country, diocese, parish } = await params
  const x = await load(country, diocese, parish)
  if (!x) notFound()
  const { d, c, nearby } = x
  const t = dioceseTitle(d)
  const mass = massLines(c.mass_times)
  const path = parishPath(c, d)
  const website = c.website && /^https?:\/\//i.test(c.website) ? c.website : c.website ? `https://${c.website}` : null
  const ld = {
    '@context': 'https://schema.org', '@type': 'CatholicChurch', name: c.name, url: `${SITE_URL}${path}`,
    address: c.address ? { '@type': 'PostalAddress', streetAddress: c.address, addressCountry: d.country } : { '@type': 'PostalAddress', addressCountry: d.country },
    geo: c.lat != null && c.lng != null ? { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng } : undefined,
    telephone: c.phone || undefined, email: c.email || undefined, sameAs: website ? [website] : undefined,
    hasMap: c.map_url || undefined, image: c.featured_image || undefined,
    parentOrganization: { '@type': 'Organization', name: t },
  }
  const region = parseRegions(d.deanery_regions).regionOf(c.deanery)
  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-6 px-6 pb-[72px] pt-8">
      <JsonLd data={ld} />
      <JsonLd data={breadcrumbLd(SITE_URL, [{ name: 'Parish Directory', path: '/churches' }, { name: d.country, path: countryPath(d.country) }, { name: t, path: diocesePath(d) }, { name: c.name, path }])} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Parish Directory', href: '/churches' }, { label: d.country, href: countryPath(d.country) }, { label: d.name, href: diocesePath(d) }, { label: c.name }]} />

      <header className={c.featured_image ? 'grid items-center gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]' : 'flex flex-col gap-2'}>
        {c.featured_image && <DirPicture src={c.featured_image} alt={c.image_alt ?? c.name} className="aspect-[4/3] w-full rounded-2xl" sizes="(max-width: 768px) 100vw, 440px" priority />}
        <div className="flex flex-col gap-2">
          <p className="eyebrow m-0">{[c.deanery, region].filter(Boolean).join(' · ') || 'Catholic parish'}</p>
          <h1 className="m-0 font-serif text-[34px] font-semibold leading-tight sm:text-[44px]">{c.name}</h1>
          <p className="m-0 text-muted"><Link href={diocesePath(d)}>{t}</Link> · {d.country}</p>
          {c.address && <p className="m-0 text-[17px]">📍 {c.address}</p>}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
          <h2 className="m-0 text-[22px] font-semibold">Mass times</h2>
          {mass.length ? (
            <dl className="m-0 flex flex-col gap-2">{mass.map(([k, v], i) => <div key={i}>{k && <dt className="text-[14px] font-semibold text-muted">{k}</dt>}<dd className="m-0 text-[17px]">{v}</dd></div>)}</dl>
          ) : <p className="m-0 text-muted">Not added yet. <Link href={`/churches/add?update=${c.id}`}>Do you know them?</Link></p>}
          {mass.length > 0 && <p className="m-0 text-[13px] text-muted">Times can change on feast days and holidays.</p>}
        </section>
        <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
          <h2 className="m-0 text-[22px] font-semibold">Find us</h2>
          <PlaceMap name={c.name} address={c.address} country={d.country} mapUrl={c.map_url} />
          {(c.phone || c.email || website) && (
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[16px]">
              {c.phone && <li>📞 <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>{c.phone}</a></li>}
              {c.email && <li>✉️ <a href={`mailto:${c.email}`}>{c.email}</a></li>}
              {website && <li>🌐 <a href={website} target="_blank" rel="noopener noreferrer">{website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</a></li>}
            </ul>
          )}
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ShareBar title={`${c.name}: Mass times and address`} />
        <Link href={`/churches/add?update=${c.id}`} className="text-[15px] font-semibold">✏️ Is this your parish? Update the details</Link>
      </div>

      {nearby.length > 0 && (
        <section className="flex flex-col gap-2 border-t border-line pt-5">
          <h2 className="m-0 text-lg font-semibold">{c.deanery ? `More parishes near ${c.name.split(',')[0]}` : `Other parishes in the ${t}`}</h2>
          <DirRows rows={nearby.map((n) => ({ id: n.id, name: n.name, href: parishPath(n, d), sub: n.deanery, img: n.featured_image, alt: n.image_alt }))} />
          <Link href={diocesePath(d)} className="px-2 font-semibold">All parishes in the {t} →</Link>
        </section>
      )}
    </div>
  )
}
