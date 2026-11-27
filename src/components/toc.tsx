import type { TocItem } from '@/lib/format'

/** "In this article" (or "In this story" for news): jump links to each heading of a long post. Shown only when there are 3 or more headings. */
export function TableOfContents({ items, news = false }: { items: TocItem[]; news?: boolean }) {
  if (items.length < 3) return null
  let n = 0
  return (
    <details open className="toc group rounded-2xl border border-line bg-surface px-5 py-4 sm:px-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-serif text-[22px] font-semibold [&::-webkit-details-marker]:hidden">
        {news ? 'In this story' : 'In this article'}
        <span className="text-[14px] font-sans font-semibold text-muted"><span className="group-open:hidden">Show</span><span className="hidden group-open:inline">Hide</span> ▾</span>
      </summary>
      <nav aria-label="Table of contents" className="mt-3">
        <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
          {items.map((t) => (
            <li key={t.id} className={t.level === 3 ? 'pl-7 text-[15px]' : ''}>
              <a href={`#${t.id}`} className="flex gap-2 text-ink no-underline hover:text-accent hover:underline">
                {t.level === 2 ? <span className="w-5 shrink-0 font-semibold text-eyebrow">{++n}.</span> : <span className="shrink-0 text-muted">–</span>}
                <span>{t.text}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  )
}
