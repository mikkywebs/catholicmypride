import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { deleteRequest, moderateRequest } from '../../actions'

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'private', label: 'Private' },
  { key: 'approved', label: 'Published' },
  { key: 'rejected', label: 'Rejected' },
] as const

export default async function Page(props: PageProps<'/admin/prayer-requests'>) {
  const sp = await props.searchParams
  const tab = TABS.some((t) => t.key === sp.tab) ? (sp.tab as string) : 'pending'
  const { db } = await requireAdmin()
  let q = db.from('prayer_requests').select('*').order('created_at', { ascending: false }).limit(200)
  if (tab === 'private') q = q.eq('is_private', true).eq('status', 'pending')
  else q = q.eq('is_private', false).eq('status', tab)
  const { data: rows } = await q
  const btn = 'min-h-[42px] rounded-md px-4 font-semibold'
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 font-serif text-[38px] font-semibold">Prayer requests</h1>
        <a href="/prayer-requests#wall" target="_blank" className="font-semibold">View the Prayer Wall ↗</a>
      </div>
      <div role="tablist" className="flex flex-wrap gap-1.5 self-start rounded-xl border border-line bg-surface p-1">
        {TABS.map((t) => <Link key={t.key} href={`/admin/prayer-requests?tab=${t.key}`} role="tab" aria-selected={t.key === tab} className={`rounded-lg px-4 py-2 font-semibold no-underline ${t.key === tab ? 'bg-navy text-navy-ink' : 'text-ink'}`}>{t.label}</Link>)}
      </div>
      {(rows ?? []).length === 0 && <p className="rounded-2xl border border-line bg-surface p-8 text-center text-muted">Nothing here right now.</p>}
      {(rows ?? []).map((r) => (
        <article key={r.id} className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2.5"><strong>{r.name || 'Anonymous'}</strong><span className="text-muted">· {r.country || 'No country'} · {r.email || 'no email'}</span>{r.is_private && <span className="rounded-full bg-[#eef0f3] px-2.5 py-0.5 text-xs font-bold text-[#4a4f5c]">Private</span>}</div>
            <span className="text-sm text-muted">{new Date(r.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
          <p className="m-0 whitespace-pre-line text-[17px] leading-relaxed">{r.body}</p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            {!r.is_private && r.status === 'pending' && <form action={moderateRequest.bind(null, r.id, 'approved')}><button className={`${btn} bg-[#2e7d4f] text-white`}>Approve &amp; publish</button></form>}
            {r.is_private && <form action={moderateRequest.bind(null, r.id, 'prayed')}><button className={`${btn} bg-navy text-navy-ink`}>Mark as prayed for</button></form>}
            {r.status === 'pending' && <form action={moderateRequest.bind(null, r.id, 'rejected')}><button className={`${btn} border border-[#e9c3b0] bg-surface text-[#9a3412]`}>Reject</button></form>}
            {r.status === 'approved' && <form action={moderateRequest.bind(null, r.id, 'pending')}><button className={`${btn} border border-field bg-surface`}>Remove from wall</button></form>}
            {r.status === 'rejected' && <form action={deleteRequest.bind(null, r.id)}><button className={`${btn} border border-field bg-surface`}>Delete</button></form>}
          </div>
        </article>
      ))}
      <p className="m-0 text-sm text-muted">Private requests are never published. Requests containing links are blocked before they reach this list.</p>
    </div>
  )
}
