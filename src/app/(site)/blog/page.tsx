import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { EmptyState, Eyebrow, Featured, H1 } from '@/components/ui'
import { getCategories, getPosts } from '@/lib/data'
import { dateLabel, readMinutes } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Blog: Catholic Teachings and Reflections',
  description: 'Catholic teachings, Scripture reflections, feasts and seasons, and news from the Catholic My Pride apostolate.',
  alternates: { canonical: '/blog' },
}

export default function Page(props: PageProps<'/blog'>) {
  return <Suspense fallback={<div className="h-96" />}><Content searchParams={props.searchParams} /></Suspense>
}

async function Content({ searchParams }: { searchParams: PageProps<'/blog'>['searchParams'] }) {
  const sp = await searchParams
  const cat = typeof sp.category === 'string' ? sp.category : undefined
  const [posts, cats] = await Promise.all([getPosts(30, cat), getCategories('blog')])
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 pb-[72px] pt-10">
      <div className="text-center"><Eyebrow>Blog</Eyebrow><H1 className="mt-2">Teachings &amp; reflections</H1></div>
      {cats.length > 0 && (
        <nav aria-label="Categories" className="flex flex-wrap justify-center gap-2">
          <Link href="/blog" className={`rounded-full border px-4 py-2 no-underline ${!cat ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-ink'}`}>All</Link>
          {cats.map((c) => <Link key={c.id} href={`/blog?category=${c.slug}`} className={`rounded-full border px-4 py-2 no-underline ${cat === c.slug ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-ink'}`}>{c.name}</Link>)}
        </nav>
      )}
      {posts.length === 0 ? <EmptyState>No articles here yet.</EmptyState> : (
        <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="reveal flex flex-col gap-3 text-ink no-underline">
              <Featured src={p.featured_image} alt={p.image_alt} rounded="rounded-2xl" />
              <p className="m-0 text-[13px] uppercase tracking-[0.1em] text-eyebrow">{[p.category?.name, dateLabel(p.published_at), `${readMinutes(p.body_md)} min read`].filter(Boolean).join(' · ')}</p>
              <h2 className="m-0 font-serif text-[26px] font-semibold leading-tight">{p.title}</h2>
              {p.excerpt && <p className="m-0 text-muted">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
