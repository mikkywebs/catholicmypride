import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { JsonLd } from '@/components/article-bits'
import { Reactions, ShareBar, ViewCount } from '@/components/engage'
import { DownloadIcon } from '@/components/icons'
import { Breadcrumb, ButtonLink, Chip, Cover, Prose } from '@/components/ui'
import { getBook, getBooks, getSettings } from '@/lib/data'
import { md, SITE_URL, slugify } from '@/lib/format'

export async function generateMetadata({ params }: PageProps<'/ebooks/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const b = await getBook(slug)
  if (!b) return {}
  const title = b.seo_title || `${b.title}${b.is_free ? ' (Free Catholic Ebook)' : ''}`
  const description = b.seo_description || (b.description_md ?? '').slice(0, 155)
  return { title, description, keywords: b.keywords, alternates: { canonical: `/ebooks/${slug}` }, openGraph: { title, description, type: 'book', images: b.cover_url ? [b.cover_url] : undefined } }
}

export default function Page(props: PageProps<'/ebooks/[slug]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content params={props.params} /></Suspense>
}

async function Content({ params }: { params: PageProps<'/ebooks/[slug]'>['params'] }) {
  const { slug } = await params
  const [b, s, all] = await Promise.all([getBook(slug), getSettings(), getBooks()])
  if (!b) notFound()
  const related = all.filter((x) => x.id !== b.id && (!b.category_id || x.category_id === b.category_id)).slice(0, 4)
  const dl = b.file_url ? `${b.file_url}${b.file_url.includes('?') ? '&' : '?'}download=${encodeURIComponent(slugify(b.title) + '.' + (b.format?.toLowerCase().includes('epub') ? 'epub' : 'pdf'))}` : null
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-10 px-6 pb-[72px] pt-8">
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Book', name: b.title, author: b.author ? { '@type': 'Person', name: b.author } : undefined, image: b.cover_url ?? undefined, url: `${SITE_URL}/ebooks/${slug}`, keywords: b.keywords.join(', '), offers: { '@type': 'Offer', price: b.is_free ? '0' : undefined, availability: 'https://schema.org/InStock' } }} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Ebooks', href: '/ebooks' }, ...(b.category ? [{ label: b.category.name }] : []), { label: b.title }]} />
      <div className="flex flex-wrap items-start gap-12">
        <div className="min-w-60 flex-[0_1_340px]">
          <Cover src={b.cover_url} alt={b.title} />
          <div className="pt-5"><ShareBar title={b.title} /></div>
        </div>
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5">
          {b.category && <p className="eyebrow m-0">{b.category.name}</p>}
          <h1 className="m-0 font-serif text-[40px] font-semibold leading-[1.1] sm:text-[50px]">{b.title}</h1>
          <p className="m-0 flex flex-wrap gap-x-2 text-muted">{[b.author, b.pages && `${b.pages} pages`, b.format].filter(Boolean).join(' · ')}<ViewCount section="Ebooks" threshold={s.view_threshold} /></p>
          <div className="flex flex-wrap items-center gap-3 py-1.5">
            {b.is_free ? (
              <>
                <span className="font-serif text-[30px] font-bold text-[#2e7d4f] dark:text-[#6fcf97]">Free</span>
                {dl && <ButtonLink href={dl}><DownloadIcon /> Free download</ButtonLink>}
              </>
            ) : (
              <>
                {b.price_label && <span className="font-serif text-[30px] font-bold">{b.price_label}</span>}
                {b.buy_url && <ButtonLink href={b.buy_url} external>Buy this book</ButtonLink>}
              </>
            )}
          </div>
          {b.description_md && (<><h2 className="m-0 pt-1.5 font-serif text-[26px] font-semibold">About this book</h2><Prose html={md(b.description_md)} /></>)}
          {b.keywords.length > 0 && <div className="flex flex-wrap gap-2 pt-1" aria-label="Keywords">{b.keywords.map((k) => <Chip key={k}>{k}</Chip>)}</div>}
          {b.remarks && <div className="mt-1.5 rounded-2xl bg-sky px-5 py-4"><strong>Remarks</strong><p className="m-0 mt-1 text-body">{b.remarks}</p></div>}
        </div>
      </div>
      <Reactions type="book" id={b.id} kinds={['love', 'amen', 'thumbs']} title="What do you think of this book?" />
      <section className="reveal flex flex-col items-center gap-3 rounded-2xl border border-eyebrow px-7 py-9 text-center">
        <h2 className="m-0 font-serif text-[32px] font-semibold">Support our apostolate</h2>
        <p className="m-0 max-w-[560px] text-muted">Every gift helps us write, publish and share more Catholic resources.</p>
        <ButtonLink href="/donate">Donate</ButtonLink>
      </section>
      {related.length > 0 && (
        <section className="reveal flex flex-col gap-4">
          <h2 className="m-0 border-b border-line pb-3 font-serif text-[34px] font-semibold">Related books</h2>
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
            {related.map((r) => (
              <Link key={r.id} href={`/ebooks/${r.slug}`} className="flex flex-col gap-2 text-ink no-underline">
                <Cover src={r.cover_url} alt={r.title} />
                <span className="font-serif text-[21px] font-semibold leading-tight">{r.title}</span>
                <span className="text-sm font-semibold text-eyebrow">{r.is_free ? 'Free' : r.price_label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
