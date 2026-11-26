import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChurchIcon } from './icons'

/** Cathedral or parish church photo; a quiet church symbol until a photo is added. */
export function DirPicture({ src, alt, className = '', sizes = '120px', priority }: { src?: string | null; alt?: string | null; className?: string; sizes?: string; priority?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-sky to-accent-soft ${className}`}>
      {src ? <Image src={src} alt={alt ?? ''} fill sizes={sizes} className="object-cover" priority={priority} /> : <span className="absolute inset-0 grid place-items-center text-eyebrow opacity-60"><ChurchIcon size={28} /></span>}
    </div>
  )
}

export type Row = { id: string; name: string; href: string; sub?: string | null; note?: string | null; img?: string | null; alt?: string | null }

/** Slim list: small photo, name, one line underneath. Two columns on wide screens. */
export function DirRows({ rows }: { rows: Row[] }) {
  return (
    <ul className="m-0 grid list-none gap-x-6 gap-y-1 p-0 md:grid-cols-2">
      {rows.map((r) => (
        <li key={r.id}>
          <Link href={r.href} className="flex items-center gap-3 rounded-xl px-2 py-2 text-ink no-underline hover:bg-surface">
            <DirPicture src={r.img} alt={r.alt} className="size-12 shrink-0 rounded-lg" sizes="48px" />
            <span className="flex min-w-0 flex-col">
              <strong className="line-clamp-2 text-[16px] leading-snug">{r.name}</strong>
              {(r.sub || r.note) && <span className="truncate text-[13px] text-muted">{[r.sub, r.note].filter(Boolean).join(' · ')}</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** A section that opens on tap. Its content is in the page (Google reads it), just folded away. */
export function Fold({ title, meta, open, id, children }: { title: string; meta?: string; open?: boolean; id?: string; children: ReactNode }) {
  return (
    <details id={id} open={open} className="group rounded-2xl border border-line bg-surface open:pb-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-col"><strong className="text-[18px] leading-snug">{title}</strong>{meta && <span className="text-[14px] text-muted">{meta}</span>}</span>
        <span aria-hidden className="text-muted transition group-open:rotate-180">▾</span>
      </summary>
      <div className="flex flex-col gap-3 px-3">{children}</div>
    </details>
  )
}
