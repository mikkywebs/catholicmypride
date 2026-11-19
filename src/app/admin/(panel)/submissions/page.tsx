import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { deleteArticle, openArticle, setArticleStatus } from '../../actions'
import { ConfirmButton } from '@/components/admin/confirm-button'

type Row = { id: string; title: string; body: string; sources: string | null; name: string; country: string; email: string; about_author: string | null; status: 'new' | 'approved' | 'declined'; post_id: string | null; created_at: string }
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

export default async function Page(props: PageProps<'/admin/submissions'>) {
  const { db } = await requireAdmin()
  const sp = await props.searchParams
  const show = sp.show === 'all' ? 'all' : 'new'
  let q = db.from('article_submissions').select('*').order('created_at', { ascending: false }).limit(200)
  if (show === 'new') q = q.eq('status', 'new')
  const { data, error } = await q
  const rows = (data ?? []) as Row[]
  const tab = (v: string, label: string) => (
    <Link href={v === 'new' ? '/admin/submissions' : '/admin/submissions?show=all'} className={`rounded-md px-3 py-1.5 font-semibold no-underline ${show === v ? 'bg-accent text-accent-ink' : 'border border-field text-ink'}`}>{label}</Link>
  )
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 font-serif text-[38px] font-semibold">Article Submissions</h1>
        <div className="flex gap-2 text-sm">{tab('new', 'New')}{tab('all', 'All')}</div>
      </div>
      <p className="m-0 text-muted">
        Articles readers sent from the <Link href="/write-for-us" target="_blank">Write for us</Link> page. Read each one, then choose:
        <strong> Review &amp; publish</strong> opens it as a draft in the blog editor (with the writer’s name and country), where you edit it, add an image and publish;
        <strong> Decline</strong> keeps it out. Use <strong>Email the writer</strong> to let them know either way.
      </p>
      {typeof sp.error === 'string' && <p className="m-0 rounded-lg bg-[#fdecea] p-3 text-sm text-[#8c1d18]">{sp.error}</p>}
      {error && <p className="m-0 rounded-lg bg-[#fbe7dc] p-3 text-sm text-[#9a3412]">Run database update 0023 in Supabase to receive articles.</p>}
      {rows.length === 0 && !error && <p className="rounded-2xl border border-line bg-surface p-8 text-center text-muted">No new articles.</p>}
      {rows.map((r) => {
        const subject = encodeURIComponent(`Your article “${r.title}” for Catholic My Pride`)
        return (
          <article key={r.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
              <span><strong className="text-ink">{r.name}</strong> · {r.country} · <a href={`mailto:${r.email}`}>{r.email}</a></span>
              <span>{new Date(r.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} · {words(r.body)} words · <strong className={r.status === 'new' ? 'text-accent' : ''}>{r.status}</strong></span>
            </div>
            <h2 className="m-0 font-serif text-[26px] font-semibold leading-tight">{r.title}</h2>
            {r.about_author && <p className="m-0 text-sm italic text-muted">About the writer: {r.about_author}</p>}
            <details className="rounded-xl border border-line bg-bg px-4 py-3">
              <summary className="cursor-pointer font-semibold">Read the article</summary>
              <div className="mt-3 whitespace-pre-wrap text-[16px] leading-relaxed">{r.body}</div>
              {r.sources && <div className="mt-4 border-t border-line pt-3 text-sm"><strong>Sources</strong><div className="whitespace-pre-wrap">{r.sources}</div></div>}
            </details>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
              <form action={openArticle.bind(null, r.id)}><button className="rounded-md bg-accent px-4 py-1.5 font-semibold text-accent-ink">{r.post_id ? 'Open the draft post' : 'Review & publish'}</button></form>
              {r.status === 'new' && <form action={setArticleStatus.bind(null, r.id, 'declined')}><button className="px-2 py-1.5 font-semibold text-muted">Decline</button></form>}
              {r.status === 'declined' && <form action={setArticleStatus.bind(null, r.id, 'new')}><button className="px-2 py-1.5 font-semibold text-muted">Move back to new</button></form>}
              <a href={`mailto:${r.email}?subject=${subject}`} className="px-2 py-1.5 font-semibold">Email the writer</a>
              <form action={deleteArticle.bind(null, r.id)}><ConfirmButton message="Delete this article for good?" className="px-2 py-1.5 font-semibold text-[#b42318]">Delete</ConfirmButton></form>
            </div>
          </article>
        )
      })}
    </div>
  )
}
