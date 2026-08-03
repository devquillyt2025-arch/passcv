'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

/**
 * Result of an auth attempt.
 *
 * These actions return the failure to the caller instead of redirecting to
 * `?message=Could not authenticate user`. That redirect discarded Supabase's
 * actual reason — a wrong password, an unconfirmed email and a rate limit all
 * produced the same sentence — and nothing rendered the query parameter
 * anyway, so failures were silent.
 *
 * Success still redirects, so callers never receive a "success" value: on the
 * happy path `redirect()` throws NEXT_REDIRECT and control leaves the action.
 * Do not wrap these calls in try/catch — that swallows the redirect.
 */
export type AuthResult = { error: string } | { notice: string }

export async function login(formData: FormData): Promise<AuthResult | never> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Enter both your email and password.' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData): Promise<AuthResult | never> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Enter both your email and password.' }
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  // With email confirmation enabled, signUp succeeds but issues no session.
  // Redirecting to /dashboard here would bounce straight back off the
  // middleware, which reads to the user as "signup silently failed".
  if (!data.session) {
    return { notice: 'Check your email to confirm your account, then sign in.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
