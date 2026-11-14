import 'server-only'
import { redirect } from 'next/navigation'
import { serverClient } from './supabase/server'

/** Every admin page and action calls this. Not signed in, or not an admin → login. */
export async function requireAdmin() {
  const db = await serverClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) redirect('/admin/login')
  const { data } = await db.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!data) redirect('/admin/login?error=not-admin')
  return { db, user }
}
