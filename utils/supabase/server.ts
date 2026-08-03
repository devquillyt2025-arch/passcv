import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers';

/**
 * `cookies()` became async in Next 15. The upgrade codemod had left the old
 * synchronous call wrapped in a `UnsafeUnwrappedCookies` cast — a temporary
 * migration shim that Next 16 removes, so the cast no longer compiles.
 * Awaiting it properly is the actual migration; every call site was already
 * inside an async function.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
