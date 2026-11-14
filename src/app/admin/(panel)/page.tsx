import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'

type Stats = {
  views: number; countries: number
  daily: { day: string; n: number }[]
  by_country: { name: string; n: number }[]
  by_section: { name: string; n: number }[]
  top_pages: { path: string; section: string | null; n: number; country: string | null }[]
  pending_requests: number; private_requests: number; unread_messages: number
}

const regionName = (code: string) => {
  if (code === '??') return 'Unknown'
  try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code } catch { return code }
}

function Bars({ items, unit }: { items: { name: string; n: number }[]; unit: string }) {
  const top = items[0]?.n || 1
  const sum = items.reduce((a, b) => a + b.n, 0) || 1
  if (!items.length) return <p className="m-0 text-muted">No visits yet.</p>
  return (
    <div className="flex flex-col gap-3.5">
      {items.map((c) => (
        <div key={c.name} title={`${c.name}: ${c.n.toLocaleString()} ${unit}`} className="flex flex-col gap-1">
          <div className="flex justify-between text-[15px]"><span>{c.name}</span><span className="font-semibold">{c.n.toLocaleString()} <span className="font-normal text-muted">· {Math.round((c.n / sum) * 100)}%</span></span></div>
          <div className="h-2 rounded bg-[#eef2f5] dark:bg-[#2a303c]"><div className="h-2 rounded bg-accent" style={{ width: `${Math.max(2, Math.round((c.n / top) * 100))}%` }} /></div>
        </div>
      ))}
    </div>
  )
}

/** The last `n` calendar days (UTC), oldest first. */
function lastDays(n: number) {
  const today = new Date().toISOString().slice(0, 10)
  const t0 = Date.parse(today + 'T00:00:00Z')
  return Array.from({ length: n }, (_, i) => new Date(t0 - (n - 1 - i) * 86_400_000).toISOString().slice(0, 10))
}

function Line({ daily, days }: { daily: Stats['daily']; days: number }) {
  const map = new Map(daily.map((d) => [d.day, Number(d.n)]))
  const pts = lastDays(days).map((d) => ({ day: d, n: map.get(d) ?? 0 }))
  const max = Math.max(5, ...pts.map((p) => p.n))
  const yMax = Math.ceil(max / 5) * 5
  const x = (i: number) => 40 + (i * 750) / Math.max(1, pts.length - 1)
  const y = (n: number) => 200 - (n / yMax) * 180
  const line = pts.map((p, i) => `${x(i).toFixed(1)},${y(p.n).toFixed(1)}`).join(' ')
  return (
    <svg viewBox="0 0 800 220" role="img" aria-label={`Visits per day over the last ${days} days`} className="block h-auto w-full">
      {[20, 80, 140].map((g) => <line key={g} x1="40" x2="790" y1={g} y2={g} stroke="currentColor" strokeOpacity="0.08" />)}
      <line x1="40" x2="790" y1="200" y2="200" stroke="currentColor" strokeOpacity="0.25" />
      <text x="32" y="24" textAnchor="end" fontSize="11" fill="currentColor" opacity="0.7">{yMax}</text>
      <text x="32" y="204" textAnchor="end" fontSize="11" fill="currentColor" opacity="0.7">0</text>
      <polygon points={`40,200 ${line} 790,200`} fill="var(--accent)" fillOpacity="0.1" />
      <polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={p.day}>
          <rect x={x(i) - 375 / pts.length} y="20" width={750 / pts.length} height="180" fill="transparent"><title>{`${p.day}: ${p.n} visits`}</title></rect>
        </g>
      ))}
    </svg>
  )
}

export default async function Page(props: PageProps<'/admin'>) {
  const sp = await props.searchParams
  const days = [7, 30, 90].includes(Number(sp.range)) ? Number(sp.range) : 30
  const { db } = await requireAdmin()
  const { data, error } = await db.rpc('admin_stats', { p_days: days })
  const s = (data ?? null) as Stats | null
  const tile = 'flex flex-col gap-1 rounded-2xl border border-line bg-surface px-5 py-4'
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 font-serif text-[38px] font-semibold">Dashboard</h1>
        <div role="group" aria-label="Date range" className="flex gap-1 rounded-xl border border-line bg-surface p-1">
          {[7, 30, 90].map((d) => <Link key={d} href={`/admin?range=${d}`} className={`rounded-lg px-4 py-2 font-semibold no-underline ${d === days ? 'bg-navy text-navy-ink' : 'text-ink'}`}>{d} days</Link>)}
        </div>
      </div>
      {error && <p role="alert" className="rounded-lg bg-[#fbe7dc] p-3 text-[#9a3412]">Could not load statistics: {error.message}</p>}
      {s && (
        <>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            <div className={tile}><span className="text-sm font-semibold text-muted">Page views</span><span className="text-4xl font-semibold">{Number(s.views).toLocaleString()}</span><span className="text-[13px] text-muted">Last {days} days</span></div>
            <div className={tile}><span className="text-sm font-semibold text-muted">Countries</span><span className="text-4xl font-semibold">{s.countries}</span><span className="text-[13px] text-muted">With at least one visit</span></div>
            <Link href="/admin/prayer-requests" className={`${tile} text-ink no-underline`}><span className="text-sm font-semibold text-muted">Requests to approve</span><span className="text-4xl font-semibold">{s.pending_requests}</span><span className="text-[13px] text-muted">+ {s.private_requests} private to pray for</span></Link>
            <Link href="/admin/messages" className={`${tile} text-ink no-underline`}><span className="text-sm font-semibold text-muted">Unread messages</span><span className="text-4xl font-semibold">{s.unread_messages}</span><span className="text-[13px] text-muted">From the contact form</span></Link>
          </div>
          <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6">
            <h2 className="m-0 text-lg">Visits per day</h2>
            <Line daily={s.daily} days={days} />
          </section>
          <div className="flex flex-wrap gap-6">
            <section className="flex flex-1 basis-[420px] flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
              <h2 className="m-0 text-lg">Where visitors come from</h2>
              <Bars items={s.by_country.map((c) => ({ name: regionName(c.name), n: Number(c.n) }))} unit="views" />
              <span className="text-[13px] text-muted">Country only. No exact addresses are stored.</span>
            </section>
            <section className="flex flex-1 basis-[420px] flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
              <h2 className="m-0 text-lg">Most visited sections</h2>
              <Bars items={s.by_section.map((c) => ({ name: c.name, n: Number(c.n) }))} unit="views" />
            </section>
          </div>
          <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6">
            <h2 className="m-0 text-lg">Top pages</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-[15px]">
                <thead><tr className="text-left text-[13px] uppercase tracking-wider text-muted"><th className="border-b border-line py-2">Page</th><th className="border-b border-line py-2">Section</th><th className="border-b border-line py-2 text-right">Views</th><th className="border-b border-line py-2 text-right">Top country</th></tr></thead>
                <tbody>
                  {s.top_pages.map((p) => (
                    <tr key={p.path}><td className="border-b border-line py-2.5"><a href={p.path} target="_blank" rel="noreferrer">{p.path}</a></td><td className="border-b border-line py-2.5 text-muted">{p.section ?? '—'}</td><td className="border-b border-line py-2.5 text-right font-semibold">{Number(p.n).toLocaleString()}</td><td className="border-b border-line py-2.5 text-right">{p.country ? regionName(p.country) : '—'}</td></tr>
                  ))}
                  {s.top_pages.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-muted">No visits yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
