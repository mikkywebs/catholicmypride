import Link from 'next/link'
import { AddParishBox } from './add-parish-box'
import { JsonLd } from './article-bits'
import { ParishList } from './parish-list'
import { Breadcrumb } from './ui'
import { breadcrumbLd, continentPath, countryPath, parishItem } from '@/lib/directory'
import { SITE_URL } from '@/lib/format'
import type { Church, Diocese } from '@/lib/types'

/** /churches/africa: the countries of one continent that have directory data. */
export function ContinentView({ continent, dioceses, churches }: { continent: string; dioceses: Diocese[]; churches: Church[] }) {
  const mine = dioceses.filter((d) => d.continent === continent)
  const byId = new Map(mine.map((d) => [d.id, d]))
  const parishes = churches.filter((c) => c.diocese_id && byId.has(c.diocese_id))
  const countries = [...new Set(mine.map((d) => d.country))].map((name) => {
    const ids = new Set(mine.filter((d) => d.country === name).map((d) => d.id))
    return { name, dioceses: ids.size, parishes: parishes.filter((c) => ids.has(c.diocese_id!)).length }
  }).sort((a, b) => b.parishes - a.parishes || a.name.localeCompare(b.name))
  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-7 px-6 pb-[72px] pt-8">
      <JsonLd data={breadcrumbLd(SITE_URL, [{ name: 'Parish Directory', path: '/churches' }, { name: continent, path: continentPath(continent) }])} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Parish Directory', href: '/churches' }, { label: continent }]} />
      <div className="flex flex-col gap-2 text-center">
        <p className="eyebrow m-0">Catholic Parish Directory</p>
        <h1 className="m-0 font-serif text-[36px] font-semibold leading-tight sm:text-[46px]">Catholic Churches in {continent}</h1>
        <p className="mx-auto m-0 max-w-2xl text-muted">{countries.length} {countries.length === 1 ? 'country' : 'countries'} · {mine.length} dioceses{parishes.length ? ` · ${parishes.length} parishes listed so far` : ''}</p>
      </div>
      {parishes.length > 0 && <ParishList items={parishes.map((c) => parishItem(c, byId.get(c.diocese_id!)!))} placeholder={`Search parishes in ${continent} by name, town or area`} />}
      <section className="flex flex-col gap-3">
        <h2 className="m-0 font-serif text-[28px] font-semibold">Countries</h2>
        <ul className="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
          {countries.map((c) => (
            <li key={c.name}><Link href={countryPath(c.name)} className="flex flex-col rounded-xl border border-line bg-surface px-4 py-3 text-ink no-underline hover:border-accent">
              <strong className="text-[18px]">{c.name}</strong>
              <span className="text-[14px] text-muted">{c.dioceses} dioceses · {c.parishes ? `${c.parishes} parishes listed` : 'parishes being added'}</span>
            </Link></li>
          ))}
        </ul>
      </section>
      <AddParishBox href="/churches/add" />
    </div>
  )
}
