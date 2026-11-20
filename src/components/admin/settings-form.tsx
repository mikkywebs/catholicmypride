'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { saveSettings, type FormState } from '@/app/admin/actions'
import type { Settings } from '@/lib/types'
import { BrandIcon, BRANDS } from '../icons'
import { ImageUpload } from './upload'
import { ExtraSocialField } from './extra-social'

const input = 'min-h-11 w-full rounded-lg border border-field bg-surface px-3 py-2.5 font-normal text-ink'
const card = 'flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6'

function T({ name, label, s, type = 'text', help, rows }: { name: keyof Settings; label: string; s: Settings; type?: string; help?: string; rows?: number }) {
  const v = (s[name] ?? '') as string
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">{label}
      {rows ? <textarea name={name} rows={rows} defaultValue={v} className={`${input} resize-y`} /> : <input name={name} type={type} defaultValue={v} className={input} />}
      {help && <span className="text-[13px] font-normal text-muted">{help}</span>}
    </label>
  )
}

export function SettingsForm({ s, images }: { s: Settings; images: Record<string, { url: string; alt: string | null }> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettings, null)
  return (
    <form action={action} className="flex flex-wrap items-start gap-6">
      <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-6">
        <section className={card}>
          <h2 className="m-0 text-xl">Logo &amp; name</h2>
          <ImageUpload name="logo_url" label="Site logo (square, at least 512 × 512)" shape="square" initial={s.logo_url} />
          <p className="m-0 text-[13px] text-muted">Leave empty to use the built-in logo. Also used as the browser icon and default share image.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 text-sm font-semibold">Site name<span className="flex min-h-11 items-center rounded-lg border border-line bg-bg px-3 font-normal text-muted">Catholic My Pride</span></div>
            <div className="flex flex-col gap-1.5 text-sm font-semibold">Tagline<span className="flex min-h-11 items-center rounded-lg border border-line bg-bg px-3 font-normal text-muted">Apostolate</span></div>
          </div>
          <p className="m-0 -mt-2 text-[13px] text-muted">The site name and tagline are fixed.</p>
          <T name="mission" label="Mission line (footer)" s={s} rows={2} />
        </section>
        <section className={card}>
          <h2 className="m-0 text-xl">Default images</h2>
          <p className="m-0 -mt-2 text-sm text-muted">Used on every day that has no image of its own. You can still give any single day its own image.</p>
          <ImageUpload name="default_reading_image" label="Mass readings and reflection" shape="16:9" initial={s.default_reading_image} altName="default_reading_alt" altInitial={s.default_reading_alt} />
          <ImageUpload name="default_prayer_image" label="Daily prayer" shape="16:9" initial={s.default_prayer_image} altName="default_prayer_alt" altInitial={s.default_prayer_alt} />
        </section>
        <section className={card}>
          <h2 className="m-0 text-xl">Home page</h2>
          <ImageUpload name="img_hero" label="Hero image" shape="16:9" initial={images.hero?.url ?? s.hero_image_url} altName="img_hero_alt" altInitial={images.hero?.alt} />
          <T name="hero_title" label="Hero heading" s={s} />
          <T name="hero_subtitle" label="Hero text" s={s} rows={2} />
          <ImageUpload name="img_prayer" label="Prayer request section image" shape="16:9" initial={images.prayer?.url} altName="img_prayer_alt" altInitial={images.prayer?.alt} />
        </section>
        <section className={card}>
          <h2 className="m-0 text-xl">About page</h2>
          <ImageUpload name="about_image_url" label="About image" shape="16:9" initial={s.about_image_url} />
          <T name="about_story_title" label="Our story: heading" s={s} />
          <T name="about_story_md" label="Our story: text" s={s} rows={8} help="Markdown formatting works here." />
        </section>
      </div>
      <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-6">
        <section className={card}>
          <h2 className="m-0 text-xl">Social media</h2>
          <label className="flex flex-col gap-1.5 rounded-xl bg-[#25D366]/10 p-3 text-sm font-semibold">
            <span className="flex items-center gap-2"><BrandIcon icon={BRANDS.whatsapp} size={16} />WhatsApp Channel link</span>
            <input name="whatsapp_channel_url" type="url" defaultValue={s.whatsapp_channel_url ?? ''} placeholder="https://whatsapp.com/channel/..." className={input} />
            <span className="text-[13px] font-normal text-muted">In WhatsApp: open your channel → tap its name → Share → Copy link. A &ldquo;Join our WhatsApp Channel&rdquo; box then appears after every post, reading, saint and prayer.</span>
          </label>
          <p className="m-0 text-sm text-muted">Leave a box empty and that icon won&apos;t appear anywhere on the site.</p>
          {([['youtube_url', 'YouTube', BRANDS.youtube], ['facebook_url', 'Facebook', BRANDS.facebook], ['tiktok_url', 'TikTok', BRANDS.tiktok], ['x_url', 'X (Twitter)', BRANDS.x]] as const).map(([n, l, icon]) => (
            <label key={n} className="flex flex-col gap-1.5 text-sm font-semibold">
              <span className="flex items-center gap-2"><BrandIcon icon={icon} size={16} color={n === 'x_url' || n === 'tiktok_url' ? 'currentColor' : undefined} />{l}</span>
              <input name={n} type="url" defaultValue={s[n] ?? ''} className={input} />
            </label>
          ))}
          <ExtraSocialField initial={Array.isArray(s.extra_social) ? s.extra_social : []} />
        </section>
        <section className={card}>
          <h2 className="m-0 text-xl">Contact</h2>
          <T name="contact_email" label="Email" s={s} type="email" />
          <T name="contact_phone" label="Phone / WhatsApp (optional)" s={s} />
          <T name="contact_address" label="Address (optional)" s={s} rows={2} />
        </section>
        <section className={card}>
          <h2 className="m-0 text-xl">Donations</h2>
          <T name="donate_url" label="Online giving link (e.g. Selar)" s={s} type="url" />
          <ImageUpload name="img_donate" label="Donate page image" shape="16:9" initial={images.donate?.url} altName="img_donate_alt" altInitial={images.donate?.alt} />
          <T name="donate_needs_md" label="Current needs / recent outreach (optional)" s={s} rows={4} />
          <div className="grid gap-4 sm:grid-cols-2"><T name="bank_account_name" label="Account name" s={s} /><T name="bank_name" label="Bank" s={s} /></div>
          <T name="bank_account_number" label="Account number" s={s} help="Bank details only show on the Donate page when filled in." />
        </section>
        <section className={card}>
          <h2 className="m-0 text-xl">Seasonal decorations</h2>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">Decorate the website for the Church season
            <select name="seasonal_theme" defaultValue={s.seasonal_theme ?? 'auto'} className={input}>
              <option value="auto">Automatic: follow the Church calendar (recommended)</option>
              <option value="off">Off: no seasonal decorations</option>
              <option value="advent">Always show Advent</option>
              <option value="christmas">Always show Christmas</option>
              <option value="lent">Always show Lent</option>
              <option value="holyweek">Always show Holy Week</option>
              <option value="easter">Always show Easter</option>
              <option value="pentecost">Always show Pentecost</option>
            </select>
            <span className="text-[13px] font-normal text-muted">Automatic changes by itself every year: Advent wreath (one more candle each week), Christmas star, New Year blessing, a plain Lent, Holy Week, Easter and Pentecost. In Ordinary Time nothing is added. If you pick one season by hand, remember to set it back to Automatic.</span>
          </label>
        </section>
        <section className={card}>
          <h2 className="m-0 text-xl">Music bar</h2>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">When no playlist is scheduled, play
            <select name="music_fallback" defaultValue={s.music_fallback ?? 'songs'} className={input}>
              <option value="songs">All songs</option>
              <option value="audio">All audio messages &amp; prayers</option>
              <option value="all">Everything (songs and audio)</option>
              <option value="none">Nothing (hide the music bar)</option>
            </select>
            <span className="text-[13px] font-normal text-muted">Choose what plays and when in each item under <Link href="/admin/songs">Music &amp; Audio</Link>.</span>
          </label>
          <p className="m-0 text-[13px] text-muted">The music bar plays only when a visitor presses Play. It plays the list once and stops, and never repeats the same item by itself.</p>
        </section>
        <section className={card}>
          <h2 className="m-0 text-xl">Page views</h2>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">Show the view counter once a page has at least
            <input name="view_threshold" type="number" min={0} defaultValue={s.view_threshold} className={input} />
            <span className="text-[13px] font-normal text-muted">0 = always show (recommended). A higher number hides the counter on brand-new pages.</span>
          </label>
        </section>
        <div className="sticky bottom-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-lg">
          <button type="submit" disabled={pending} className="min-h-12 rounded-md bg-accent px-6 font-semibold text-accent-ink disabled:opacity-50">{pending ? 'Saving…' : 'Save settings'}</button>
          {state && <span role="status" className={`text-sm font-semibold ${state.ok ? 'text-[#1f5c38]' : 'text-[#b42318]'}`}>{state.message}</span>}
        </div>
      </div>
    </form>
  )
}
