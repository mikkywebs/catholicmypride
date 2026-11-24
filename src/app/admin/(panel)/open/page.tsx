import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { CONTENT_TYPES } from '@/lib/content-types'
import { calendarSaint, calendarSaintRow } from '@/lib/saints-data'

/**
 * "Edit this page" from the public site: /admin/open?path=/saint-of-the-day/some-slug
 * finds the item and opens its editor. A calendar saint or feast not saved yet is saved first, so it can be edited.
 */
export default async function Page(props: PageProps<'/admin/open'>) {
  const sp = await props.searchParams
  const path = typeof sp.path === 'string' ? sp.path : ''
  const { db } = await requireAdmin()
  const t = Object.values(CONTENT_TYPES).find((x) => x.publicBase && x.publicField && path.startsWith(x.publicBase) && path.length > x.publicBase.length)
  if (!t) redirect('/admin')
  const value = decodeURIComponent(path.slice(t.publicBase!.length).split(/[/?#]/)[0])
  const { data: row } = await db.from(t.table).select('id').eq(t.publicField!, value).maybeSingle()
  if (row) redirect(`/admin/${t.key}/${row.id}`)
  if (t.key === 'saints') {
    // Its own feast day this year (e.g. 18 November), not a placeholder date.
    const cal = await calendarSaint(value, new Date().getUTCFullYear())
    const r = cal?.show_on ? await calendarSaintRow(value, cal.show_on) : null
    if (r) {
      const { data: saved } = await db.from('saints').insert({ ...r, status: 'published', published_at: new Date().toISOString(), auto_filled: true }).select('id').single()
      if (saved) redirect(`/admin/saints/${saved.id}`)
    }
  }
  redirect(`/admin/${t.key}?q=${encodeURIComponent(value.replace(/-/g, ' '))}`)
}
