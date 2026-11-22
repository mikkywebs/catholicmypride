import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase/server'

/** Tells the public site whether the visitor is signed in as an admin (to show "Edit this page"). */
export async function GET() {
  try {
    const db = await serverClient()
    const { data: { user } } = await db.auth.getUser()
    if (!user) return NextResponse.json({ admin: false })
    const { data } = await db.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle()
    return NextResponse.json({ admin: !!data }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return NextResponse.json({ admin: false })
  }
}
