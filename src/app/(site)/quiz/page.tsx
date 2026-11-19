import type { Metadata } from 'next'
import Link from 'next/link'
import { QuizGame } from '@/components/quiz-game'
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
      <div className="flex flex-wrap justify-center gap-4 text-[15px]">
        <Link href="/quiz/bank">Browse all quiz questions A–Z</Link>
        <Link href="/faith-questions">Catholic Questions &amp; Answers</Link>
      </div>
    </div>
  )
}
