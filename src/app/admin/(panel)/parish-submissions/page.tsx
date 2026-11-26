import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { approveParish, declineParish } from '../../actions'
import { dioceseTitle } from '@/lib/directory'

type Row = {
  id: string; kind: 'new' | 'update'; church_id: string | null; diocese_id: string; deanery: string | null; name: string; address: string | null; map_url: string | null
  mass_times: string | null; phone: string | null; email: string | null; website: string | null; lat: number | null; lng: number | null
  submitter_name: string; submitter_contact: string; role: string | null; note: string | null; status: string; created_at: string
  diocese: { name: string; kind: string; country: string } | null
}

export default async function Page(props: PageProps<'/admin/parish-submissions'>) {
  const { db } = await requireAdmin()
  const sp = await props.searchParams
  const show = sp.show === 'all' ? 'all' : 'new'
  let q = db.from('church_submissions').select('*, diocese:dioceses(name, kind, country)').order('created_at', { ascending: false }).limit(200)
  if (show === 'new') q = q.eq('status', 'new')
  const { data, error } = await q
  const rows = (data ?? []) as Row[]
  const ids = rows.filter((r) => r.church_id).map((r) => r.church_id!)
  const { data: current } = ids.length ? await db.from('churches').select('id, name, address, mass_times, phone, email, website, deanery').in('id', ids) : { data: [] }
  const now = new Map((current ?? []).map((c) => [c.id as string, c as Record<string, string | null>]))
  const tab = (v: string, label: string) => <Link href={v === 'new' ? '/admin/parish-submissions' : '/admin/parish-submissions?show=all'} className={`rounded-md px-3 py-1.5 font-semibold no-underline ${show === v ? 'bg-accent text-accent-ink' : 'border border-field text-ink'}`}>{label}</Link>
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 font-serif text-[38px] font-semibold">Parish Submissions</h1>
        <div className="flex gap-2 text-sm">{tab('new', 'New')}{tab('all', 'All')}</div>
      </div>
      <p className="m-0 text-muted">New parishes and corrections sent by visitors from <Link href="/churches/add" target="_blank">Add your parish</Link>. Check each one (a quick call or message to the contact helps), then <strong>Approve</strong> to put it on the website, or <strong>Decline</strong>. For an update, the current details are shown underneath for comparison.</p>
      {sp.approved && <p role="status" className="m-0 rounded-lg bg-[#e3f1e8] px-4 py-3 text-[#1f5c38]">Approved. The parish page is updated.</p>}
      {typeof sp.error === 'string' && <p className="m-0 rounded-lg bg-[#fdecea] p-3 text-sm text-[#8c1d18]">{sp.error}</p>}
      {error && <p className="m-0 rounded-lg bg-[#fbe7dc] p-3 text-sm text-[#9a3412]">Run database update 0040 in Supabase to receive parishes.</p>}
      {rows.length === 0 && !error && <p className="rounded-2xl border border-line bg-surface p-8 text-center text-muted">Nothing new.</p>}
      {rows.map((r) => {
        const was = r.church_id ? now.get(r.church_id) : null
        const line = (k: string, v: string | null, old?: string | null) => v ? <div className="contents"><dt className="font-semibold text-muted">{k}</dt><dd className="m-0 whitespace-pre-wrap">{v}{was && old !== undefined && old !== v && <span className="block text-[13px] text-muted">Now: {old || '—'}</span>}</dd></div> : null
        return (
          <article key={r.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${r.kind === 'update' ? 'bg-sky text-ink' : 'bg-accent-soft text-eyebrow'}`}>{r.kind === 'update' ? 'UPDATE' : 'NEW PARISH'}</span>
              <span>{new Date(r.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} · <strong>{r.status}</strong></span>
            </div>
            <h2 className="m-0 font-serif text-[24px] font-semibold">{r.name}</h2>
            <p className="m-0 text-[15px] text-muted">{[r.deanery, r.diocese ? dioceseTitle(r.diocese) : null, r.diocese?.country].filter(Boolean).join(' · ')}</p>
            <dl className="m-0 grid gap-x-5 gap-y-1.5 text-[15px] sm:grid-cols-[auto_1fr]">
              {line('Address', r.address, was?.address)}
              {line('Mass times', r.mass_times, was?.mass_times)}
              {line('Phone', r.phone, was?.phone)}
              {line('Email', r.email, was?.email)}
              {line('Website', r.website, was?.website)}
              {line('Map link', r.map_url)}
              {line('Position', r.lat != null && r.lng != null ? `${r.lat}, ${r.lng}` : null)}
              {line('Sent by', `${r.submitter_name} (${r.role ?? 'Parishioner'}) · ${r.submitter_contact}`)}
              {line('Note', r.note)}
            </dl>
            {r.lat != null && r.lng != null && <a href={`https://www.google.com/maps?q=${r.lat},${r.lng}`} target="_blank" rel="noreferrer" className="text-[14px]">Check the position on Google Maps →</a>}
            {r.status === 'new' && (
              <div className="flex flex-wrap gap-3">
                <form action={approveParish.bind(null, r.id)}><button className="rounded-md bg-accent px-5 py-2 font-semibold text-accent-ink">Approve</button></form>
                <form action={declineParish.bind(null, r.id)}><button className="rounded-md border border-field bg-surface px-5 py-2 font-semibold text-muted">Decline</button></form>
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
