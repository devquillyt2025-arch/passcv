import { type NextRequest, NextResponse } from 'next/server'

// Auth is bypassed for local development — swap this back in when Supabase is configured:
// import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(_request: NextRequest) {
  // Skip auth check: allow all routes through without a session.
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
