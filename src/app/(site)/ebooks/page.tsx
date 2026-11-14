import type { Metadata } from 'next'
import Link from 'next/link'
import { Cover, EmptyState, Eyebrow, H1 } from '@/components/ui'
import { getBooks, getCategories } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Catholic Ebooks',
  description: 'Free and paid Catholic ebooks from Catholic My Pride: prayers, devotions and teachings.',
  alternates: { canonical: '/ebooks' },
}

export default async function Page() {
  const [books, cats] = await Promise.all([getBooks(), getCategories('book')])
  const groups = cats.map((c) => ({ c, list: books.filter((b) => b.category_id === c.id) })).filter((g) => g.list.length)
  const other = books.filter((b) => !b.category_id)
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 pb-[72px] pt-10">
      <div className="text-center"><Eyebrow>Ebooks</Eyebrow><H1 className="mt-2">Books for your faith</H1></div>
      {books.length === 0 && <EmptyState>Ebooks will be published soon.</EmptyState>}
      {[...groups, ...(other.length ? [{ c: { id: 'other', name: 'More books' }, list: other }] : [])].map(({ c, list }) => (
        <section key={c.id} className="reveal flex flex-col gap-5">
          <h2 className="m-0 border-b border-line pb-3 font-serif text-[32px] font-semibold">{c.name}</h2>
          <div className="grid gap-7 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
            {list.map((b) => (
              <Link key={b.id} href={`/ebooks/${b.slug}`} className="flex flex-col gap-2.5 text-ink no-underline">
                <Cover src={b.cover_url} alt={b.title} />
                <span className="font-serif text-[22px] font-semibold leading-tight">{b.title}</span>
                <span className="text-sm font-semibold text-eyebrow">{b.is_free ? 'Free' : b.price_label}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
