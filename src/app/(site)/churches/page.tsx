import type { Metadata } from 'next'
import { ChurchFinder } from '@/components/church-finder'
import { ButtonLink, EmptyState, Eyebrow, H1 } from '@/components/ui'
import { getChurches, getDirectoryRegions } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Catholic Parish Directory',
  description: 'Find Catholic parishes by continent, country, ecclesiastical province, archdiocese or diocese and deanery, with addresses and directions.',
  alternates: { canonical: '/churches' },
}

export default async function Page() {
  const [churches, regions] = await Promise.all([getChurches(), getDirectoryRegions()])
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-8 px-6 pb-[72px] pt-10">
      <div className="text-center"><Eyebrow>Directory</Eyebrow><H1 className="mt-2">Find a Catholic Parish</H1><p className="mx-auto mt-3 max-w-xl text-muted">Browse by continent, country, province, diocese and deanery.</p></div>
      {churches.length === 0 ? <EmptyState>The directory is being prepared.</EmptyState> : <ChurchFinder churches={churches} regions={regions} />}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-6">
        <div><h2 className="m-0 font-serif text-[26px] font-semibold">Is a parish missing?</h2><p className="m-0 text-muted">Send us its name and address and we will add it.</p></div>
        <ButtonLink href="/contact?subject=Suggest%20a%20church" variant="outline">Suggest a parish</ButtonLink>
      </section>
    </div>
  )
}
