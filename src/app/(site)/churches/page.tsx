import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { AddParishBox } from '@/components/add-parish-box'
import { ParishList } from '@/components/parish-list'
import { Eyebrow, H1 } from '@/components/ui'
import { getChurches, getDioceses } from '@/lib/data'
import { countryPath, parishItem } from '@/lib/directory'
import { CONTINENTS } from '@/lib/geo'

export const metadata: Metadata = {
  title: 'Catholic Parish Finder: Find a Catholic Church and Mass Times',
  description: 'Find a Catholic parish near you: search by parish name or town, or browse by country, ecclesiastical province, archdiocese and diocese, with addresses, Mass times and directions.',
  alternates: { canonical: '/churches' },
}

export default function Page() {
  return <Suspense fallback={<div className="h-96" />}><Content /></Suspense>
}

async function Content() {
  await connection()
  const [dioceses, churches] = await Promise.all([getDioceses(), getChurches()])
  const byId = new Map(dioceses.map((d) => [d.id, d]))
  const items = churches.filter((c) => c.diocese_id && byId.has(c.diocese_id)).map((c) => parishItem(c, byId.get(c.diocese_id!)!))
  const countries = new Map<string, { continent: string; dioceses: number; parishes: number }>()
  for (const d of dioceses) {
    const x = countries.get(d.country) ?? { continent: d.continent, dioceses: 0, parishes: 0 }
    x.dioceses++
    countries.set(d.country, x)
  }
  for (const c of churches) { const d = c.diocese_id ? byId.get(c.diocese_id) : null; if (d) countries.get(d.country)!.parishes++ }
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-6 pb-[72px] pt-10">
      <div className="text-center">
        <Eyebrow>Parish Finder</Eyebrow>
        <H1 className="mt-2">Find a Catholic Parish</H1>
        <p className="mx-auto mt-3 max-w-xl text-muted">Search by parish name, town or area, or find the parishes nearest to you. Then see Mass times, the address and directions.</p>
      </div>
      <ParishList items={items} />
      <section className="flex flex-col gap-5">
        <h2 className="m-0 font-serif text-[30px] font-semibold">Browse by country</h2>
        {CONTINENTS.filter((k) => [...countries.values()].some((x) => x.continent === k)).map((k) => (
          <div key={k} className="flex flex-col gap-2.5">
            <h3 className="m-0 text-lg font-semibold text-muted">{k}</h3>
            <ul className="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
              {[...countries.entries()].filter(([, x]) => x.continent === k).sort(([a], [b]) => a.localeCompare(b)).map(([name, x]) => (
                <li key={name}><Link href={countryPath(name)} className="flex flex-col rounded-xl border border-line bg-surface px-4 py-3 text-ink no-underline hover:border-accent">
                  <strong className="text-[18px]">{name}</strong>
                  <span className="text-[14px] text-muted">{x.dioceses} dioceses · {x.parishes ? `${x.parishes} parishes listed` : 'add the first parish'}</span>
                </Link></li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <AddParishBox href="/churches/add" />
    </div>
  )
}
