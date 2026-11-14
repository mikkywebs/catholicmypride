import { SettingsForm } from '@/components/admin/settings-form'
import { requireAdmin } from '@/lib/admin'
import type { Settings } from '@/lib/types'

export default async function Page() {
  const { db } = await requireAdmin()
  const [{ data: s }, { data: imgs }] = await Promise.all([
    db.from('settings').select('*').eq('id', 1).single(),
    db.from('homepage_images').select('*'),
  ])
  const images = Object.fromEntries((imgs ?? []).map((r) => [r.key, { url: r.url, alt: r.alt }]))
  return (
    <div className="flex flex-col gap-5">
      <h1 className="m-0 font-serif text-[38px] font-semibold">Site settings</h1>
      <SettingsForm s={s as Settings} images={images} />
    </div>
  )
}
