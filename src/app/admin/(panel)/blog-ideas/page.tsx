import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { ideasFor, type BlogIdea } from '@/lib/blog-ideas'
import { addDays, formatLong, todayISO } from '@/lib/liturgical'
import { createIdeaDraft, skipIdea, unskipIdea } from '../../actions'

const KIND: Record<BlogIdea['kind'], string> = { feast: 'Feast', saint: 'Saint', sunday: 'Sunday Gospel', novena: 'Novena', season: 'Season' }

export default async function Page(props: PageProps<'/admin/blog-ideas'>) {
  const { db } = await requireAdmin()
  const sp = await props.searchParams
  const today = todayISO()
  const since = addDays(today, -300)
  const [{ data: posts }, { data: skips }] = await Promise.all([
    db.from('posts').select('id, slug, status, title, created_at'),
    db.from('blog_idea_skips').select('idea, title, created_at').order('created_at', { ascending: false }),
  ])
  const bySlug = new Map((posts ?? []).map((p) => [p.slug as string, p as { id: string; status: string }]))
  // Left out, so the next best ones take their place: topics you drafted, ideas you skipped,
  // and saints or feasts a post from the last 10 months is already about.
  const exclude = new Set([...bySlug.keys(), ...(skips ?? []).map((x) => x.idea as string)])
  const titles = (posts ?? []).filter((p) => String(p.created_at).slice(0, 10) >= since).map((p) => p.title as string)
  const lists = await Promise.all([0, 1, 2, 3, 4, 5, 6].map((d) => ideasFor(addDays(today, d), 3, exclude, titles)))
  // Each topic is listed once only: on the first day it appears.
  const listed = new Set<string>()
  const [shown, ...later] = lists.map((list) => list.filter((i) => (listed.has(i.key) ? false : (listed.add(i.key), true))))
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="m-0 font-serif text-[38px] font-semibold">Blog Ideas</h1>
        <p className="m-0 mt-1 max-w-3xl text-muted">The three best topics from the Church calendar for what Catholics will be searching for in the next 3–7 days, timed so Google can find your post before people search. Once you create a draft or skip a topic, it leaves the list and the next best one appears. Saints and feasts you have already written about are left out. <strong>Create draft</strong> makes a draft blog post with the title, web address, SEO fields, keywords, tags and an outline filled in, for you to write, edit and publish.</p>
      </div>
      {typeof sp.error === 'string' && <p className="m-0 rounded-lg bg-[#fdecea] p-3 text-sm text-[#8c1d18]">{sp.error}</p>}
      <h2 className="m-0 text-xl">Today · {formatLong(today)}</h2>
      {shown.length === 0 && <p className="rounded-2xl border border-line bg-surface p-6 text-muted">No new calendar topic today. A good day to write about prayer, the sacraments or a question from Q&amp;A, or to finish a draft.</p>}
      {shown.map((i) => {
        const done = bySlug.get(i.slug)
        return (
          <article key={i.key} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="rounded-full bg-accent-soft px-3 py-1 font-bold text-eyebrow">{KIND[i.kind]} · {formatLong(i.eventDate)}</span>
              {done && <span className="font-semibold text-[#1f5c38]">✓ Draft already created ({done.status})</span>}
            </div>
            <h3 className="m-0 font-serif text-[26px] font-semibold leading-tight">{i.title}</h3>
            <p className="m-0 text-sm text-muted">{i.why}</p>
            <dl className="m-0 grid gap-x-5 gap-y-1.5 text-[15px] sm:grid-cols-[auto_1fr]">
              <dt className="font-semibold text-muted">SEO title</dt><dd className="m-0">{i.seoTitle} <span className="text-xs text-muted">({i.seoTitle.length}/60)</span></dd>
              <dt className="font-semibold text-muted">Meta description</dt><dd className="m-0">{i.seoDescription} <span className="text-xs text-muted">({i.seoDescription.length}/155)</span></dd>
              <dt className="font-semibold text-muted">Focus keyword</dt><dd className="m-0">{i.focusKeyword}</dd>
              <dt className="font-semibold text-muted">More keywords</dt><dd className="m-0">{i.keywords.join(' · ')}</dd>
              <dt className="font-semibold text-muted">Web address</dt><dd className="m-0">/blog/{i.slug}</dd>
              <dt className="font-semibold text-muted">Category · tags</dt><dd className="m-0">{i.category} · {i.tags.join(', ')}</dd>
              <dt className="font-semibold text-muted">Image</dt><dd className="m-0">{i.image} (alt: “{i.imageAlt}”)</dd>
            </dl>
            <details className="rounded-xl border border-line bg-bg px-4 py-3">
              <summary className="cursor-pointer font-semibold">Outline, FAQs and links</summary>
              <div className="mt-3 whitespace-pre-wrap text-[15px]">{i.outlineMd.replace(/\*\*/g, '').replace(/^## /gm, '■ ')}</div>
              <p className="mb-0 mt-3 text-[15px]"><strong>FAQs:</strong> {i.faqs.join(' · ')}</p>
              <p className="mb-0 mt-1 text-[15px]"><strong>Link to:</strong> {i.links.map((l) => l.label).join(' · ')}</p>
            </details>
            <div className="flex flex-wrap gap-3">
              {done
                ? <Link href={`/admin/posts/${done.id}`} className="rounded-md bg-accent px-5 py-2 font-semibold text-accent-ink no-underline">Open the draft</Link>
                : <form action={createIdeaDraft.bind(null, i)}><button className="rounded-md bg-accent px-5 py-2 font-semibold text-accent-ink">Create draft</button></form>}
              {!done && <form action={skipIdea.bind(null, i.key, i.title)}><button className="rounded-md border border-field bg-surface px-5 py-2 font-semibold text-muted hover:text-ink">Skip this idea</button></form>}
            </div>
          </article>
        )
      })}
      <h2 className="m-0 mt-2 text-xl">Coming days</h2>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {later.map((list, n) => (
          <li key={n} className="rounded-xl border border-line bg-surface px-4 py-3 text-[15px]">
            <strong>{formatLong(addDays(today, n + 1))}:</strong> {list.length ? list.map((i) => i.title).join(' · ') : 'no new topics'}
          </li>
        ))}
      </ul>
      {(skips ?? []).length > 0 && (
        <details className="rounded-xl border border-line bg-surface px-4 py-3">
          <summary className="cursor-pointer font-semibold">Skipped ideas ({(skips ?? []).length})</summary>
          <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
            {(skips ?? []).map((x) => (
              <li key={x.idea as string} className="flex flex-wrap items-center justify-between gap-2 text-[15px]">
                <span>{(x.title as string) || (x.idea as string)}</span>
                <form action={unskipIdea.bind(null, x.idea as string)}><button className="font-semibold text-accent">Bring back</button></form>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
