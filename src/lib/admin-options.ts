import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ContentType } from './content-types'
import type { Diocese } from './types'
import { allRows } from './supabase/all-rows'

/** Extra lists some editors need: dioceses (with deaneries) for parishes, provinces for dioceses. */
export async function loadFormOptions(db: SupabaseClient, t: ContentType) {
  const needsDioceses = t.fields.some((f) => f.type === 'diocese')
  const needsProvinces = t.fields.some((f) => f.type === 'place' && f.provinceName)
  const [dioceses, regions, used] = await Promise.all([
    needsDioceses ? allRows((a, b) => db.from('dioceses').select('id, name, kind, continent, country, province, address, map_url, deaneries').order('name').order('id').range(a, b)) : { data: [] },
    needsProvinces ? allRows((a, b) => db.from('directory_regions').select('country, province, province_list').order('id').range(a, b)) : { data: [] },
    needsProvinces ? allRows((a, b) => db.from('dioceses').select('country, province').order('id').range(a, b)) : { data: [] },
  ])
  const provinces: Record<string, Set<string>> = {}
  const add = (country: string, p: string | null | undefined) => { if (p?.trim()) (provinces[country] ??= new Set()).add(p.trim()) }
  for (const r of (regions.data ?? []) as { country: string; province: string | null; province_list: string[] | null }[]) {
    add(r.country, r.province)
    for (const p of r.province_list ?? []) add(r.country, p)
  }
  for (const d of (used.data ?? []) as { country: string; province: string | null }[]) add(d.country, d.province)
  return {
    dioceses: (dioceses.data ?? []) as Diocese[],
    provinces: Object.fromEntries(Object.entries(provinces).map(([c, s]) => [c, [...s].sort((a, b) => a.localeCompare(b))])),
  }
}
