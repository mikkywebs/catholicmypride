import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { deleteItem, seedDioceses } from '../../actions'
import { AutoSubmit } from '@/components/admin/auto-submit'
import { DIRECTORY_FACTS } from '@/lib/directory-data'
import { diocesePath, dioceseTitle } from '@/lib/directory'

type D = { id: string; name: string; kind: string; continent: string; country: string; province: string | null; address: string | null; cathedral?: string | null; featured_image?: string | null; deaneries: string[] | null }

const MISSING: Record<string, string> = { photo: 'No cathedral photo', cathedral: 'No cathedral name', address: 'No address', deaneries: 'No deaneries' }
const field = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 text-[15px]'
const KIND_ORDER = ['Archdiocese', 'Diocese', 'Eparchy', 'Apostolic Vicariate', 'Prefecture', 'Military Ordinariate']

/** Dioceses in the admin: country → province, with search, filters and the ready-made country lists. */
export default async function Page(props: PageProps<'/admin/dioceses'>) {
  const { db } = await requireAdmin()
  const sp = await props.searchParams
  const str = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string).trim() : '')
  const q = str('q'), missing = MISSING[str('missing')] ? str('missing') : ''

  const { data } = await db.from('dioceses').select('*').order('name').limit(5000)
  const all = (data ?? []) as D[]
  const { data: ch } = await db.from('churches').select('diocese_id').limit(20000)
  const parishes = new Map<string, number>()
  for (const r of ch ?? []) if (r.diocese_id) parishes.set(r.diocese_id as string, (parishes.get(r.diocese_id as string) ?? 0) + 1)

  const countries = [...new Set(all.map((d) => d.country))].sort()
  const country = countries.includes(str('country')) ? str('country') : ''
  const provinces = [...new Set(all.filter((d) => d.country === country).map((d) => d.province || ''))].sort()
  const province = country && provinces.includes(str('province')) ? str('province') : ''
  const lacks = (d: D) => missing === 'photo' ? !d.featured_image : missing === 'cathedral' ? !d.cathedral : missing === 'address' ? !d.address : missing === 'deaneries' ? !(d.deaneries ?? []).length : true
  const listing = Boolean(country || q || missing)
  const list = all.filter((d) => (!country || d.country === country) && (!province || (d.province || '') === province) && (!q || d.name.toLowerCase().includes(q.toLowerCase())) && lacks(d))
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
      {sp.seeded !== undefined && <p role="status" className="m-0 rounded-lg bg-[#e3f1e8] px-4 py-3 text-[#1f5c38]">Added {String(sp.seeded)} {sp.seeded === '1' ? 'diocese' : 'dioceses'}{sp.updated && sp.updated !== '0' ? `, and filled the province on ${String(sp.updated)}` : ''}. Nothing you had entered was changed.{sp.failed && sp.failed !== '0' ? ` ${String(sp.failed)} could not be added; run the latest database update and try again.` : ''}</p>}

      <details className="rounded-2xl border border-line bg-surface px-5 py-3">
        <summary className="cursor-pointer font-semibold">Add a country’s ready-made dioceses <span className="font-normal text-muted">({Object.keys(DIRECTORY_FACTS).length} countries available)</span></summary>
        <p className="m-0 mt-2 text-[14px] text-muted">Creates every archdiocese and diocese with its province, checked against GCatholic.org. Ones already entered are skipped, so it is safe to press again.</p>
        <ul className="m-0 mt-3 grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {Object.keys(DIRECTORY_FACTS).sort().map((c) => {
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

      <AutoSubmit className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-muted">Country
          <select name="country" defaultValue={country} className={field}><option value="">All countries</option>{countries.map((c) => <option key={c}>{c}</option>)}</select>
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
      {listing && <Link href="/admin/dioceses" className="-mt-2 self-start text-[14px]">✕ Clear filters</Link>}

      {!listing ? (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-lg font-semibold">Choose a country</h2>
          <ul className="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
            {countries.map((c) => ({ c, n: have(c), p: all.filter((d) => d.country === c).reduce((s, d) => s + (parishes.get(d.id) ?? 0), 0) })).sort((a, b) => b.p - a.p || a.c.localeCompare(b.c)).map(({ c, n, p }) => (
              <li key={c}><Link href={`/admin/dioceses?country=${encodeURIComponent(c)}`} className="flex flex-col rounded-xl border border-line bg-surface px-4 py-3 text-ink no-underline hover:border-accent">
                <strong>{c}</strong><span className="text-[13px] text-muted">{n} dioceses · {p} parishes</span>
              </Link></li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <p className="m-0 text-[15px] text-muted">{list.length} {list.length === 1 ? 'result' : 'results'}{country ? ` in ${country}` : ''}{province ? ` · Province of ${province}` : ''}</p>
          {list.length === 0 && <p className="m-0 rounded-2xl border border-line bg-surface p-6 text-center text-muted">Nothing here.</p>}
          {groups.map(([g, ds]) => (
            <div key={g} className="flex flex-col gap-2">
              <h3 className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-eyebrow">{g} <span className="font-normal normal-case tracking-normal text-muted">· {ds.length}</span></h3>
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
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
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
