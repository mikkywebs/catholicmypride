import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { AddParishBox } from '@/components/add-parish-box'
import { ParishList } from '@/components/parish-list'
import { Eyebrow, H1 } from '@/components/ui'
import { getChurches, getDioceses } from '@/lib/data'
import { continentPath, isParish, parishItem } from '@/lib/directory'
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
  for (const c of churches) { const d = c.diocese_id ? byId.get(c.diocese_id) : null; if (d && isParish(c)) countries.get(d.country)!.parishes++ }
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-6 pb-[72px] pt-10">
      <div className="text-center">
        <Eyebrow>Parish Finder</Eyebrow>
        <H1 className="mt-2">Find a Catholic Parish</H1>
        <p className="mx-auto mt-3 max-w-xl text-muted">Search by parish name, town or area, or find the parishes nearest to you. Then see Mass times, the address and directions.</p>
      </div>
      <ParishList items={items} />
      <section className="flex flex-col gap-4">
        <h2 className="m-0 font-serif text-[30px] font-semibold">Browse by continent</h2>
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {CONTINENTS.map((k) => {
            const list = [...countries.values()].filter((x) => x.continent === k)
            const n = list.reduce((a, x) => a + x.parishes, 0)
            return (
              <li key={k}>
                {list.length ? (
                  <Link href={continentPath(k)} className="flex h-full flex-col gap-1 rounded-2xl border border-line bg-surface px-5 py-4 text-ink no-underline hover:border-accent">
                    <strong className="font-serif text-[26px] font-semibold">{k}</strong>
                    <span className="text-[14px] text-muted">{list.length} {list.length === 1 ? 'country' : 'countries'}{n ? ` · ${n.toLocaleString('en-GB')} parishes listed` : ''}</span>
                    <span className="mt-1 text-[14px] font-semibold text-accent">Browse →</span>
                  </Link>
                ) : (
                  <div aria-disabled className="flex h-full flex-col gap-1 rounded-2xl border border-dashed border-line px-5 py-4 text-muted">
                    <strong className="font-serif text-[26px] font-semibold">{k}</strong>
                    <span className="text-[14px]">Directory in progress</span>
                    <span className="mt-1 text-[13px]">We are adding dioceses and parishes. Check back soon.</span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>
      <AddParishBox href="/churches/add" />
    </div>
  )
}
