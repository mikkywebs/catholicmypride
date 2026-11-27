import { isNews } from '@/lib/news'
import { ListViews } from '@/components/engage'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { EmptyState, Eyebrow, Featured, H1 } from '@/components/ui'
import { getCategories, getPostsPage } from '@/lib/data'
import { Pager } from '@/components/pager'
import { dateLabel, readMinutes } from '@/lib/format'

const PER = 12

export async function generateMetadata(props: PageProps<'/blog'>): Promise<Metadata> {
  const sp = await props.searchParams
  const page = pageOf(sp.page)
  const cat = typeof sp.category === 'string' ? sp.category : undefined
  const qs = new URLSearchParams({ ...(cat ? { category: cat } : {}), ...(page > 1 ? { page: String(page) } : {}) }).toString()
  return {
    title: `Catholic Blog: Faith, Saints, Feasts and Reflections${page > 1 ? ` (page ${page})` : ''}`,
    description: 'Catholic faith and teaching, the saints and feasts of the Church, and reflections on the life of the Church, from the Catholic My Pride apostolate.',
    alternates: { canonical: `/blog${qs ? `?${qs}` : ''}` },
  }
}

function pageOf(v: string | string[] | undefined) {
  const n = Number(typeof v === 'string' ? v : 1)
  return Number.isInteger(n) && n > 1 ? Math.min(n, 1000) : 1
}

/** Link to a page of the list, keeping the chosen category. */
function pageHref(page: number, cat?: string) {
  const qs = new URLSearchParams({ ...(cat ? { category: cat } : {}), ...(page > 1 ? { page: String(page) } : {}) }).toString()
  return `/blog${qs ? `?${qs}` : ''}`
}


export default function Page(props: PageProps<'/blog'>) {
  return <Suspense fallback={<div className="h-96" />}><Content searchParams={props.searchParams} /></Suspense>
}

async function Content({ searchParams }: { searchParams: PageProps<'/blog'>['searchParams'] }) {
  const sp = await searchParams
  const cat = typeof sp.category === 'string' ? sp.category : undefined
  const page = pageOf(sp.page)
  const [{ posts, total }, cats] = await Promise.all([getPostsPage(page, PER, cat), getCategories('blog')])
  const pages = Math.max(1, Math.ceil(total / PER))
  const current = cats.find((c) => c.slug === cat)
  const news = isNews(current)
  const word = news ? 'news' : 'articles'
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 pb-[72px] pt-10">
      <div className="text-center"><Eyebrow>Blog</Eyebrow><H1 className="mt-2">{news && current ? current.name : <>Faith, Saints &amp; Feasts</>}</H1></div>
      {cats.length > 0 && (
        <nav aria-label="Categories" className="flex flex-wrap justify-center gap-2">
          <Link href="/blog" className={`rounded-full border px-4 py-2 no-underline ${!cat ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-ink'}`}>All</Link>
          {cats.map((c) => <Link key={c.id} href={`/blog?category=${c.slug}`} className={`rounded-full border px-4 py-2 no-underline ${cat === c.slug ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface text-ink'}`}>{c.name}</Link>)}
        </nav>
      )}
      {posts.length === 0 ? <EmptyState>{page > 1 ? <>No more {word}. <Link href={pageHref(1, cat)}>Back to the first page</Link></> : `No ${word} here yet.`}</EmptyState> : (
        <div className="grid gap-8 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="reveal flex flex-col gap-3 text-ink no-underline">
              <Featured src={p.featured_image} alt={p.image_alt} rounded="rounded-2xl" />
              <p className="m-0 text-[13px] uppercase tracking-[0.1em] text-eyebrow">{[p.category?.name, dateLabel(p.published_at), `${readMinutes(p.body_md)} min read`].filter(Boolean).join(' · ')}</p>
              <span className="-mt-1.5 text-sm text-muted empty:hidden"><ListViews path={`/blog/${p.slug}`} /></span>
              <h2 className="m-0 line-clamp-2 font-serif text-[26px] font-semibold leading-tight" title={p.title}>{p.title}</h2>
              {p.excerpt && <p className="m-0 line-clamp-3 text-muted">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      )}
      <Pager page={Math.min(page, pages)} pages={pages} href={(n) => pageHref(n, cat)} label="Blog pages" />
      <p className="m-0 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-gold bg-surface px-5 py-4">
        <span><strong>Write for Catholic My Pride.</strong> <span className="text-muted">We welcome articles and guest posts from Catholic writers in every country.</span></span>
        <Link href="/write-for-us" className="rounded-md bg-accent px-4 py-2 font-semibold text-accent-ink no-underline">✍️ Submit your article</Link>
      </p>
    </div>
  )
}
