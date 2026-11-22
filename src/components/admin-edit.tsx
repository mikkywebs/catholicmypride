'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/** "Edit this page" for the signed-in admin, on any page that comes from the admin (post, saint, novena…). */
export function AdminEditButton({ bases }: { bases: string[] }) {
  const path = usePathname()
  const [admin, setAdmin] = useState(false)
  useEffect(() => {
    // Only someone signed in has a Supabase login cookie; everyone else never calls the server.
    if (!/sb-[^=]*-auth-token/.test(document.cookie)) return
    let cached: string | null = null
    try { cached = sessionStorage.getItem('cmp-admin') } catch {}
    if (cached) { const t = setTimeout(() => setAdmin(cached === '1'), 0); return () => clearTimeout(t) }
    fetch('/api/am-admin', { cache: 'no-store' }).then((r) => r.json()).then((j: { admin?: boolean }) => {
      try { sessionStorage.setItem('cmp-admin', j.admin ? '1' : '0') } catch {}
      setAdmin(!!j.admin)
    }).catch(() => {})
  }, [])
  const editable = bases.some((b) => path.startsWith(b) && path.length > b.length)
  if (!admin || !editable) return null
  return (
    <a href={`/admin/open?path=${encodeURIComponent(path)}`} className="fixed bottom-[104px] left-4 z-40 flex items-center gap-1.5 rounded-full bg-navy px-4 py-2.5 text-[15px] font-semibold text-navy-ink no-underline shadow-lg hover:bg-accent hover:text-accent-ink print:hidden">
      ✏️ Edit this page
    </a>
  )
}
