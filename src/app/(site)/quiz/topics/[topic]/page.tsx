import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { JsonLd } from '@/components/article-bits'
import { Breadcrumb } from '@/components/ui'
import { StayConnected } from '@/components/whatsapp-join'
import { getSettings } from '@/lib/data'
import { breadcrumbLd } from '@/lib/directory'
import { getQuizBank } from '@/lib/faith'
import { SITE_URL } from '@/lib/format'
import { QUIZ_PER_PAGE, QUIZ_TOPICS, quizTopic, topicOf } from '@/lib/quiz-topics'

const pageOf = (v: string | string[] | undefined) => { const n = Number(typeof v === 'string' ? v : 1); return Number.isInteger(n) && n > 1 ? n : 1 }

export async function generateMetadata(props: PageProps<'/quiz/topics/[topic]'>): Promise<Metadata> {
  const [{ topic }, sp] = await Promise.all([props.params, props.searchParams])
  const t = quizTopic(topic)
  if (!t) return {}
  const page = pageOf(sp.page)
  const count = (await getQuizBank()).filter((q) => topicOf(q) === t.slug).length
  const title = `${t.title}${page > 1 ? ` (Part ${page})` : ''}`
  const description = `${count} ${t.description.charAt(0).toLowerCase()}${t.description.slice(1)}`
  return { title, description, alternates: { canonical: `/quiz/topics/${t.slug}${page > 1 ? `?page=${page}` : ''}` }, openGraph: { title, description } }
}

export default function Page(props: PageProps<'/quiz/topics/[topic]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content params={props.params} searchParams={props.searchParams} /></Suspense>
}

async function Content({ params, searchParams }: { params: PageProps<'/quiz/topics/[topic]'>['params']; searchParams: PageProps<'/quiz/topics/[topic]'>['searchParams'] }) {
  const [{ topic }, sp] = await Promise.all([params, searchParams])
  const t = quizTopic(topic)
  if (!t) notFound()
  const [all, s] = await Promise.all([getQuizBank(), getSettings()])
  const mine = all.filter((q) => topicOf(q) === t.slug)
  const pages = Math.max(1, Math.ceil(mine.length / QUIZ_PER_PAGE))
  const page = Math.min(pageOf(sp.page), pages)
  const start = (page - 1) * QUIZ_PER_PAGE
  const list = mine.slice(start, start + QUIZ_PER_PAGE)
  const href = (n: number) => `/quiz/topics/${t.slug}${n > 1 ? `?page=${n}` : ''}`
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-7 px-6 pb-[72px] pt-8">
      <JsonLd data={breadcrumbLd(SITE_URL, [{ name: 'Quiz Time', path: '/quiz' }, { name: `${t.name} quiz`, path: `/quiz/topics/${t.slug}` }])} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Quiz Time', href: '/quiz' }, { label: `${t.name} quiz` }]} />
      <div className="flex flex-col gap-3 text-center">
        <p className="eyebrow m-0">Catholic Quiz · {mine.length} questions</p>
        <h1 className="m-0 font-serif text-[36px] font-semibold leading-tight sm:text-[46px]">{t.title}</h1>
        <p className="mx-auto m-0 max-w-2xl text-muted">{t.intro} Think of your answer, then open it to check. Want points and a certificate? <Link href="/quiz">Play Quiz Time</Link>.</p>
      </div>
      <ol start={start + 1} className="m-0 flex flex-col gap-3 pl-0 [counter-reset:none]">
        {list.map((q, i) => {
          const opts = [['A', q.option_a], ['B', q.option_b], ['C', q.option_c], ['D', q.option_d]] as const
          const right = opts.find(([k]) => k === q.correct)
          return (
            <li key={q.id} className="flex list-none flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-4">
              <h2 className="m-0 text-[18px] font-semibold leading-snug"><span className="mr-2 text-muted">{start + i + 1}.</span>{q.question}</h2>
              <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">{opts.map(([k, v]) => <li key={k} className="rounded-lg border border-line px-3 py-2 text-[15px]"><strong className="mr-1.5">{k}.</strong>{v}</li>)}</ul>
              {/* The answer is in the page itself (folded), so Google can read it; visitors open it when ready. */}
              <details className="group rounded-lg bg-[#e3f1e8] px-3 py-2 text-[15px] text-[#1f5c38]">
                <summary className="cursor-pointer font-semibold">Show the answer</summary>
                <p className="m-0 mt-2"><strong>Answer: {q.correct}. {right?.[1]}</strong></p>
                {q.explanation && <p className="m-0 mt-1 text-body">{q.explanation}</p>}
                {q.source && <p className="m-0 mt-1 text-sm text-muted"><strong>Source:</strong> {q.source}</p>}
              </details>
            </li>
          )
        })}
      </ol>
      {pages > 1 && (
        <nav aria-label="Quiz pages" className="flex flex-wrap items-center justify-center gap-2">
          {page > 1 && <Link href={href(page - 1)} rel="prev" className="rounded-full border border-line bg-surface px-4 py-2 font-semibold text-ink no-underline">← Previous</Link>}
          {Array.from({ length: pages }, (_, k) => k + 1).map((n) => n === page
            ? <span key={n} aria-current="page" className="grid h-10 min-w-10 place-items-center rounded-full bg-accent px-3 font-semibold text-accent-ink">{n}</span>
            : <Link key={n} href={href(n)} className="grid h-10 min-w-10 place-items-center rounded-full border border-line bg-surface px-3 font-semibold text-ink no-underline">{n}</Link>)}
          {page < pages && <Link href={href(page + 1)} rel="next" className="rounded-full border border-line bg-surface px-4 py-2 font-semibold text-ink no-underline">Next →</Link>}
        </nav>
      )}
      <section className="flex flex-col gap-2.5">
        <h2 className="m-0 text-xl font-semibold">More Catholic quizzes</h2>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">{QUIZ_TOPICS.filter((x) => x.slug !== t.slug).map((x) => <li key={x.slug}><Link href={`/quiz/topics/${x.slug}`} className="inline-block rounded-full border border-line bg-surface px-4 py-2 text-ink no-underline hover:border-accent">{x.name} quiz</Link></li>)}</ul>
      </section>
      <StayConnected s={{ whatsapp_channel_url: s.whatsapp_channel_url, youtube_url: s.youtube_url, facebook_url: s.facebook_url, x_url: s.x_url }} />
    </div>
  )
}
