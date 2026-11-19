import { WhatsAppJoin } from '@/components/whatsapp-join'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { JsonLd, articleLd } from '@/components/article-bits'
import { AudioPlayer } from '@/components/audio-player'
import { Reactions, ShareBar, ViewCount } from '@/components/engage'
import { Breadcrumb, Chip, Featured, Prose, ReadTime } from '@/components/ui'
import { getPost, getRelatedPosts, getSettings } from '@/lib/data'
import { dateLabel, duration, md, readMinutes } from '@/lib/format'

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
  return (
    <div className="mx-auto flex max-w-[780px] flex-col gap-6 px-6 pb-[72px] pt-8">
      <JsonLd data={articleLd({ title: p.title, description: p.seo_description || p.excerpt, image: p.featured_image, path: `/blog/${slug}`, published: p.published_at, modified: p.updated_at, author: p.author })} />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, ...(p.category ? [{ label: p.category.name, href: `/blog?category=${p.category.slug}` }] : [])]} />
      <div className="flex flex-col gap-3.5">
        {p.category && <p className="eyebrow m-0">{p.category.name}</p>}
        <h1 className="m-0 font-serif text-[40px] font-semibold leading-[1.1] sm:text-[52px]">{p.title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-muted">
          {p.author && <strong className="text-ink">{p.author}</strong>}
          <span>{dateLabel(p.published_at)}</span>
          <ReadTime minutes={readMinutes(p.body_md)} />
          {listen && <span>{listen} listen</span>}
          <ViewCount section="Blog" threshold={s.view_threshold} />
        </div>
      </div>
      <Featured src={p.featured_image} alt={p.image_alt} priority />
      <ShareBar title={p.title} />
      {p.audio_url && <AudioPlayer src={p.audio_url} label="Listen to this post" initialSeconds={p.audio_seconds} />}
      <Prose html={md(p.body_md)} />
      {p.tags.length > 0 && <div className="flex flex-wrap gap-2" aria-label="Tags">{p.tags.map((t) => <Chip key={t}>{t}</Chip>)}</div>}
      <Reactions type="post" id={p.id} kinds={['love', 'amen', 'thumbs']} title="Did this bless you?" />
      <WhatsAppJoin url={s.whatsapp_channel_url} />
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
