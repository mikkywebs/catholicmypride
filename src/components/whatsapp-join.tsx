import { BrandIcon, BRANDS } from './icons'

/** "Join our WhatsApp Channel" box shown after posts. Hidden until the link is set in Settings. */
export function WhatsAppJoin({ url }: { url: string | null | undefined }) {
  if (!url) return null
  return (
    <aside className="reveal flex flex-wrap items-center gap-4 rounded-2xl border border-[#25D366]/40 bg-[#25D366]/10 px-5 py-4 sm:px-6">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"><BrandIcon icon={BRANDS.whatsapp} size={26} color="#ffffff" /></span>
      <div className="flex min-w-0 flex-1 basis-56 flex-col">
        <strong className="text-lg leading-snug">Join our WhatsApp Channel</strong>
        <span className="text-[15px] text-muted">Get the Mass readings, saint of the day and a daily prayer on your phone every morning.</span>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" className="rounded-md bg-[#25D366] px-5 py-2.5 font-semibold text-[#0b3d1f] no-underline hover:text-[#0b3d1f]">Join the channel</a>
    </aside>
  )
}
