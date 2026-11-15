import Image from 'next/image'
import Link from 'next/link'
import type { Settings } from '@/lib/types'
import { CopyrightYear } from './year'
import { BrandIcon, BRANDS, EXTRA_BRANDS, LinkIcon } from './icons'
import { detectPlatform } from '@/lib/social'

type Flags = { blog: boolean; songs: boolean; books: boolean; churches: boolean; saints: boolean }

export function Footer({ s, flags }: { s: Settings; flags: Flags }) {
  const socials = [
    { name: 'YouTube', url: s.youtube_url, icon: BRANDS.youtube },
    { name: 'Facebook', url: s.facebook_url, icon: BRANDS.facebook },
    { name: 'TikTok', url: s.tiktok_url, icon: BRANDS.tiktok },
    { name: 'X', url: s.x_url, icon: BRANDS.x },
  ].filter((x) => x.url)
  const extras = (Array.isArray(s.extra_social) ? s.extra_social : []).filter((x) => x?.url).map((x) => {
    const p = detectPlatform(x.url)
    return { name: x.label || p.name || 'Link', url: x.url, brand: p.key ? EXTRA_BRANDS[p.key] : undefined }
  })
  const resources = [
    flags.blog && { label: 'Blog', href: '/blog' },
    flags.songs && { label: 'Music & Audio', href: '/music' },
    flags.books && { label: 'Ebooks', href: '/ebooks' },
    flags.churches && { label: 'Church Directory', href: '/churches' },
  ].filter(Boolean) as { label: string; href: string }[]
  const col = 'flex flex-1 basis-40 flex-col gap-1.5'
  const head = 'pb-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-ink'
  const a = 'text-muted no-underline hover:text-ink'

  return (
    <footer className="border-t border-footer-line bg-footer text-[15px] text-muted">
      <div className="bg-navy px-6 py-9 text-navy-ink">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-5">
          <div className="flex flex-1 basis-[420px] flex-col gap-1">
            <span className="font-serif text-[30px] font-semibold leading-tight">Help us share the faith with more families.</span>
            <span className="text-navy-muted">Your support funds our prayers, songs, books and outreach to families in need.</span>
          </div>
          <Link href="/donate" className="rounded-md bg-gold px-7 py-3 font-bold text-[#1f2430] no-underline hover:text-[#1f2430]">Donate</Link>
        </div>
      </div>

      <div className="px-6 pb-7 pt-11">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-9">
          <div className="flex flex-[2] basis-72 flex-col gap-3">
            <div className="flex items-center gap-3">
              <Image src={s.logo_url || '/logo.png'} alt="" width={56} height={56} className="size-14 rounded-full object-cover" />
              <span className="font-serif text-[26px] font-bold text-ink">{s.site_name}</span>
            </div>
            <p className="m-0 max-w-sm">{s.mission}</p>
            {s.contact_email && <a href={`mailto:${s.contact_email}`} className="font-semibold text-ink">{s.contact_email}</a>}
            {socials.length + extras.length > 0 && (
              <nav aria-label="Follow us" className="flex flex-wrap gap-2.5 pt-1.5">
                {socials.map((x) => (
                  <a key={x.name} href={x.url!} target="_blank" rel="noopener noreferrer" aria-label={x.name} title={x.name} className="flex size-11 items-center justify-center rounded-full border border-footer-line bg-surface text-ink">
                    <BrandIcon icon={x.icon} size={20} color={x.name === 'X' || x.name === 'TikTok' ? 'currentColor' : undefined} />
                  </a>
                ))}
                {extras.map((x) => (
                  <a key={x.url} href={x.url} target="_blank" rel="noopener noreferrer" aria-label={x.name} title={x.name} className="flex size-11 items-center justify-center rounded-full border border-footer-line bg-surface text-ink">
                    {x.brand ? <BrandIcon icon={x.brand.icon} size={20} color={x.brand.mono ? 'currentColor' : undefined} /> : <LinkIcon size={19} />}
                  </a>
                ))}
              </nav>
            )}
          </div>
          <nav aria-label="Quick links" className={col}>
            <span className={head}>Quick Links</span>
            <Link href="/about" className={a}>About us</Link>
            <Link href="/contact" className={a}>Contact us</Link>
            <Link href="/prayer-requests" className={a}>Prayer Requests</Link>
            {flags.saints && <Link href="/saint-of-the-day" className={a}>Saint of the Day</Link>}
          </nav>
          {resources.length > 0 && (
            <nav aria-label="Resources" className={col}>
              <span className={head}>Resources</span>
              {resources.map((r) => <Link key={r.href} href={r.href} className={a}>{r.label}</Link>)}
            </nav>
          )}
          <nav aria-label="Legal" className={col}>
            <span className={head}>Legal</span>
            <Link href="/privacy" className={a}>Privacy Policy</Link>
            <Link href="/terms" className={a}>Terms of Use</Link>
            <Link href="/cookies" className={a}>Cookie Policy</Link>
            <Link href="/disclaimer" className={a}>Disclaimer</Link>
          </nav>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3 border-t border-footer-line pt-4 text-sm">
          <span>© {s.site_name} Apostolate <CopyrightYear /></span>
          <a href="#top" className="text-muted">Back to top ↑</a>
        </div>
      </div>
    </footer>
  )
}
