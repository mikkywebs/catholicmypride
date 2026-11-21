import Link from 'next/link'

/** Previous / page numbers / Next. Long lists show the first, last and nearby pages only. */
export function Pager({ page, pages, href, label = 'Pages' }: { page: number; pages: number; href: (n: number) => string; label?: string }) {
  if (pages <= 1) return null
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
  const btn = 'rounded-full border border-line bg-surface px-4 py-2 font-semibold text-ink no-underline hover:border-accent'
  const off = 'rounded-full border border-line px-4 py-2 font-semibold text-muted opacity-50'
  return (
    <nav aria-label={label} className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {page > 1 ? <Link href={href(page - 1)} rel="prev" className={btn}>← Previous</Link> : <span className={off} aria-hidden>← Previous</span>}
        <span className="hidden items-center gap-1.5 sm:flex">
          {nums.map((n, i) => (
            <span key={n} className="flex items-center gap-1.5">
              {i > 0 && n - nums[i - 1] > 1 && <span className="text-muted">…</span>}
              {n === page
                ? <span aria-current="page" className="grid h-10 min-w-10 place-items-center rounded-full bg-accent px-3 font-semibold text-accent-ink">{n}</span>
                : <Link href={href(n)} className="grid h-10 min-w-10 place-items-center rounded-full border border-line bg-surface px-3 font-semibold text-ink no-underline hover:border-accent">{n}</Link>}
            </span>
          ))}
        </span>
        {page < pages ? <Link href={href(page + 1)} rel="next" className={btn}>Next →</Link> : <span className={off} aria-hidden>Next →</span>}
      </div>
      <p className="m-0 text-sm text-muted">Page {page} of {pages}</p>
    </nav>
  )
}
