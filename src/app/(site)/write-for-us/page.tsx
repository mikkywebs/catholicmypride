import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/article-bits'
import { ArticleForm } from '@/components/article-form'
import { Breadcrumb, Eyebrow } from '@/components/ui'
import { getContributorPosts } from '@/lib/data'
import { breadcrumbLd } from '@/lib/directory'
import { SITE_URL } from '@/lib/format'

// Written for the words writers actually search: "Catholic write for us", "Catholic guest post",
// "submit a Catholic article", "Catholic blogs accepting submissions".
const TITLE = 'Write for Us: Submit Your Catholic Article or Guest Post'
const DESCRIPTION = 'Catholic writers from every country are welcome to submit an article or guest post to Catholic My Pride: saints, feasts, prayer, Scripture, the sacraments and Catholic life. Free to submit; every article is reviewed.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['Catholic write for us', 'Catholic guest post', 'submit Catholic article', 'Catholic blogs accepting submissions', 'Catholic writers', 'write for a Catholic blog'],
  alternates: { canonical: '/write-for-us' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/write-for-us', type: 'website' },
}

const TOPICS: [string, string][] = [
  ['Saints and feasts', 'The life of a saint, or what a feast or season means and how to keep it.'],
  ['Prayer and devotions', 'The Rosary, novenas, chaplets, Eucharistic adoration, praying as a family.'],
  ['Scripture and the Mass', 'A reflection on a Sunday reading, or explaining a part of the Mass.'],
  ['The sacraments', 'Confession, the Eucharist, marriage, preparing children for First Holy Communion.'],
  ['Catholic life', 'Faith at work, at school and at home; raising Catholic children; serving in the parish.'],
  ['Testimonies', 'How you came to the faith, came back to it, or saw God at work in your life.'],
  ['The Church in your country', 'Pilgrimage sites, local saints and how Catholics celebrate where you live.'],
  ['Church history and teaching', 'A council, a Church Father, a document of the Church, explained simply.'],
]

const STEPS: [string, string][] = [
  ['Read the guidelines', 'They are short, and they save you time.'],
  ['Send your article', 'Use the form below: no account and no fee.'],
  ['We review it', 'We read every article and check it is faithful to the Church’s teaching.'],
  ['It is published', 'With your name, your country and a “Contributor” label, and we tell you by email.'],
]

const FAQ: [string, string][] = [
  ['Does it cost anything to submit an article?', 'No. Submitting and publishing an article on Catholic My Pride is free.'],
  ['Who can write for Catholic My Pride?', 'Any Catholic, from any country, who loves the faith and can write clearly for ordinary readers. You do not need to be a priest, religious or professional writer.'],
  ['How long should my article be?', 'Between 400 and 2,500 words.'],
  ['Can I send an article that is already on my blog or another website?', 'No. We only publish original work that has not appeared anywhere else, and that you wrote yourself rather than with an AI tool.'],
  ['Can I include links or pictures?', 'No links: give your sources as plain text, such as “Catechism of the Catholic Church, 1324”. No pictures either: we choose a suitable image for every article we publish.'],
  ['Will you edit my article?', 'We may edit it lightly for clarity and length. We will publish it, or let you know by email if we decline it.'],
  ['Will my name appear on the article?', 'Yes. Published articles show your name and country with a “Contributor” label.'],
]

export default async function Page() {
  const recent = await getContributorPosts(6)
  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-9 px-6 pb-[72px] pt-8">
      <JsonLd data={breadcrumbLd(SITE_URL, [{ name: 'Write for Us', path: '/write-for-us' }])} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: TITLE, description: DESCRIPTION, url: `${SITE_URL}/write-for-us`, isPartOf: { '@type': 'WebSite', name: 'Catholic My Pride', url: SITE_URL }, potentialAction: { '@type': 'Action', name: 'Submit a Catholic article', target: `${SITE_URL}/write-for-us#submit` } }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Write for Us' }]} />

      <header className="flex flex-col items-center gap-3 text-center">
        <Eyebrow>Write for us · Guest posts welcome</Eyebrow>
        <h1 className="m-0 font-serif text-[38px] font-semibold leading-tight sm:text-[48px]">Write for Us: Submit Your Catholic Article</h1>
        <p className="m-0 max-w-2xl text-[18px] text-muted">Do you love the Catholic faith and enjoy writing? Catholics from every country are welcome to send an article or guest post for the <Link href="/blog">Catholic My Pride blog</Link>. It is free, and every article is read by our team.</p>
        <a href="#submit" className="mt-1 rounded-md bg-accent px-6 py-3 text-[17px] font-semibold text-accent-ink no-underline">✍️ Submit your article</a>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 font-serif text-[28px] font-semibold">Topics we welcome</h2>
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {TOPICS.map(([t, d]) => (
            <li key={t} className="rounded-2xl border border-line bg-surface px-5 py-4">
              <h3 className="m-0 text-[17px] font-semibold">{t}</h3>
              <p className="m-0 mt-1 text-[15px] text-muted">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 font-serif text-[28px] font-semibold">How it works</h2>
        <ol className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="flex flex-col gap-1 rounded-2xl bg-sky px-4 py-4">
              <span className="font-serif text-[26px] font-semibold text-eyebrow">{i + 1}</span>
              <h3 className="m-0 text-[16px] font-semibold">{t}</h3>
              <p className="m-0 text-[14px] text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="prose-cmp rounded-2xl border border-line bg-surface px-6 py-5">
        <h2>Submission guidelines</h2>
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

      {recent.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[28px] font-semibold">Recently published by our contributors</h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {recent.map((p) => (
              <li key={p.id} className="rounded-xl border border-line bg-surface px-5 py-3">
                <Link href={`/blog/${p.slug}`} className="font-semibold">{p.title}</Link>
                {p.author && <span className="text-[14px] text-muted"> · {p.author}{p.author_country ? `, ${p.author_country}` : ''}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="submit" className="flex scroll-mt-24 flex-col gap-4">
        <h2 className="m-0 font-serif text-[28px] font-semibold">Send your article</h2>
        <ArticleForm />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 font-serif text-[28px] font-semibold">Questions writers ask</h2>
        {FAQ.map(([q, a]) => (
          <details key={q} className="rounded-xl border border-line bg-surface px-5 py-3">
            <summary className="cursor-pointer font-semibold">{q}</summary>
            <p className="m-0 mt-2 text-muted">{a}</p>
          </details>
        ))}
      </section>
    </div>
  )
}
