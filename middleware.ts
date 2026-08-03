import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

/**
 * Auth enforcement. `updateSession` refreshes the Supabase session cookie and
 * redirects unauthenticated requests for protected routes to /login.
 *
 * This previously returned `NextResponse.next()` unconditionally with the
 * import commented out, which left every route public regardless of session —
 * the "Auth Middleware Bypass" logged as Critical #1 in FOLIOX_BUG_AUDIT.md.
 *
 * Development still bypasses, so protected routes stay reachable without a
 * Supabase session while working locally. The practical consequence is that
 * enforcement cannot be verified with `next dev` — it only exists in a
 * production build (`next build && next start`).
 */
export async function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
