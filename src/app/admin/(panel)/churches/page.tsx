import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { deleteItem } from '../../actions'
import { AutoSubmit } from '@/components/admin/auto-submit'
import { dioceseTitle, parishPath } from '@/lib/directory'

type D = { id: string; name: string; kind: string; country: string; province: string | null; deaneries: string[] | null }
type C = { id: string; name: string; address: string | null; deanery: string | null; mass_times: string | null; featured_image?: string | null; slug: string | null; status: string; diocese_id: string | null }

const PER = 50
const MISSING: Record<string, [string, string]> = { mass: ['No Mass times', 'mass_times'], photo: ['No photo', 'featured_image'], address: ['No address', 'address'] }
const field = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 text-[15px]'

/** Parishes in the admin: country → diocese → deanery, with search and “missing” filters. */
export default async function Page(props: PageProps<'/admin/churches'>) {
  const { db } = await requireAdmin()
  const sp = await props.searchParams
  const str = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string).trim() : '')
  const q = str('q'), missing = MISSING[str('missing')] ? str('missing') : ''
  const page = Math.max(1, Math.floor(Number(sp.page) || 1))

  const [{ data: dioceses }, { data: all }] = await Promise.all([
    db.from('dioceses').select('id, name, kind, country, province, deaneries').order('name').limit(5000),
    db.from('churches').select('diocese_id').limit(20000),
  ])
  const ds = (dioceses ?? []) as D[]
  const byId = new Map(ds.map((d) => [d.id, d]))
  const count = new Map<string, number>()
  for (const r of all ?? []) if (r.diocese_id) count.set(r.diocese_id as string, (count.get(r.diocese_id as string) ?? 0) + 1)
  const diocese = byId.get(str('diocese')) ?? null
  const country = diocese?.country ?? (str('country') || '')
  const deanery = diocese ? str('deanery') : ''
  const countries = [...new Set(ds.map((d) => d.country))].sort()
  const inCountry = ds.filter((d) => d.country === country)
  const totalIn = (list: D[]) => list.reduce((n, d) => n + (count.get(d.id) ?? 0), 0)

  // The parish list appears once a diocese is chosen, or when searching / filtering.
  const listing = Boolean(diocese || q || missing)
  let rows: C[] = [], total = 0, error: string | null = null
  if (listing) {
    const cols = 'id, name, address, deanery, mass_times, slug, status, diocese_id'
    const build = (extra: string) => {
      let r = db.from('churches').select(cols + extra, { count: 'exact' }).order('deanery', { nullsFirst: false }).order('name').range((page - 1) * PER, page * PER - 1)
      if (diocese) r = r.eq('diocese_id', diocese.id)
      else if (country) r = r.in('diocese_id', inCountry.map((d) => d.id))
      if (deanery) r = deanery === '_none' ? r.is('deanery', null) : r.eq('deanery', deanery)
      if (q) r = r.ilike('name', `%${q}%`)
      if (missing) r = r.or(`${MISSING[missing][1]}.is.null,${MISSING[missing][1]}.eq.`)
      return r
    }
    let res = await build(', featured_image')
    if (res.error && missing !== 'photo') res = await build('')
    rows = (res.data ?? []) as unknown as C[]
    total = res.count ?? 0
    error = res.error?.message ?? null
  }
  const pages = Math.max(1, Math.ceil(total / PER))
  const link = (o: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries({ country, diocese: diocese?.id, deanery, q, missing, ...o })) if (v !== undefined && v !== '' && v !== null) p.set(k, String(v))
    return `/admin/churches${p.toString() ? `?${p}` : ''}`
  }
  const deaneryNames = diocese ? [...new Set([...(diocese.deaneries ?? [])])].sort() : []

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 font-serif text-[34px] font-semibold sm:text-[38px]">Parishes</h1>
          <p className="m-0 text-[15px] text-muted">{(all ?? []).length.toLocaleString('en-GB')} parishes in {countries.length} countries · <Link href="/admin/parish-submissions">Parish Submissions</Link></p>
        </div>
        <Link href="/admin/churches/new" className="rounded-md bg-accent px-5 py-2.5 font-semibold text-accent-ink no-underline">+ New parish</Link>
      </div>
      {sp.saved && <p role="status" className="m-0 rounded-lg bg-[#e3f1e8] px-4 py-3 text-[#1f5c38]">Saved. The website has been updated.</p>}
      {sp.deleted && <p role="status" className="m-0 rounded-lg bg-[#eef0f3] px-4 py-3">Deleted.</p>}

      {/* Filters: one row on a computer, stacked on a phone. Choosing a dropdown applies it. */}
      <AutoSubmit className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-muted">Country
          <select name="country" defaultValue={country} className={field}><option value="">All countries</option>{countries.map((c) => <option key={c}>{c}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-muted">Archdiocese / diocese
          <select name="diocese" defaultValue={diocese?.id ?? ''} className={field} disabled={!country}>
            <option value="">{country ? 'All dioceses' : 'Choose a country first'}</option>
            {inCountry.sort((a, b) => (a.kind === 'Archdiocese' ? -1 : 0) - (b.kind === 'Archdiocese' ? -1 : 0) || a.name.localeCompare(b.name)).map((d) => <option key={d.id} value={d.id}>{dioceseTitle(d)} ({count.get(d.id) ?? 0})</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-muted">Deanery
          <select name="deanery" defaultValue={deanery} className={field} disabled={!diocese}>
            <option value="">{diocese ? 'All deaneries' : 'Choose a diocese first'}</option>
            {deaneryNames.map((n) => <option key={n}>{n}</option>)}
            {diocese && <option value="_none">No deanery set</option>}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-muted">Show only
          <select name="missing" defaultValue={missing} className={field}><option value="">All parishes</option>{Object.entries(MISSING).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1 text-[13px] font-semibold text-muted">Search by name
          <span className="flex gap-2"><input name="q" defaultValue={q} placeholder="e.g. St Leo" className={field} /><button className="rounded-lg border border-field bg-bg px-3 font-semibold">Go</button></span>
        </label>
      </AutoSubmit>
      {(country || q || missing) && <Link href="/admin/churches" className="-mt-2 self-start text-[14px]">✕ Clear filters</Link>}

      {!listing && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 text-lg font-semibold">{country ? `Choose a diocese in ${country}` : 'Choose a country'}</h2>
          <ul className="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
            {(country
              ? inCountry.map((d) => ({ key: d.id, title: dioceseTitle(d), sub: d.province ? `Province of ${d.province}` : '', n: count.get(d.id) ?? 0, href: link({ diocese: d.id, page: undefined }) }))
              : countries.map((c) => { const list = ds.filter((d) => d.country === c); return { key: c, title: c, sub: `${list.length} dioceses`, n: totalIn(list), href: link({ country: c, diocese: undefined, page: undefined }) } })
            ).sort((a, b) => b.n - a.n || a.title.localeCompare(b.title)).map((x) => (
              <li key={x.key}><Link href={x.href} className="flex flex-col rounded-xl border border-line bg-surface px-4 py-3 text-ink no-underline hover:border-accent">
                <strong className="leading-snug">{x.title}</strong>
                <span className="text-[13px] text-muted">{[x.sub, `${x.n} parishes`].filter(Boolean).join(' · ')}</span>
              </Link></li>
            ))}
          </ul>
        </section>
      )}

      {listing && (
        <section className="flex flex-col gap-3">
          <p className="m-0 text-[15px] text-muted">
            {total.toLocaleString('en-GB')} {total === 1 ? 'parish' : 'parishes'}{diocese ? ` in the ${dioceseTitle(diocese)}` : country ? ` in ${country}` : ''}{deanery && deanery !== '_none' ? ` · ${deanery}` : ''}
            {diocese && <> · <Link href={`/admin/dioceses/${diocese.id}`}>Edit the diocese</Link></>}
          </p>
          {error && <p className="m-0 rounded-lg bg-[#fdecea] p-3 text-sm text-[#8c1d18]">{error}</p>}
          {rows.length === 0 && !error && <p className="m-0 rounded-2xl border border-line bg-surface p-6 text-center text-muted">No parishes here yet.</p>}
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {rows.map((c, i) => {
              const d = c.diocese_id ? byId.get(c.diocese_id) : null
              const head = diocese && !deanery && c.deanery !== rows[i - 1]?.deanery
              const gaps = [!c.mass_times && 'Mass times', 'featured_image' in c && !c.featured_image && 'photo', !c.address && 'address'].filter(Boolean)
              return (
                <li key={c.id} className="contents">
                  {head && <h3 className="m-0 mt-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-eyebrow">{c.deanery || 'No deanery set'}</h3>}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3">
                    <div className="flex min-w-0 flex-1 basis-64 flex-col">
                      <Link href={`/admin/churches/${c.id}`} className="font-semibold leading-snug text-ink">{c.name}</Link>
                      <span className="text-[13px] text-muted">{[!diocese && d ? dioceseTitle(d) : null, !diocese || deanery ? c.deanery : null, c.address].filter(Boolean).join(' · ') || '—'}</span>
                      {gaps.length > 0 && <span className="text-[12px] text-[#9a3412]">Missing: {gaps.join(', ')}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-[15px]">
                      {c.status !== 'published' && <span className="rounded-full bg-[#eef0f3] px-2 py-0.5 text-xs font-bold">draft</span>}
                      <Link href={`/admin/churches/${c.id}`} className="font-semibold">Edit</Link>
                      {d && c.status === 'published' && <a href={parishPath(c, d)} target="_blank" rel="noreferrer">View</a>}
                      <form action={deleteItem.bind(null, 'churches', c.id)}><button className="text-muted hover:text-[#b42318]">Delete</button></form>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
          {pages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-[15px]">
              <span className="text-muted">Page {page} of {pages}</span>
              <span className="flex gap-2">
                {page > 1 && <Link href={link({ page: page - 1 })} className="rounded-md border border-field bg-surface px-4 py-2 font-semibold no-underline">← Previous</Link>}
                {page < pages && <Link href={link({ page: page + 1 })} className="rounded-md border border-field bg-surface px-4 py-2 font-semibold no-underline">Next →</Link>}
              </span>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
