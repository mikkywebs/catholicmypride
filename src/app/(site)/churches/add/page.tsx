import type { Metadata } from 'next'
import { Suspense } from 'react'
import { JsonLd } from '@/components/article-bits'
import { AddParishForm } from '@/components/add-parish-form'
import { Breadcrumb } from '@/components/ui'
import { getChurches, getDioceses, getSettings } from '@/lib/data'
import { breadcrumbLd, dioceseTitle } from '@/lib/directory'
import { SITE_URL } from '@/lib/format'

// Written for what parishes and parishioners search: “add my parish”, “list my church”,
// “Catholic church directory”, “submit parish Mass times”.
const TITLE = 'Add Your Catholic Parish: Free Listing in the Catholic Parish Directory'
const DESCRIPTION = 'List your Catholic parish free in the Catholic My Pride parish directory, with its address, Mass times, phone and directions, so Catholics nearby and visitors can find it on Google. Parishioners and parish staff in every country are welcome.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['add my parish', 'list my Catholic church', 'Catholic parish directory', 'Catholic church directory', 'submit Mass times', 'Catholic Mass times near me'],
  alternates: { canonical: '/churches/add' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/churches/add', type: 'website' },
}

const WHY: [string, string, string][] = [
  ['🔎', 'Found on Google', 'Every parish gets its own page, made to show up when people search for Catholic churches and Mass times in your area.'],
  ['📍', '“Parishes near me”', 'With a map link, your parish appears for visitors, travellers and newcomers looking for the nearest Mass.'],
  ['🕊️', 'Free, and checked', 'Listing costs nothing. We check every entry before it appears, so the directory stays trustworthy.'],
]

const STEPS: [string, string][] = [
  ['Choose the place', 'Country, then archdiocese or diocese, and the deanery if you know it.'],
  ['Add the details', 'The parish name, address, Mass times and, if you have them, the parish phone, email and a Google Maps link.'],
  ['We check it', 'We confirm the details, usually within a few days.'],
  ['It goes live', 'Your parish gets its own page in the directory, ready to share.'],
]

const FAQ: [string, string][] = [
  ['Does it cost anything to list a parish?', 'No. Listing a Catholic parish in the Catholic My Pride directory is free.'],
  ['Who can add a parish?', 'Any parishioner, parish secretary, priest or religious who knows the parish well. Please send only details you are sure of, for example from the parish bulletin or notice board.'],
  ['Which details should I include?', 'The parish name, its address and the Mass times are the most useful. A Google Maps link, the parish phone, email and website help too.'],
  ['My parish is already listed but the details are wrong. What do I do?', 'Open the parish page and choose “Is this your parish? Update the details”. Listed phone numbers, emails and websites can only be changed by the parish itself, by writing to us, so no one can replace them with false ones.'],
  ['Can I add chaplaincies and outstations?', 'Yes. Add them the same way and mention in the note that it is a chaplaincy, outstation or pastoral area, so we list it correctly.'],
  ['My country or diocese is not in the list. Can I still add my parish?', 'Write the details in the note, or contact us, and we will add the diocese first. We are adding the dioceses of every continent.'],
]

export default function Page(props: PageProps<'/churches/add'>) {
  return <Suspense fallback={<div className="h-96" />}><Content searchParams={props.searchParams} /></Suspense>
}

async function Content({ searchParams }: { searchParams: PageProps<'/churches/add'>['searchParams'] }) {
  const sp = await searchParams
  const [dioceses, churches, settings] = await Promise.all([getDioceses(), getChurches(), getSettings()])
  const church = typeof sp.update === 'string' ? churches.find((c) => c.id === sp.update) ?? null : null
  const diocese = typeof sp.diocese === 'string' ? dioceses.find((d) => d.id === sp.diocese) : undefined
  const place = diocese ? `the ${dioceseTitle(diocese)}` : typeof sp.country === 'string' && dioceses.some((d) => d.country === sp.country) ? sp.country : ''
  const form = <AddParishForm dioceses={dioceses.map(({ id, name, kind, country, deaneries }) => ({ id, name, kind, country, deaneries }))} church={church} initialCountry={typeof sp.country === 'string' ? sp.country : undefined} initialDiocese={typeof sp.diocese === 'string' ? sp.diocese : undefined} contactEmail={settings.contact_email} />

  if (church) {
    return (
      <div className="mx-auto flex max-w-[860px] flex-col gap-6 px-6 pb-[72px] pt-8">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Parish Directory', href: '/churches' }, { label: 'Update a parish' }]} />
        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-serif text-[36px] font-semibold leading-tight sm:text-[46px]">Update: {church.name}</h1>
          <p className="m-0 text-[17px] text-muted">Correct anything that is wrong or missing, such as the Mass times or the address. We check every update before it appears.</p>
        </div>
        {form}
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-9 px-6 pb-[72px] pt-8">
      <JsonLd data={breadcrumbLd(SITE_URL, [{ name: 'Parish Directory', path: '/churches' }, { name: 'Add your parish', path: '/churches/add' }])} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Parish Directory', href: '/churches' }, { label: 'Add your parish' }]} />

      <header className="flex flex-col items-center gap-3 text-center">
        <p className="eyebrow m-0">Catholic Parish Directory · Free listing</p>
        <h1 className="m-0 font-serif text-[36px] font-semibold leading-tight sm:text-[46px]">Add your Catholic parish{place ? ` in ${place}` : ''}</h1>
        <p className="m-0 max-w-2xl text-[18px] text-muted">We are building a free directory of every Catholic parish in the world, with addresses, Mass times and directions. Add your parish so Catholics nearby and visitors can find it, and help someone get to Mass this Sunday.</p>
        <a href="#parish-form" className="mt-1 rounded-md bg-accent px-6 py-3 text-[17px] font-semibold text-accent-ink no-underline">➕ Add your parish now</a>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 font-serif text-[28px] font-semibold">Why list your parish</h2>
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-3">
          {WHY.map(([icon, t, d]) => (
            <li key={t} className="flex flex-col gap-1 rounded-2xl border border-line bg-surface px-5 py-4">
              <span aria-hidden className="text-[26px]">{icon}</span>
              <h3 className="m-0 text-[17px] font-semibold">{t}</h3>
              <p className="m-0 text-[15px] text-muted">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 font-serif text-[28px] font-semibold">How to add a parish</h2>
        <ol className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="flex flex-col gap-1 rounded-2xl bg-sky px-4 py-4">
              <span className="font-serif text-[26px] font-semibold text-eyebrow">{i + 1}</span>
              <h3 className="m-0 text-[16px] font-semibold">{t}</h3>
              <p className="m-0 text-[14px] text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="parish-form" className="flex scroll-mt-24 flex-col gap-4">
        <h2 className="m-0 font-serif text-[28px] font-semibold">Your parish details</h2>
        {form}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 font-serif text-[28px] font-semibold">Questions about listing a parish</h2>
        {FAQ.map(([q, a]) => (
          <details key={q} className="rounded-xl border border-line bg-surface px-5 py-3">
            <summary className="cursor-pointer font-semibold">{q}</summary>
            <p className="m-0 mt-2 text-muted">{a}</p>
          </details>
        ))}
      </section>
    </div>
  )
}
