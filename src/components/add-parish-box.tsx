import { ButtonLink } from './ui'

/** “Is your parish missing?” call to action on every directory page. */
export function AddParishBox({ href, text = 'Help Catholics find Mass. Send us your parish’s address and Mass times, and we will add it after a quick check.' }: { href: string; text?: string }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-gold bg-surface p-6">
      <div className="min-w-0 flex-1 basis-72"><h2 className="m-0 font-serif text-[26px] font-semibold">Is your parish missing?</h2><p className="m-0 text-muted">{text}</p></div>
      <ButtonLink href={href}>➕ Add your parish</ButtonLink>
    </section>
  )
}
