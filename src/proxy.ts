import { NextResponse, type NextRequest } from 'next/server'

// Quick check only: no Supabase session cookie → send to the admin login.
// Every admin page and action still verifies the user properly on the server.
export function proxy(req: NextRequest) {
  const hasSession = req.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('auth-token'))
  if (!hasSession) return NextResponse.redirect(new URL('/admin/login', req.url))
  return NextResponse.next()
}

export const config = { matcher: ['/admin', '/admin/((?!login).*)'] }
