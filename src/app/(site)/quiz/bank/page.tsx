import type { Metadata } from 'next'
import Link from 'next/link'
import { QUIZ_TOPICS } from '@/lib/quiz-topics'
import { QuizBank } from '@/components/quiz-bank'
import { Eyebrow, H1 } from '@/components/ui'
import { getQuizBank } from '@/lib/faith'
import { getSettings } from '@/lib/data'
import { StayConnected } from '@/components/whatsapp-join'

export const metadata: Metadata = {
  title: 'Catholic Quiz Questions and Answers A–Z',
  description: 'Hundreds of Catholic quiz questions from A to Z, on the Bible, the sacraments, the saints and Church history, with answers, explanations and sources.',
  alternates: { canonical: '/quiz/bank' },
}

export default async function Page() {
  const [items, s] = await Promise.all([getQuizBank(), getSettings()])
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-7 px-6 pb-[72px] pt-10">
      <div className="text-center">
        <Eyebrow>Catholic Quiz</Eyebrow>
        <H1 className="mt-2">Quiz questions A–Z</H1>
        <p className="mx-auto mt-3 max-w-xl text-muted">Search any question and reveal its answer, with an explanation and a source. Ready to test yourself? <Link href="/quiz">Play Quiz Time</Link>.</p>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-center font-serif text-[28px] font-semibold">Quiz questions and answers by topic</h2>
        <ul className="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
          {QUIZ_TOPICS.map((t) => <li key={t.slug}><Link href={`/quiz/topics/${t.slug}`} className="flex flex-col rounded-xl border border-line bg-surface px-4 py-3 text-ink no-underline hover:border-accent"><strong>{t.name} quiz</strong><span className="text-[14px] text-muted">Questions with answers</span></Link></li>)}
        </ul>
      </section>
      <QuizBank items={items} />
      <StayConnected s={{ whatsapp_channel_url: s.whatsapp_channel_url, youtube_url: s.youtube_url, facebook_url: s.facebook_url, x_url: s.x_url }} />
    </div>
  )
}
