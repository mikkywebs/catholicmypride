import type { Metadata } from 'next'
import { ButtonLink, Eyebrow, H1, H2, Prose } from '@/components/ui'
import { getHomeImages, getSettings } from '@/lib/data'
import { md } from '@/lib/format'
import { Featured } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Donate: Support Our Mission',
  description: 'Catholic My Pride has no sponsors. Your gift funds evangelism campaigns, outreach to families in need, and free prayers, songs and books.',
  alternates: { canonical: '/donate' },
}

const REASONS = [
  { title: 'No sponsors, only you', text: 'We run all our evangelism without any sponsorship. Your gifts are what keep this apostolate going.' },
  { title: 'Campaigns that reach many', text: 'We run regular faith campaigns online and in communities to bring people closer to Christ and His Church.' },
  { title: 'Tools that need renewing', text: 'Website hosting, software, music production and media equipment all carry costs that come back every year.' },
  { title: 'Reaching the downtrodden', text: 'We go out to people pushed to the margins of society, bringing them dignity, care and the hope of the Gospel.' },
  { title: 'Help where it is needed most', text: 'We extend practical help to families and communities in need, as the Lord asks of us in Matthew 25.' },
  { title: 'Free for everyone', text: 'Readings, prayers, novenas and songs stay free for all, because generous people cover the cost.' },
]
const USES = ['Evangelism campaigns and outreach events', 'Help for vulnerable people and families in need', 'Renewing hosting, software and media equipment', 'Creating new prayers, songs and ebooks']

export default async function Page() {
  const [s, images] = await Promise.all([getSettings(), getHomeImages()])
  const give = s.donate_url ?? '#ways'
  const bank = s.bank_account_number && s.bank_name
  return (
    <div className="flex flex-col">
      <section className="px-6 pb-14 pt-12">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-10">
          <div className="flex flex-1 basis-[440px] flex-col gap-4">
            <Eyebrow>Support our mission</Eyebrow>
            <H1>Every gift keeps the Gospel moving</H1>
            <p className="m-0 text-[19px] text-body">{s.site_name} has no sponsors. Everything we do, from daily readings and novenas to outreach in our communities, is carried by people like you.</p>
            <div className="flex flex-wrap gap-3 pt-1.5"><ButtonLink href={give} external>Give online</ButtonLink><ButtonLink href="#ways" variant="outline">Other ways to give</ButtonLink></div>
          </div>
          {images.donate && <div className="flex-1 basis-[420px]"><Featured src={images.donate.url} alt={images.donate.alt} priority /></div>}
        </div>
      </section>
      <section className="px-6 pb-16">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
          <H2 className="text-center">Why your support matters</H2>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            {REASONS.map((r, i) => (
              <article key={r.title} className="reveal flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-6">
                <span aria-hidden="true" className="flex size-[46px] items-center justify-center rounded-xl bg-accent-soft font-serif text-2xl font-bold text-accent">{i + 1}</span>
                <h3 className="m-0 font-serif text-[26px] font-semibold leading-tight">{r.title}</h3>
                <p className="m-0 text-muted">{r.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="reveal px-6 pb-16">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-8 rounded-[18px] bg-sky p-8 sm:p-10">
          <div className="flex flex-1 basis-[380px] flex-col gap-2.5">
            <Eyebrow>Your gift at work</Eyebrow>
            <H2>Where donations go</H2>
            {s.donate_needs_md && <Prose html={md(s.donate_needs_md)} className="!text-[17px]" />}
          </div>
          <ul className="m-0 flex flex-1 basis-[380px] list-none flex-col gap-3 p-0">
            {USES.map((u) => (
              <li key={u} className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-1 flex size-[22px] shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                </span>{u}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section id="ways" className="px-6 pb-[72px]">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
          <H2 className="text-center">Ways to give</H2>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            {s.donate_url && (
              <article className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-6">
                <h3 className="m-0 font-serif text-[26px] font-semibold">Give online</h3>
                <p className="m-0 flex-1 text-muted">Card, bank transfer or USSD through our secure giving page.</p>
                <ButtonLink href={s.donate_url} external className="self-start">Give now</ButtonLink>
              </article>
            )}
            {bank && (
              <article className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-6">
                <h3 className="m-0 font-serif text-[26px] font-semibold">Bank transfer</h3>
                <p className="m-0 text-body">{s.bank_account_name}<br />{s.bank_name}<br /><strong>{s.bank_account_number}</strong></p>
              </article>
            )}
            <article className="flex flex-col gap-2.5 rounded-2xl border border-line bg-surface p-6">
              <h3 className="m-0 font-serif text-[26px] font-semibold">Give your time and prayer</h3>
              <p className="m-0 flex-1 text-muted">Pray for our mission, share our content, or volunteer in an outreach.</p>
              <ButtonLink href="/contact?subject=Partnership" variant="outline" className="self-start">Get involved</ButtonLink>
            </article>
          </div>
          {s.contact_email && <p className="m-0 text-center text-muted">Questions about giving? Write to <a href={`mailto:${s.contact_email}`} className="font-semibold">{s.contact_email}</a></p>}
        </div>
      </section>
    </div>
  )
}
