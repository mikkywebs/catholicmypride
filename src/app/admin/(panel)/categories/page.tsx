import Link from 'next/link'
import { AddCategory } from '@/components/admin/add-category'
import { requireAdmin } from '@/lib/admin'
import { addCategory, deleteCategory, renameCategory } from '../../actions'

const KINDS = [
  { key: 'blog', label: 'Blog', table: 'posts' },
  { key: 'song', label: 'Music', table: 'songs' },
  { key: 'book', label: 'Ebooks', table: 'books' },
  { key: 'prayer', label: 'Prayers', table: 'prayers' },
] as const

export default async function Page(props: PageProps<'/admin/categories'>) {
  const sp = await props.searchParams
  const kind = KINDS.find((k) => k.key === sp.kind) ?? KINDS[0]
  const { db } = await requireAdmin()
  const [{ data: cats }, { data: items }] = await Promise.all([
    db.from('categories').select('*').eq('kind', kind.key).order('name'),
    db.from(kind.table).select('category_id, status'),
  ])
  const count = (id: string) => (items ?? []).filter((i) => i.category_id === id && i.status === 'published').length
  const input = 'min-h-10 rounded-lg border border-field bg-surface px-3 text-[15px]'
  return (
    <div className="flex max-w-[900px] flex-col gap-5">
      <h1 className="m-0 font-serif text-[38px] font-semibold">Categories</h1>
      <div role="tablist" className="flex flex-wrap gap-1.5 self-start rounded-xl border border-line bg-surface p-1">
        {KINDS.map((k) => <Link key={k.key} href={`/admin/categories?kind=${k.key}`} role="tab" aria-selected={k.key === kind.key} className={`rounded-lg px-4 py-2 font-semibold no-underline ${k.key === kind.key ? 'bg-navy text-navy-ink' : 'text-ink'}`}>{k.label}</Link>)}
      </div>
      <AddCategory action={addCategory.bind(null, kind.key)} kindLabel={kind.label} />
      <div className="flex flex-col gap-3">
        {(cats ?? []).length === 0 && <p className="rounded-2xl border border-line bg-surface p-6 text-center text-muted">No {kind.label.toLowerCase()} categories yet.</p>}
        {(cats ?? []).map((c) => {
          const n = count(c.id)
          return (
            <details key={c.id} className="rounded-2xl border border-line bg-surface">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4">
                <strong>{c.name}</strong>
                <span className="flex items-center gap-3 text-sm"><span>{n} published</span><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${n ? 'bg-[#e3f1e8] text-[#1f5c38]' : 'bg-[#eef0f3] text-[#4a4f5c]'}`}>{n ? 'Live' : 'Hidden'}</span></span>
              </summary>
              <div className="flex flex-col gap-3 border-t border-line px-5 py-4">
                <form action={renameCategory.bind(null, c.id)} className="flex flex-col gap-2.5">
                  <label className="flex flex-col gap-1 text-sm font-semibold">Name<input name="name" defaultValue={c.name} className={input} /></label>
                  <label className="flex flex-col gap-1 text-sm font-semibold">SEO title for the category page<input name="seo_title" defaultValue={c.seo_title ?? ''} className={input} /></label>
                  <label className="flex flex-col gap-1 text-sm font-semibold">Meta description<input name="seo_description" defaultValue={c.seo_description ?? ''} className={input} /></label>
                  <button className="self-start rounded-md bg-accent px-4 py-2 font-semibold text-accent-ink">Save</button>
                </form>
                <form action={deleteCategory.bind(null, c.id)}><button className="text-sm text-muted hover:text-[#b42318]">Delete category (items keep their content, just lose the category)</button></form>
              </div>
            </details>
          )
        })}
      </div>
      <p className="m-0 text-sm text-muted">A category with no published items stays hidden on the website.</p>
    </div>
  )
}
