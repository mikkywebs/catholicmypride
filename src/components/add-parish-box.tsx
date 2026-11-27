import { ButtonLink } from './ui'

/** “Add your parish” invitation on every directory page. The directory is being built, so it asks
 *  parishes to list themselves, naming the place (good for readers and for search). */
export function AddParishBox({ href, place, first = false }: { href: string; place?: string; first?: boolean }) {
  const where = place ? ` in ${place}` : ''
  return (
    <section aria-labelledby="add-parish" className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border-2 border-gold bg-surface p-6">
      <div className="flex min-w-0 flex-1 basis-80 flex-col gap-2">
        <h2 id="add-parish" className="m-0 font-serif text-[26px] font-semibold leading-tight">
          {first ? `Be the first parish listed${where}` : `Add your Catholic parish${where}`}
        </h2>
        <p className="m-0 text-muted">
          We are building a free directory of every Catholic parish{where || ' in the world'}. List your parish with its address, Mass times and contact details, so Catholics nearby, visitors and newcomers can find it on Google and with “Parishes near me”.
        </p>
        <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-[14px] font-semibold">
          <li>✓ Free to list</li><li>✓ Parishioners and parish staff welcome</li><li>✓ Checked before it appears</li>
        </ul>
      </div>
      <ButtonLink href={href}>➕ Add your parish</ButtonLink>
    </section>
  )
}
