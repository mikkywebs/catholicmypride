import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ContentType } from './content-types'
import type { Diocese } from './types'

/** Extra lists some editors need: dioceses for parishes, songs for playlists. */
export async function loadFormOptions(db: SupabaseClient, t: ContentType) {
  const needs = (type: string) => t.fields.some((f) => f.type === type)
  const [dioceses, songs] = await Promise.all([
    needs('diocese') ? db.from('dioceses').select('id, name, kind, continent, country, province').order('name') : Promise.resolve({ data: [] }),
    needs('playlist') ? db.from('songs').select('id, title, kind').eq('status', 'published').not('audio_url', 'is', null).order('title') : Promise.resolve({ data: [] }),
  ])
  return { dioceses: (dioceses.data ?? []) as Diocese[], songs: (songs.data ?? []) as { id: string; title: string; kind: string }[] }
}
