import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { whatsappBriefing } from '@/lib/briefing'
import { getSettings } from '@/lib/data'
import { addDays, formatLong, todayISO } from '@/lib/liturgical'
import { CopyText } from '@/components/admin/copy-text'

export default async function Page(props: PageProps<'/admin/whatsapp'>) {
  await requireAdmin()
  const sp = await props.searchParams
  const date = typeof sp.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : todayISO()
  const [text, s] = await Promise.all([whatsappBriefing(date), getSettings()])
  return (
    <div className="flex max-w-[860px] flex-col gap-5">
      <h1 className="m-0 font-serif text-[38px] font-semibold">WhatsApp Briefing</h1>
      <p className="m-0 text-muted">The day&apos;s readings, saint or feast and daily prayer, ready for your WhatsApp Channel, with links back to the website. Edit the readings, saint or prayer in the admin first if you want, and this message updates.</p>
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/admin/whatsapp?date=${addDays(date, -1)}`} className="rounded-md border border-field bg-surface px-3 py-2 text-sm font-semibold no-underline">← Previous day</Link>
        <strong>{formatLong(date)}</strong>
        <Link href={`/admin/whatsapp?date=${addDays(date, 1)}`} className="rounded-md border border-field bg-surface px-3 py-2 text-sm font-semibold no-underline">Next day →</Link>
        {date !== todayISO() && <Link href="/admin/whatsapp" className="text-sm">Today</Link>}
      </div>
      <CopyText text={text} />
      {!s.whatsapp_channel_url && <p className="m-0 rounded-lg bg-sky px-4 py-3 text-sm">Add your channel link in <Link href="/admin/settings">Settings → Social media</Link> to show a &ldquo;Join our WhatsApp Channel&rdquo; box on the website.</p>}
    </div>
  )
}
