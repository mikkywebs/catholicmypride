import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { CONTENT_TYPES, publicUrl } from '@/lib/content-types'
import { deleteItem } from '../../actions'

export default async function Page(props: PageProps<'/admin/[type]'>) {
  const { type } = await props.params
  const sp = await props.searchParams
  const t = CONTENT_TYPES[type]
  if (!t) notFound()
  const { db } = await requireAdmin()
  const q = typeof sp.q === 'string' ? sp.q.trim() : ''
  let query = db.from(t.table).select('*').order(t.orderBy, { ascending: false }).limit(200)
  if (q) query = query.ilike(t.titleField === 'date' ? 'title' : t.titleField, `%${q}%`)
  const { data: rows } = await query
  const fmt = (v: unknown) => (v === true ? 'Yes' : v === false ? '—' : v == null || v === '' ? '—' : typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : String(v))
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 font-serif text-[38px] font-semibold">{t.plural}</h1>
        <Link href={`/admin/${t.key}/new`} className="rounded-md bg-accent px-5 py-2.5 font-semibold text-accent-ink no-underline">+ New {t.singular}</Link>
      </div>
      {sp.saved && <p role="status" className="m-0 rounded-lg bg-[#e3f1e8] px-4 py-3 text-[#1f5c38]">Saved. The website has been updated.</p>}
      {sp.deleted && <p role="status" className="m-0 rounded-lg bg-[#eef0f3] px-4 py-3">Deleted.</p>}
      <form className="flex gap-2"><input name="q" defaultValue={q} placeholder="Search…" className="min-h-11 flex-1 rounded-lg border border-field bg-surface px-3" /><button className="rounded-md border border-field bg-surface px-4 font-semibold">Search</button></form>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[640px] border-collapse text-[15px]">
          <thead><tr className="text-left text-[13px] uppercase tracking-wider text-muted">{t.listColumns.map((c) => <th key={c.field} className="border-b border-line px-4 py-3">{c.label}</th>)}<th className="border-b border-line px-4 py-3 text-right">Actions</th></tr></thead>
          <tbody>
            {(rows ?? []).length === 0 && <tr><td colSpan={t.listColumns.length + 1} className="px-4 py-8 text-center text-muted">Nothing here yet. Click “New {t.singular}” to add the first one.</td></tr>}
            {(rows ?? []).map((r: Record<string, unknown>) => (
              <tr key={String(r.id)} className="border-b border-line last:border-0">
                {t.listColumns.map((c, i) => (
                  <td key={c.field} className="px-4 py-3">
                    {i === 0 ? <Link href={`/admin/${t.key}/${r.id}`} className="font-semibold text-ink">{fmt(r[c.field])}</Link>
                      : c.field === 'status' ? <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${r.status === 'published' ? 'bg-[#e3f1e8] text-[#1f5c38]' : 'bg-[#eef0f3] text-[#4a4f5c]'}`}>{fmt(r[c.field])}</span>
                      : fmt(r[c.field])}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/${t.key}/${r.id}`} className="font-semibold">Edit</Link>
                    {publicUrl(t, r) && r.status === 'published' && <a href={publicUrl(t, r)!} target="_blank" rel="noreferrer">View</a>}
                    <form action={deleteItem.bind(null, t.key, String(r.id))}><button className="text-muted hover:text-[#b42318]">Delete</button></form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
