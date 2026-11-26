import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { JsonLd } from '@/components/article-bits'
import { ShareBar } from '@/components/engage'
import { PlaceMap } from '@/components/place-map'
import { Breadcrumb, ButtonLink } from '@/components/ui'
import { StayConnected } from '@/components/whatsapp-join'
import { getChurches, getDioceses, getSettings } from '@/lib/data'
import { breadcrumbLd, countryPath, diocesePath, dioceseTitle, dirSlug, massLines, parishPath } from '@/lib/directory'
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
  const [x, s] = await Promise.all([load(country, diocese, parish), getSettings()])
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
    hasMap: c.map_url || undefined,
    parentOrganization: { '@type': 'Organization', name: t },
  }
  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-6 px-6 pb-[72px] pt-8">
      <JsonLd data={ld} />
      <JsonLd data={breadcrumbLd(SITE_URL, [{ name: 'Parish Directory', path: '/churches' }, { name: d.country, path: countryPath(d.country) }, { name: t, path: diocesePath(d) }, { name: c.name, path }])} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Parish Directory', href: '/churches' }, { label: d.country, href: countryPath(d.country) }, { label: d.name, href: diocesePath(d) }, { label: c.name }]} />
      <div className="flex flex-col gap-2.5">
        <p className="eyebrow m-0">Catholic parish · {[c.deanery, t, d.country].filter(Boolean).join(' · ')}</p>
        <h1 className="m-0 font-serif text-[36px] font-semibold leading-tight sm:text-[46px]">{c.name}</h1>
        {c.address && <p className="m-0 text-[17px] text-muted">📍 {c.address}</p>}
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="m-0 font-serif text-[26px] font-semibold">Mass times</h2>
        {mass.length ? (
          <dl className="m-0 grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
            {mass.map(([k, v], i) => <div key={i} className="contents"><dt className="font-semibold">{k}</dt><dd className="m-0">{v}</dd></div>)}
          </dl>
        ) : <p className="m-0 text-muted">Mass times have not been added yet. Do you know them? Please tell us below.</p>}
        <p className="m-0 text-[13px] text-muted">Times can change on feast days and holidays. If in doubt, check with the parish.</p>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="m-0 font-serif text-[26px] font-semibold">Find us</h2>
        <PlaceMap name={c.name} address={c.address} country={d.country} mapUrl={c.map_url} />
        {(c.phone || c.email || website) && (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[16px]">
            {c.phone && <li>📞 <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>{c.phone}</a></li>}
            {c.email && <li>✉️ <a href={`mailto:${c.email}`}>{c.email}</a></li>}
            {website && <li>🌐 <a href={website} target="_blank" rel="noopener noreferrer">{website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</a></li>}
          </ul>
        )}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-gold bg-surface p-5 sm:p-6">
        <div className="min-w-0 flex-1 basis-64"><h2 className="m-0 text-xl font-semibold">Is this your parish?</h2><p className="m-0 text-muted">Help other Catholics: send us its Mass times, phone number or any correction.</p></div>
        <ButtonLink href={`/churches/add?update=${c.id}`}>✏️ Update the details</ButtonLink>
      </section>

      <div className="flex flex-col gap-2"><strong>Share this parish with other parishioners</strong><ShareBar title={`${c.name}: Mass times and address`} /></div>

      {nearby.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="m-0 text-xl font-semibold">Other parishes in the {t}</h2>
          <ul className="m-0 grid list-none gap-2 p-0 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
            {nearby.map((n) => <li key={n.id}><Link href={parishPath(n, d)} className="flex flex-col rounded-xl border border-line bg-surface px-4 py-2.5 text-ink no-underline hover:border-accent"><strong className="leading-snug">{n.name}</strong>{n.deanery && <span className="text-[13px] text-muted">{n.deanery}</span>}</Link></li>)}
          </ul>
          <Link href={diocesePath(d)} className="font-semibold">All parishes in the {t} →</Link>
        </section>
      )}
      <StayConnected s={{ whatsapp_channel_url: s.whatsapp_channel_url, youtube_url: s.youtube_url, facebook_url: s.facebook_url, x_url: s.x_url }} />
    </div>
  )
}
