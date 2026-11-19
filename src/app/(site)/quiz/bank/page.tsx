import type { Metadata } from 'next'
import Link from 'next/link'
import { QuizBank } from '@/components/quiz-bank'
import { Eyebrow, H1 } from '@/components/ui'
import { getQuizBank } from '@/lib/faith'

export const metadata: Metadata = {
  title: 'Catholic Quiz Questions and Answers A–Z',
  description: 'Hundreds of Catholic quiz questions from A to Z, on the Bible, the sacraments, the saints and Church history, with answers, explanations and sources.',
  alternates: { canonical: '/quiz/bank' },
}

export default async function Page() {
  const items = await getQuizBank()
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-7 px-6 pb-[72px] pt-10">
      <div className="text-center">
        <Eyebrow>Catholic Quiz</Eyebrow>
        <H1 className="mt-2">Quiz questions A–Z</H1>
        <p className="mx-auto mt-3 max-w-xl text-muted">Search any question and reveal its answer, with an explanation and a source. Ready to test yourself? <Link href="/quiz">Play Quiz Time</Link>.</p>
      </div>
      <QuizBank items={items} />
    </div>
  )
}
