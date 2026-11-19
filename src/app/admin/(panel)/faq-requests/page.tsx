import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { answerSubmission, deleteSubmission, setSubmissionStatus } from '../../actions'
import { ConfirmButton } from '@/components/admin/confirm-button'

export default async function Page(props: PageProps<'/admin/faq-requests'>) {
  const { db } = await requireAdmin()
  const sp = await props.searchParams
  const show = sp.show === 'all' ? 'all' : 'new'
  let q = db.from('faq_submissions').select('*').order('created_at', { ascending: false }).limit(300)
  if (show === 'new') q = q.eq('status', 'new')
  const { data: rows, error } = await q
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 font-serif text-[38px] font-semibold">Asked Questions</h1>
        <div className="flex gap-2 text-sm">
          <Link href="/admin/faq-requests" className={`rounded-md px-3 py-1.5 font-semibold no-underline ${show === 'new' ? 'bg-accent text-accent-ink' : 'border border-field text-ink'}`}>New</Link>
          <Link href="/admin/faq-requests?show=all" className={`rounded-md px-3 py-1.5 font-semibold no-underline ${show === 'all' ? 'bg-accent text-accent-ink' : 'border border-field text-ink'}`}>All</Link>
        </div>
      </div>
      <p className="m-0 text-muted">Questions visitors sent from the Questions &amp; Answers page. <strong>Answer</strong> opens a new answer with the question filled in; once you save it, it appears on the website.</p>
      {error && <p className="m-0 rounded-lg bg-[#fbe7dc] p-3 text-sm text-[#9a3412]">Run database update 0017 in Supabase to receive questions.</p>}
      {(rows ?? []).length === 0 && !error && <p className="rounded-2xl border border-line bg-surface p-8 text-center text-muted">No new questions.</p>}
      {(rows ?? []).map((r) => (
        <article key={r.id} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
            <span>{[r.name, r.country].filter(Boolean).join(' · ') || 'Anonymous'}</span>
            <span>{new Date(r.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} · {r.status}</span>
          </div>
          <p className="m-0 text-lg font-semibold">{r.question}</p>
          <div className="flex flex-wrap gap-3 pt-1 text-sm">
            <form action={answerSubmission.bind(null, r.id, r.question)}><button className="rounded-md bg-accent px-4 py-1.5 font-semibold text-accent-ink">Answer</button></form>
            {r.status !== 'ignored'
              ? <form action={setSubmissionStatus.bind(null, r.id, 'ignored')}><button className="px-2 py-1.5 font-semibold text-muted">Ignore</button></form>
              : <form action={setSubmissionStatus.bind(null, r.id, 'new')}><button className="px-2 py-1.5 font-semibold text-muted">Move back to new</button></form>}
            <form action={deleteSubmission.bind(null, r.id)}><ConfirmButton message="Delete this question?" className="px-2 py-1.5 font-semibold text-[#b42318]">Delete</ConfirmButton></form>
          </div>
        </article>
      ))}
    </div>
  )
}
