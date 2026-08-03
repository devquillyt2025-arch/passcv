'use client';

import Link from 'next/link';
import { useState } from 'react';
import { login } from '@/app/auth/actions';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calls the `login` server action. This used to be `router.push('/dashboard')`
   * with no authentication at all — the form was decorative, no session was ever
   * created, and the middleware bounced the user straight back to /login.
   *
   * Deliberately not wrapped in try/catch: on success the action calls
   * `redirect()`, which throws NEXT_REDIRECT for Next to handle. Catching here
   * would swallow the navigation and look like a failed sign-in.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(new FormData(e.currentTarget));

    // Only reached when the action returned instead of redirecting, i.e. on failure.
    if (result && 'error' in result) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="text-xl font-bold text-indigo-700 tracking-tight">
          FolioX
        </Link>
        <span className="text-sm text-gray-500">
          No account?{' '}
          <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">
            Sign up free
          </Link>
        </span>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-2">Sign in to your account to continue</p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                placeholder="you@example.com"
                className="w-full rounded-lg px-3.5 py-2.5 bg-white border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full rounded-lg px-3.5 py-2.5 bg-white border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 rounded-lg px-4 py-2.5 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <footer className="border-t border-gray-200 py-5 px-6 text-center text-xs text-gray-400">
        FolioX · Resumes are processed securely and never shared
      </footer>
    </div>
  );
}
