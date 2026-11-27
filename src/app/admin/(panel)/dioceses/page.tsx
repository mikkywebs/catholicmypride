import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { deleteItem, seedDioceses } from '../../actions'
import { AutoSubmit } from '@/components/admin/auto-submit'
import { DIOCESE_KINDS, DIRECTORY_FACTS } from '@/lib/directory-data'
import { diocesePath, dioceseTitle } from '@/lib/directory'
import { allRows } from '@/lib/supabase/all-rows'
import { CONTINENTS, COUNTRY_CONTINENT } from '@/lib/geo'

type D = { id: string; name: string; kind: string; continent: string; country: string; province: string | null; address: string | null; cathedral?: string | null; featured_image?: string | null; deaneries: string[] | null }

const MISSING: Record<string, string> = { photo: 'No cathedral photo', cathedral: 'No cathedral name', address: 'No address', deaneries: 'No deaneries' }
const field = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 text-[15px]'
const KIND_ORDER: readonly string[] = DIOCESE_KINDS

/** Dioceses in the admin: country → province, with search, filters and the ready-made country lists. */
export default async function Page(props: PageProps<'/admin/dioceses'>) {
  const { db } = await requireAdmin()
  const sp = await props.searchParams
  const str = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string).trim() : '')
  const q = str('q'), missing = MISSING[str('missing')] ? str('missing') : ''

  const { data } = await allRows((a, b) => db.from('dioceses').select('*').order('name').order('id').range(a, b))
  const all = (data ?? []) as D[]
  const { data: ch } = await allRows((a, b) => db.from('churches').select('diocese_id').order('id').range(a, b))
  const parishes = new Map<string, number>()
  for (const r of ch ?? []) if (r.diocese_id) parishes.set(r.diocese_id as string, (parishes.get(r.diocese_id as string) ?? 0) + 1)

  // Continent › country › province. A country's continent comes from its dioceses (or the country list).
  const continentOf = (c: string) => all.find((d) => d.country === c)?.continent || COUNTRY_CONTINENT[c] || 'Other'
  const allCountries = [...new Set(all.map((d) => d.country))].sort()
  const conts = CONTINENTS.filter((k) => allCountries.some((c) => continentOf(c) === k))
  const reqCountry = allCountries.includes(str('country')) ? str('country') : ''
  const continent = (conts as readonly string[]).includes(str('continent')) ? str('continent') : reqCountry ? continentOf(reqCountry) : ''
  const countries = allCountries.filter((c) => !continent || continentOf(c) === continent)
  const country = countries.includes(reqCountry) ? reqCountry : ''
  const provinces = [...new Set(all.filter((d) => d.country === country).map((d) => d.province || ''))].sort()
  const province = country && provinces.includes(str('province')) ? str('province') : ''
  const lacks = (d: D) => missing === 'photo' ? !d.featured_image : missing === 'cathedral' ? !d.cathedral : missing === 'address' ? !d.address : missing === 'deaneries' ? !(d.deaneries ?? []).length : true
  const listing = Boolean(country || q || missing)
  const list = all.filter((d) => (!continent || continentOf(d.country) === continent) && (!country || d.country === country) && (!province || (d.province || '') === province) && (!q || d.name.toLowerCase().includes(q.toLowerCase())) && lacks(d))
  const groups = [...list.reduce((m, d) => m.set(`${q || missing ? d.country + ' · ' : ''}${d.province ? `Province of ${d.province}` : 'Other jurisdictions'}`, [...(m.get(`${q || missing ? d.country + ' · ' : ''}${d.province ? `Province of ${d.province}` : 'Other jurisdictions'}`) ?? []), d]), new Map<string, D[]>())]
    .sort(([a], [b]) => (a.includes('Other') ? 1 : 0) - (b.includes('Other') ? 1 : 0) || a.localeCompare(b))
  const sortD = (a: D, b: D) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.name.localeCompare(b.name)
  const have = (c: string) => all.filter((d) => d.country === c).length
  const factsCount = (c: string) => Object.values(DIRECTORY_FACTS[c].provinces).flat().length + (DIRECTORY_FACTS[c].other?.length ?? 0)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 font-serif text-[34px] font-semibold sm:text-[38px]">Dioceses</h1>
          <p className="m-0 text-[15px] text-muted">{all.length} archdioceses, dioceses and other jurisdictions in {countries.length} countries</p>
        </div>
        <Link href="/admin/dioceses/new" className="rounded-md bg-accent px-5 py-2.5 font-semibold text-accent-ink no-underline">+ New diocese</Link>
      </div>
      {sp.saved && <p role="status" className="m-0 rounded-lg bg-[#e3f1e8] px-4 py-3 text-[#1f5c38]">Saved. The website has been updated.</p>}
      {sp.deleted && <p role="status" className="m-0 rounded-lg bg-[#eef0f3] px-4 py-3">Deleted.</p>}
      {sp.seeded !== undefined && <p role="status" className="m-0 rounded-lg bg-[#e3f1e8] px-4 py-3 text-[#1f5c38]">Added {String(sp.seeded)} {sp.seeded === '1' ? 'diocese' : 'dioceses'}{sp.updated && sp.updated !== '0' ? `, and filled the province on ${String(sp.updated)}` : ''}. Nothing you had entered was changed.{sp.failed && sp.failed !== '0' ? ` ${String(sp.failed)} could not be added${typeof sp.reason === 'string' ? ` because ${sp.reason}` : ''}. Run the latest database update in Supabase, then press the button again.` : ''}</p>}

      <details className="rounded-2xl border border-line bg-surface px-5 py-3">
        <summary className="cursor-pointer font-semibold">Add a country’s ready-made dioceses <span className="font-normal text-muted">({Object.keys(DIRECTORY_FACTS).length} countries available)</span></summary>
        <p className="m-0 mt-2 text-[14px] text-muted">Creates every archdiocese and diocese with its province, checked against GCatholic.org. Ones already entered are skipped, so it is safe to press again.</p>
        <div className="mt-3 flex flex-col gap-2">
          {CONTINENTS.map((k) => {
            const cs = Object.keys(DIRECTORY_FACTS).filter((c) => DIRECTORY_FACTS[c].continent === k).sort()
            if (!cs.length) return null
            const full = cs.filter((c) => have(c) >= factsCount(c)).length
            return (
              <details key={k} open={continent === k} className="rounded-xl border border-line px-4 py-2">
                <summary className="cursor-pointer font-semibold">{k} <span className="font-normal text-muted">· {cs.length} {cs.length === 1 ? 'country' : 'countries'} · {full === cs.length ? '✓ all added' : `${full} fully added`}</span></summary>
                <ul className="m-0 mt-2 grid list-none gap-2 p-0 pb-2 sm:grid-cols-2 lg:grid-cols-3">
                  {cs.map((c) => {
                    const done = have(c) >= factsCount(c)
                    return (
                      <li key={c}><form action={seedDioceses.bind(null, c)} className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2">
                        <span className="flex flex-col"><strong>{c}</strong><span className="text-[13px] text-muted">{done ? `✓ All ${factsCount(c)} added` : `${have(c)} of ${factsCount(c)} added`}</span></span>
                        <button className={`rounded-md px-3 py-1.5 text-sm font-semibold ${done ? 'border border-field text-muted' : 'bg-accent text-accent-ink'}`}>{done ? 'Check again' : 'Add'}</button>
                      </form></li>
                    )
                  })}
                </ul>
              </details>
            )
          })}
        </div>
      </details>

      <AutoSubmit className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-muted">Continent
          <select name="continent" defaultValue={continent} className={field}><option value="">All continents</option>{conts.map((k) => <option key={k}>{k}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-muted">Country
          <select key={continent} name="country" defaultValue={country} className={field}><option value="">{continent ? `All of ${continent}` : 'All countries'}</option>{countries.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-muted">Province
          <select name="province" defaultValue={province} className={field} disabled={!country}>
            <option value="">{country ? 'All provinces' : 'Choose a country first'}</option>{provinces.filter(Boolean).map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-muted">Show only
          <select name="missing" defaultValue={missing} className={field}><option value="">All</option>{Object.entries(MISSING).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-muted">Search by name
          <span className="flex gap-2"><input name="q" defaultValue={q} placeholder="e.g. Lagos" className={field} /><button className="rounded-lg border border-field bg-bg px-3 font-semibold">Go</button></span>
        </label>
      </AutoSubmit>
      {(listing || continent) && (
        <nav aria-label="You are here" className="-mt-2 flex flex-wrap items-center gap-x-2 text-[14px]">
          <Link href="/admin/dioceses">All continents</Link>
          {continent && <><span className="text-muted">›</span>{country || province ? <Link href={`/admin/dioceses?continent=${encodeURIComponent(continent)}`}>{continent}</Link> : <strong>{continent}</strong>}</>}
          {country && <><span className="text-muted">›</span>{province ? <Link href={`/admin/dioceses?country=${encodeURIComponent(country)}`}>{country}</Link> : <strong>{country}</strong>}</>}
          {province && <><span className="text-muted">›</span><strong>Province of {province}</strong></>}
          {(q || missing) && <Link href={`/admin/dioceses${country ? `?country=${encodeURIComponent(country)}` : continent ? `?continent=${encodeURIComponent(continent)}` : ''}`} className="ml-2 text-muted">✕ Clear search</Link>}
        </nav>
      )}

      {!listing ? (
        <section className="flex flex-col gap-6">
          {(continent ? [continent] : conts).map((k) => {
            const cs = countries.filter((c) => continentOf(c) === k).map((c) => ({ c, n: have(c), p: all.filter((d) => d.country === c).reduce((sum, d) => sum + (parishes.get(d.id) ?? 0), 0) })).sort((a, b) => b.p - a.p || a.c.localeCompare(b.c))
            const total = cs.reduce((sum, x) => sum + x.n, 0)
            return (
              <div key={k} className="flex flex-col gap-3">
                <h2 className="m-0 flex flex-wrap items-baseline gap-x-2 font-serif text-[24px] font-semibold">
                  {continent ? k : <Link href={`/admin/dioceses?continent=${encodeURIComponent(k)}`} className="text-ink no-underline hover:underline">{k}</Link>}
                  <span className="font-sans text-[14px] font-normal text-muted">{cs.length} {cs.length === 1 ? 'country' : 'countries'} · {total.toLocaleString('en-GB')} dioceses</span>
                </h2>
                <ul className="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
                  {cs.map(({ c, n, p }) => (
                    <li key={c}><Link href={`/admin/dioceses?country=${encodeURIComponent(c)}`} className="flex flex-col rounded-xl border border-line bg-surface px-4 py-3 text-ink no-underline hover:border-accent">
                      <strong>{c}</strong><span className="text-[13px] text-muted">{n} dioceses · {p} parishes</span>
                    </Link></li>
                  ))}
                </ul>
              </div>
            )
          })}
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <p className="m-0 text-[15px] text-muted">{list.length} {list.length === 1 ? 'result' : 'results'}{country ? ` in ${country}` : ''}{province ? ` · Province of ${province}` : ''}</p>
          {list.length === 0 && <p className="m-0 rounded-2xl border border-line bg-surface p-6 text-center text-muted">Nothing here.</p>}
          {groups.map(([g, ds]) => (
            <details key={g} open={Boolean(province || q || missing) || groups.length <= 2} className="group rounded-2xl border border-line bg-surface px-4 py-2 open:pb-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1">
                <span className="text-[15px] font-semibold">{g} <span className="font-normal text-muted">· {ds.length} · {ds.reduce((sum, d) => sum + (parishes.get(d.id) ?? 0), 0)} parishes</span></span>
                <span aria-hidden className="text-muted transition-transform group-open:rotate-180">▾</span>
              </summary>
              <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
                {ds.sort(sortD).map((d) => {
                  const n = parishes.get(d.id) ?? 0
                  const gaps = ['featured_image' in d && !d.featured_image && 'photo', 'cathedral' in d && !d.cathedral && 'cathedral', !d.address && 'address'].filter(Boolean)
                  return (
                    <li key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3">
                      <div className="flex min-w-0 flex-1 basis-64 flex-col">
                        <Link href={`/admin/dioceses/${d.id}`} className="font-semibold leading-snug text-ink">{dioceseTitle(d)}</Link>
                        <span className="text-[13px] text-muted">{[d.cathedral, `${(d.deaneries ?? []).length} deaneries`].filter(Boolean).join(' · ')}</span>
                        {gaps.length > 0 && <span className="text-[12px] text-[#9a3412]">Missing: {gaps.join(', ')}</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-[15px]">
                        <Link href={`/admin/churches?diocese=${d.id}`} className="rounded-full bg-sky px-3 py-1 text-[13px] font-semibold text-ink no-underline">{n} parishes</Link>
                        <Link href={`/admin/dioceses/${d.id}`} className="font-semibold">Edit</Link>
                        <a href={diocesePath(d)} target="_blank" rel="noreferrer">View</a>
                        <form action={deleteItem.bind(null, 'dioceses', d.id)}><button className="text-muted hover:text-[#b42318]">Delete</button></form>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </details>
          ))}
        </section>
      )}
    </div>
  )
}
