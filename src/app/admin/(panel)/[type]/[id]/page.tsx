import { notFound } from 'next/navigation'
import { ContentForm } from '@/components/admin/content-form'
import { requireAdmin } from '@/lib/admin'
import { CONTENT_TYPES, publicUrl } from '@/lib/content-types'
import { saveItem } from '../../../actions'

export default async function Page(props: PageProps<'/admin/[type]/[id]'>) {
  const { type, id } = await props.params
  const t = CONTENT_TYPES[type]
  if (!t || !/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const { db } = await requireAdmin()
  const [{ data: row }, { data: cats }, days] = await Promise.all([
    db.from(t.table).select('*').eq('id', id).maybeSingle(),
    db.from('categories').select('*').order('name'),
    t.key === 'novenas' ? db.from('novena_days').select('*').eq('novena_id', id) : Promise.resolve({ data: [] }),
  ])
  if (!row) notFound()
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 font-serif text-[38px] font-semibold">Edit {t.singular}</h1>
        {publicUrl(t, row) && row.status === 'published' && <a href={publicUrl(t, row)!} target="_blank" rel="noreferrer" className="font-semibold">View on site ↗</a>}
      </div>
      <ContentForm type={t} row={row} cats={cats ?? []} action={saveItem.bind(null, t.key, id)} novenaDays={days.data ?? []} />
    </div>
  )
}
