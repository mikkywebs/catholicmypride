import Link from 'next/link'
import { Suspense } from 'react'
import { requireAdmin } from '@/lib/admin'
import { signOut } from '../actions'

const NAV = [
  ['Dashboard', '/admin'], ['Blog', '/admin/posts'], ['Novenas', '/admin/novenas'], ['Daily Prayers', '/admin/prayers'], ['Chaplets', '/admin/chaplets'],
  ['Mass Readings', '/admin/readings'], ['Saints', '/admin/saints'], ['Music & Audio', '/admin/songs'], ['Ebooks', '/admin/books'],
  ['Dioceses', '/admin/dioceses'], ['Parishes', '/admin/churches'], ['Countries & Provinces', '/admin/regions'], ['Prayer Requests', '/admin/prayer-requests'], ['Messages', '/admin/messages'],
  ['Categories', '/admin/categories'], ['Settings', '/admin/settings'],
]

export default function Panel({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-navy px-6 py-3.5 text-navy-ink">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4">
          <Link href="/admin" className="font-serif text-2xl font-bold text-navy-ink no-underline">CMP Admin</Link>
          <nav aria-label="Admin" className="flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
            {NAV.map(([label, href]) => <Link key={href} href={href} className="py-2 text-navy-muted no-underline hover:text-navy-ink">{label}</Link>)}
            <Link href="/" target="_blank" className="py-2 text-gold no-underline">View site ↗</Link>
            <form action={signOut}><button type="submit" className="py-2 text-navy-muted hover:text-navy-ink">Sign out</button></form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-[1320px] px-6 pb-16 pt-7">
        <Suspense fallback={<p className="text-muted">Loading…</p>}>
          <Guard>{children}</Guard>
        </Suspense>
      </div>
    </>
  )
}

async function Guard({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return <>{children}</>
}
