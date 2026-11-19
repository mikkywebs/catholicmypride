import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleForm } from '@/components/article-form'
import { Eyebrow, H1 } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Write for Us: Share Your Catholic Article',
  description: 'Catholics from every country are welcome to write for Catholic My Pride. Read our guidelines and send your article for review.',
  alternates: { canonical: '/write-for-us' },
}

export default function Page() {
  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-8 px-6 pb-[72px] pt-10">
      <div className="text-center">
        <Eyebrow>Write for us</Eyebrow>
        <H1 className="mt-2">Share your faith with the world</H1>
        <p className="mx-auto mt-3 max-w-xl text-muted">Do you love the Catholic faith and enjoy writing? Catholics from every country are welcome to send an article for our <Link href="/blog">blog</Link>.</p>
      </div>
      <section className="prose-cmp rounded-2xl bg-sky px-6 py-5">
        <h2>Our guidelines</h2>
        <ul>
          <li><strong>Faithful to the Church.</strong> Articles must agree with the teaching of the Catholic Church. Scripture, the Catechism and the saints are wonderful sources.</li>
          <li><strong>Your own, original work.</strong> Not copied, not written by an AI tool, and not published anywhere else before.</li>
          <li><strong>Between 400 and 2,500 words.</strong> Clear, warm and helpful for ordinary Catholics.</li>
          <li><strong>No links.</strong> Give your sources as plain text, for example “Catechism of the Catholic Church, 1324” or “Luke 1:38”.</li>
          <li><strong>No images.</strong> We choose a suitable picture for every article we publish.</li>
          <li><strong>We review every article.</strong> We may edit it lightly, publish it, or decline it, and we will let you know by email.</li>
          <li><strong>Your byline.</strong> Published articles show your name and country, with a “Contributor” label.</li>
        </ul>
      </section>
      <ArticleForm />
    </div>
  )
}
