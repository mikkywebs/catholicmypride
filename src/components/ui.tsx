import Image from 'next/image'
import type { ReactNode } from 'react'
import { ClockIcon } from './icons'

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`eyebrow m-0 ${className}`}>{children}</p>
}

export function H1({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h1 className={`m-0 font-serif text-[40px] font-semibold leading-[1.1] text-ink sm:text-[52px] ${className}`}>{children}</h1>
}

export function H2({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h2 className={`m-0 font-serif text-[30px] font-semibold leading-tight text-ink sm:text-[38px] ${className}`}>{children}</h2>
}

/** Every featured image renders at the same 16:9 size. */
export function Featured({ src, alt, priority, className = '', rounded = 'rounded-[18px]' }: { src: string | null | undefined; alt?: string | null; priority?: boolean; className?: string; rounded?: string }) {
  if (!src) return null
  return (
    <div className={`relative aspect-video w-full overflow-hidden bg-ph ${rounded} ${className}`}>
      <Image src={src} alt={alt ?? ''} fill sizes="(max-width: 900px) 100vw, 900px" className="object-cover" priority={priority} />
    </div>
  )
}

/** 4:5 cover for songs and audio. */
export function Portrait({ src, alt, className = '', priority, sizes = '(max-width: 700px) 100vw, 380px' }: { src: string | null | undefined; alt?: string | null; className?: string; priority?: boolean; sizes?: string }) {
  return (
    <div className={`relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-ph ${className}`}>
      {src && <Image src={src} alt={alt ?? ''} fill sizes={sizes} className="object-cover" priority={priority} />}
    </div>
  )
}

export function Cover({ src, alt, className = '' }: { src: string | null | undefined; alt?: string; className?: string }) {
  return (
    <div className={`relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-ph shadow-[0_10px_28px_rgba(31,36,48,0.16)] ${className}`}>
      {src && <Image src={src} alt={alt ?? ''} fill sizes="(max-width: 600px) 50vw, 300px" className="object-cover" />}
    </div>
  )
}

export function ButtonLink({ href, children, variant = 'primary', className = '', external }: { href: string; children: ReactNode; variant?: 'primary' | 'outline' | 'gold'; className?: string; external?: boolean }) {
  const styles = {
    primary: 'bg-accent text-accent-ink hover:bg-accent-hover hover:text-accent-ink',
    outline: 'border border-ink text-ink hover:bg-ink hover:text-bg',
    gold: 'bg-gold text-[#1f2430] hover:brightness-95 hover:text-[#1f2430]',
  }[variant]
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={`inline-flex min-h-12 items-center gap-2 rounded-md px-6 font-semibold no-underline transition ${styles} ${className}`}>
      {children}
    </a>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</div>
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-sky px-3 py-1 text-sm text-ink">{children}</span>
}

export function Meta({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[15px] text-muted">{children}</div>
}

export function ReadTime({ minutes }: { minutes: number }) {
  return <span className="inline-flex items-center gap-1.5"><ClockIcon />{minutes} min read</span>
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      {items.map((it, i) => (
        <span key={i}>
          {i > 0 && ' › '}
          {it.href ? <a href={it.href} className="text-muted">{it.label}</a> : it.label}
        </span>
      ))}
    </nav>
  )
}

export function Prose({ html, className = '' }: { html: string; className?: string }) {
  if (!html) return null
  return <div className={`prose-cmp ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}

export function SectionHead({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3.5">
      <H2>{title}</H2>
      {href && <a href={href} className="font-semibold">{linkLabel ?? 'See all'} →</a>}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <Card className="p-10 text-center text-muted">{children}</Card>
}
