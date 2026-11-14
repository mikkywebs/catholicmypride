import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ContentType } from './content-types'
import type { Diocese } from './types'

/** Extra lists some editors need: dioceses for parishes. */
export async function loadFormOptions(db: SupabaseClient, t: ContentType) {
  const needs = (type: string) => t.fields.some((f) => f.type === type)
  const dioceses = needs('diocese') ? await db.from('dioceses').select('id, name, kind, continent, country, province').order('name') : { data: [] }
  return { dioceses: (dioceses.data ?? []) as Diocese[] }
}
