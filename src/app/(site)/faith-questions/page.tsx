import type { Metadata } from 'next'
import { FaqBrowser } from '@/components/faq-browser'
import { Eyebrow, H1 } from '@/components/ui'
import { JsonLd } from '@/components/article-bits'
import { getFaqs } from '@/lib/faith'
import { md } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Catholic Questions and Answers A–Z',
  description: 'Clear answers to common questions about the Catholic faith, from Angels to Zeal, with Catechism and Bible references. Search or ask your own question.',
  alternates: { canonical: '/faith-questions' },
}

export default async function Page() {
  const faqs = await getFaqs()
  const items = faqs.map((f) => ({ slug: f.slug, question: f.question, topic: f.topic, html: md(f.answer_md), sources: f.sources, text: f.answer_md.replace(/[#*_>[\]()]/g, ' ') }))
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-7 px-6 pb-[72px] pt-10">
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqs.slice(0, 200).map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer_md.replace(/[#*_>]/g, '') } })),
      }} />
      <div className="text-center">
        <Eyebrow>Learn the faith</Eyebrow>
        <H1 className="mt-2">Catholic Questions &amp; Answers</H1>
        <p className="mx-auto mt-3 max-w-xl text-muted">Short, clear answers from A to Z, with references to the Catechism of the Catholic Church (CCC) and the Bible.</p>
      </div>
      <FaqBrowser items={items} />
    </div>
  )
}
