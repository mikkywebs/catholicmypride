'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, CloseIcon, MenuIcon } from './icons'
import { ThemeToggle } from './theme'

type Item = { label: string; href: string }
export type NavData = {
  logoUrl: string | null
  siteName: string
  tagline: string
  pray: Item[]
  resources: Item[]
  saint: boolean
  wall: boolean
}

function Dropdown({ label, items, active }: { label: string; items: Item[]; active: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc) }
  }, [open])
  if (!items.length) return null
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex min-h-11 items-center gap-1 rounded-lg px-3 ${active ? 'font-semibold text-accent' : 'text-ink'}`}
      >
        {label} <ChevronDown />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-1.5 flex min-w-56 flex-col rounded-2xl border border-line bg-surface p-2 shadow-[0_12px_30px_rgba(31,36,48,0.14)]">
          {items.map((i) => (
            <Link key={i.href} href={i.href} onClick={() => setOpen(false)} className="rounded-lg px-3.5 py-2.5 text-ink no-underline hover:bg-sky">
              {i.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/** Live header: highlights the current section. */
export function Header({ nav }: { nav: NavData }) {
  return <HeaderShell nav={nav} path={usePathname()} />
}

/** Same header without the URL, used while the page streams in. */
export function HeaderShell({ nav, path }: { nav: NavData; path: string }) {
  const [mobile, setMobile] = useState(false)
  const is = (p: string) => (p === '/' ? path === '/' : path.startsWith(p))
  const link = (p: string) => `flex min-h-11 items-center rounded-lg px-3 no-underline ${is(p) ? 'font-semibold text-accent' : 'text-ink'}`
  const prayActive = nav.pray.some((i) => is(i.href))
  const resActive = nav.resources.some((i) => is(i.href))

  const links = (
    <>
      <Link href="/" className={link('/')}>Home</Link>
      <Link href="/about" className={link('/about')}>About</Link>
      <Dropdown label="Pray" items={nav.pray} active={prayActive} />
      {nav.saint && <Link href="/saint-of-the-day" className={link('/saint-of-the-day')}>Feast of the Day</Link>}
      <Dropdown label="Resources" items={nav.resources} active={resActive} />
      <Link href="/prayer-requests" className={link('/prayer-requests')}>Prayer Requests</Link>
    </>
  )

  return (
    <header className="relative z-30 border-b border-line bg-bg px-6 py-4">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3.5 text-ink no-underline">
          {nav.logoUrl ? (
            <Image src={nav.logoUrl} alt={`${nav.siteName} logo`} width={64} height={64} className="size-14 rounded-full object-cover sm:size-16" priority />
          ) : (
            <Image src="/logo.png" alt={`${nav.siteName} logo`} width={64} height={64} className="size-14 rounded-full object-cover sm:size-16" priority />
          )}
          <span className="flex flex-col">
            <span className="font-serif text-[26px] font-bold leading-none sm:text-[30px]">{nav.siteName}</span>
            <span className="text-xs uppercase tracking-[0.18em] text-eyebrow">{nav.tagline}</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden flex-wrap items-center gap-1 text-base lg:flex">
          {links}
          <span className="ml-1.5"><ThemeToggle /></span>
          <Link href="/donate" className="ml-2 rounded-md bg-accent px-5 py-2.5 font-semibold text-accent-ink no-underline hover:bg-accent-hover hover:text-accent-ink">Donate</Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button type="button" onClick={() => setMobile((m) => !m)} aria-expanded={mobile} aria-label="Menu" className="flex size-11 items-center justify-center rounded-full border border-line text-ink">
            {mobile ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {mobile && (
        <nav aria-label="Mobile" className="mx-auto mt-3 flex max-w-[1200px] flex-col gap-1 border-t border-line pt-3 lg:hidden" onClick={(e) => { if ((e.target as HTMLElement).closest('a')) setMobile(false) }}>
          {links}
          <Link href="/donate" className="mt-2 rounded-md bg-accent px-5 py-3 text-center font-semibold text-accent-ink no-underline">Donate</Link>
        </nav>
      )}
    </header>
  )
}
