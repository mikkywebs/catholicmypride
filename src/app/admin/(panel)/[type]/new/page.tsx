import { notFound } from 'next/navigation'
import { ContentForm } from '@/components/admin/content-form'
import { requireAdmin } from '@/lib/admin'
import { CONTENT_TYPES } from '@/lib/content-types'
import { saveItem } from '../../../actions'

export default async function Page(props: PageProps<'/admin/[type]/new'>) {
  const { type } = await props.params
  const t = CONTENT_TYPES[type]
  if (!t) notFound()
  const { db } = await requireAdmin()
  const { data: cats } = await db.from('categories').select('*').order('name')
  const defaults: Record<string, unknown> = t.key === 'churches' ? { status: 'published', diocese_kind: 'Diocese' } : { status: 'draft' }
  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 font-serif text-[38px] font-semibold">New {t.singular}</h1>
      <ContentForm type={t} row={defaults} cats={cats ?? []} action={saveItem.bind(null, t.key, null)} />
    </div>
  )
}
