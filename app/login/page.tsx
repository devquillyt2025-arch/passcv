import { login } from '@/app/auth/actions'
import Link from 'next/link'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold text-indigo-700 tracking-tight">
          TailorCV
        </Link>
        <h1 className="text-2xl font-semibold mt-6">Welcome back</h1>
        <p className="text-gray-500 text-sm mt-2">Log in to your account to continue</p>
      </div>

      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <label className="text-md font-medium text-gray-700" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
          name="email"
          placeholder="you@example.com"
          required
        />
        <label className="text-md font-medium text-gray-700" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        
        <button
          formAction={login}
          className="bg-indigo-600 rounded-md px-4 py-2 text-white font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors mb-2"
        >
          Sign In
        </button>

        {searchParams?.message && (
          <p className="mt-4 p-4 bg-red-50 text-red-600 text-center rounded-md">
            {searchParams.message}
          </p>
        )}

        <div className="text-center mt-4 text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  )
}
