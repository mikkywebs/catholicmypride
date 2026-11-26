import type { Metadata } from 'next'
import Link from 'next/link'
import { QUIZ_TOPICS } from '@/lib/quiz-topics'
import { QuizGame } from '@/components/quiz-game'
import { StayConnected } from '@/components/whatsapp-join'
import { Eyebrow, H1 } from '@/components/ui'
import { getSettings } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Quiz Time: Test Your Catholic Faith',
  description: 'Play Quiz Time: 10 Catholic quiz questions, 30 seconds each. Score 8 to win, and win three times in a row to earn a certificate.',
  alternates: { canonical: '/quiz' },
}

export default async function Page() {
  const s = await getSettings()
  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-7 px-6 pb-[72px] pt-10">
      <div className="text-center">
        <Eyebrow>Catholic Quiz</Eyebrow>
        <H1 className="mt-2">Quiz Time</H1>
        <p className="mx-auto mt-3 max-w-xl text-muted">How well do you know your faith? Answer 10 questions, 30 seconds each. Get 8 right to win, and win 3 times in a row for a certificate.</p>
      </div>
      <QuizGame logoUrl={s.logo_url || '/logo.png'} />
      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-center font-serif text-[28px] font-semibold">Quiz questions and answers by topic</h2>
        <ul className="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
          {QUIZ_TOPICS.map((t) => <li key={t.slug}><Link href={`/quiz/topics/${t.slug}`} className="flex flex-col rounded-xl border border-line bg-surface px-4 py-3 text-ink no-underline hover:border-accent"><strong>{t.name} quiz</strong><span className="text-[14px] text-muted">Questions with answers</span></Link></li>)}
        </ul>
      </section>
      <div className="flex flex-wrap justify-center gap-4 text-[15px]">
        <Link href="/quiz/bank">Browse all quiz questions A–Z</Link>
        <Link href="/faith-questions">Catholic Questions &amp; Answers</Link>
      </div>
      <StayConnected s={{ whatsapp_channel_url: s.whatsapp_channel_url, youtube_url: s.youtube_url, facebook_url: s.facebook_url, x_url: s.x_url }} />
    </div>
  )
}
