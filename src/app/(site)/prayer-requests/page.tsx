import type { Metadata } from 'next'
import { PrayButton } from '@/components/pray-button'
import { PrayerForm } from '@/components/prayer-form'
import { Eyebrow, H1 } from '@/components/ui'
import { getPrayerWall } from '@/lib/data'
import type { PublicPrayerRequest } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Prayer Requests and Prayer Wall',
  description: 'Send a prayer intention to the Catholic My Pride community and pray for others on our Prayer Wall.',
  alternates: { canonical: '/prayer-requests' },
}

function dayKey(iso: string) { return iso.slice(0, 10) }
function dayHeading(key: string, newest: string) {
  if (key === newest) return null
  return new Date(key + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export default async function Page() {
  const wall = await getPrayerWall(60)
  const groups: { key: string; items: PublicPrayerRequest[] }[] = []
  for (const r of wall) {
    const k = dayKey(r.created_at)
    const g = groups[groups.length - 1]
    if (g && g.key === k) g.items.push(r); else groups.push({ key: k, items: [r] })
  }
  return (
    <div className="flex flex-col">
      <section className="px-6 pb-12 pt-10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap gap-12">
          <div className="flex flex-1 basis-[360px] flex-col gap-3.5">
            <Eyebrow>Prayer Requests</Eyebrow>
            <H1>Let us pray for you</H1>
            <p className="m-0 text-muted">Share your intention. Public requests appear on the Prayer Wall below after our team approves them. Private requests are seen only by the prayer team.</p>
          </div>
          <PrayerForm />
        </div>
      </section>
      <section id="wall" className="mx-auto flex w-full max-w-[900px] flex-col gap-7 px-6 pb-[72px]">
        <div className="text-center"><Eyebrow>Prayer Wall</Eyebrow><h2 className="m-0 mt-2 font-serif text-[40px] font-semibold">Pray for one another</h2></div>
        {wall.length === 0 && <p className="text-center text-muted">Approved intentions will appear here.</p>}
        {groups.map((g, gi) => (
          <section key={g.key} className="flex flex-col gap-3.5">
            <h3 className="m-0 border-b border-line pb-2 text-sm font-bold uppercase tracking-[0.14em] text-eyebrow">
              {gi === 0 ? 'Most recent' : dayHeading(g.key, groups[0].key)}
            </h3>
            {g.items.map((r) => (
              <article key={r.id} className="reveal flex flex-col gap-2.5 rounded-2xl border border-line bg-surface px-6 py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <strong className="text-[17px]">{r.first_name}{r.country && <span className="font-normal text-muted"> · {r.country}</span>}</strong>
                  <time dateTime={r.created_at} className="text-sm text-muted">{new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time>
                </div>
                <p className="m-0 whitespace-pre-line text-lg leading-[1.7] text-body">{r.body}</p>
                <div><PrayButton id={r.id} initial={r.prayed_count} /></div>
              </article>
            ))}
          </section>
        ))}
      </section>
    </div>
  )
}
