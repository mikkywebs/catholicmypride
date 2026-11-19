import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { JsonLd } from '@/components/article-bits'
import { ShareBar } from '@/components/engage'
import { Breadcrumb, Prose } from '@/components/ui'
import { WhatsAppJoin } from '@/components/whatsapp-join'
import { getSettings } from '@/lib/data'
import { getFaq, getFaqs } from '@/lib/faith'
import { md } from '@/lib/format'

export async function generateStaticParams() {
  return (await getFaqs()).slice(0, 300).map((f) => ({ slug: f.slug }))
}

export async function generateMetadata({ params }: PageProps<'/faith-questions/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const f = await getFaq(slug)
  if (!f) return {}
  const title = f.seo_title || f.question
  const description = f.seo_description || f.answer_md.replace(/[#*_>\n]/g, ' ').slice(0, 155).trim() + '…'
  return { title, description, alternates: { canonical: `/faith-questions/${slug}` }, openGraph: { title, description } }
}

export default function Page(props: PageProps<'/faith-questions/[slug]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content params={props.params} /></Suspense>
}

async function Content({ params }: { params: PageProps<'/faith-questions/[slug]'>['params'] }) {
  const { slug } = await params
  const [f, all, s] = await Promise.all([getFaq(slug), getFaqs(), getSettings()])
  if (!f) notFound()
  const related = all.filter((x) => x.slug !== f.slug && x.topic[0]?.toUpperCase() === f.topic[0]?.toUpperCase()).slice(0, 6)
  return (
    <div className="mx-auto flex max-w-[780px] flex-col gap-6 px-6 pb-[72px] pt-8">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'QAPage', mainEntity: { '@type': 'Question', name: f.question, answerCount: 1, acceptedAnswer: { '@type': 'Answer', text: f.answer_md.replace(/[#*_>]/g, '') } } }} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Questions & Answers', href: '/faith-questions' }, { label: f.topic }]} />
      <div className="flex flex-col gap-3">
        <p className="eyebrow m-0">{f.topic}</p>
        <h1 className="m-0 font-serif text-[38px] font-semibold leading-[1.12] sm:text-[46px]">{f.question}</h1>
      </div>
      <Prose html={md(f.answer_md)} />
      {f.sources && <p className="m-0 rounded-xl bg-sky px-5 py-3.5 text-[15px]"><strong>Sources:</strong> {f.sources}</p>}
      <ShareBar title={f.question} />
      <WhatsAppJoin url={s.whatsapp_channel_url} />
      {related.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 border-b border-line pb-2.5 font-serif text-[28px] font-semibold">More questions</h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {related.map((r) => <li key={r.slug}><Link href={`/faith-questions/${r.slug}`} className="font-semibold">{r.question}</Link></li>)}
          </ul>
        </section>
      )}
      <Link href="/faith-questions#ask" className="self-start rounded-md border border-field bg-surface px-5 py-2.5 font-semibold text-ink no-underline">Ask your own question</Link>
    </div>
  )
}
