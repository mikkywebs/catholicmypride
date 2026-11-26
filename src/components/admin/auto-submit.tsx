'use client'

/** Wraps a GET filter form so changing a dropdown applies it straight away. */
export function AutoSubmit({ children, className }: { children: React.ReactNode; className?: string }) {
  return <form className={className} onChange={(e) => { const el = e.target as HTMLElement; if (el.tagName === 'SELECT') (e.currentTarget as HTMLFormElement).requestSubmit() }}>{children}</form>
}
