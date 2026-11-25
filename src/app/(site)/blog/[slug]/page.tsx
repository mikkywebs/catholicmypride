import { StayConnected } from '@/components/whatsapp-join'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { JsonLd, articleLd } from '@/components/article-bits'
import { AudioPlayer } from '@/components/audio-player'
import { Reactions, ShareBar, ViewCount } from '@/components/engage'
import { Breadcrumb, Chip, Featured, Prose, ReadTime } from '@/components/ui'
import { getPost, getRelatedPosts, getSettings } from '@/lib/data'
import { dateLabel, duration, mdWithToc, parseSources, readMinutes } from '@/lib/format'
import { TableOfContents } from '@/components/toc'

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const p = await getPost(slug)
  if (!p) return {}
  const title = p.seo_title || p.title
  const description = p.seo_description || p.excerpt || undefined
  return {
    title, description,
    keywords: [p.focus_keyword, ...(p.keywords?.split(',') ?? []), ...p.tags].map((k) => k?.trim()).filter(Boolean) as string[],
    alternates: { canonical: `/blog/${slug}` },
    robots: p.noindex ? { index: false, follow: true } : undefined,
    openGraph: { title, description, type: 'article', publishedTime: p.published_at ?? undefined, modifiedTime: p.updated_at, images: p.featured_image ? [p.featured_image] : undefined, tags: p.tags },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default function Page(props: PageProps<'/blog/[slug]'>) {
  return <Suspense fallback={<div className="h-96" />}><Content params={props.params} /></Suspense>
}

async function Content({ params }: { params: PageProps<'/blog/[slug]'>['params'] }) {
  const { slug } = await params
  const [p, s] = await Promise.all([getPost(slug), getSettings()])
  if (!p) notFound()
  const related = await getRelatedPosts(p)
  const listen = duration(p.audio_seconds)
  const body = mdWithToc(p.body_md)
  const sources = parseSources(p.sources)
  return (
    <div className="mx-auto flex max-w-[780px] flex-col gap-6 px-6 pb-[72px] pt-8">
      <JsonLd data={articleLd({ title: p.title, description: p.seo_description || p.excerpt, image: p.featured_image, path: `/blog/${slug}`, published: p.published_at, modified: p.updated_at, author: p.author, citations: sources })} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, ...(p.category ? [{ label: p.category.name, href: `/blog?category=${p.category.slug}` }] : [])]} />
      <div className="flex flex-col gap-3.5">
        {p.category && <p className="eyebrow m-0">{p.category.name}</p>}
        <h1 className="m-0 font-serif text-[40px] font-semibold leading-[1.1] sm:text-[52px]">{p.title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-muted">
          {p.author && <span><span className="text-muted">By </span><strong className="text-ink">{p.author}</strong>{p.author_country && <span> · {p.author_country}</span>}</span>}
          {p.is_contributor && <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.1em] text-eyebrow">Contributor</span>}
          <span>{dateLabel(p.published_at)}</span>
          <ReadTime minutes={readMinutes(p.body_md)} />
          {listen && <span>{listen} listen</span>}
          <ViewCount section="Blog" threshold={s.view_threshold} />
        </div>
      </div>
      <Featured src={p.featured_image} alt={p.image_alt} priority />
      <ShareBar title={p.title} />
      {p.audio_url && <AudioPlayer src={p.audio_url} label="Listen to this post" initialSeconds={p.audio_seconds} />}
      <TableOfContents items={body.toc} />
      <Prose html={body.html} />
      {sources.length > 0 && (
        <section aria-labelledby="references" className="flex flex-col gap-2 border-t border-line pt-5">
          <h2 id="references" className="m-0 font-serif text-[24px] font-semibold">References</h2>
          <ol className="m-0 flex list-decimal flex-col gap-1.5 pl-6 marker:font-semibold text-[15px] text-muted">
            {sources.map((r) => (
              <li key={r.url} className="break-words pl-1">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-semibold">{r.title}</a>
                {r.title !== r.host && <span> · {r.host}</span>}
              </li>
            ))}
          </ol>
        </section>
      )}
      {p.tags.length > 0 && <div className="flex flex-wrap gap-2" aria-label="Tags">{p.tags.map((t) => <Chip key={t}>{t}</Chip>)}</div>}
      <Reactions type="post" id={p.id} kinds={['love', 'amen', 'thumbs']} title="Did this bless you?" />
      <StayConnected s={{ whatsapp_channel_url: s.whatsapp_channel_url, youtube_url: s.youtube_url, facebook_url: s.facebook_url, x_url: s.x_url }} />
      <p className="m-0 rounded-2xl border border-line bg-surface px-6 py-4 text-center text-[15px] text-muted">✍️ Would you like to write for Catholic My Pride? <Link href="/write-for-us" className="font-semibold">Share your article</Link></p>
      <div className="flex flex-col gap-2 border-t border-line pt-4"><strong>Found this helpful? Share it.</strong><ShareBar title={p.title} /></div>
      {related.length > 0 && (
        <section className="reveal flex flex-col gap-4 pt-3">
          <h2 className="m-0 border-b border-line pb-3 font-serif text-[32px] font-semibold">Related posts</h2>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`} className="flex flex-col gap-2 text-ink no-underline">
                <Featured src={r.featured_image} alt={r.image_alt} rounded="rounded-2xl" />
                <span className="font-serif text-[21px] font-semibold leading-tight">{r.title}</span>
                <span className="text-sm text-muted">{readMinutes(r.body_md)} min read</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
