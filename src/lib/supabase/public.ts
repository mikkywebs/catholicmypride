import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null | undefined

/**
 * Cookie-less client for public, cacheable reads.
 * Returns null when Supabase is not configured yet, so pages render
 * with every section hidden instead of crashing.
 */
export function publicClient(): SupabaseClient | null {
  if (client !== undefined) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
  return client
}
