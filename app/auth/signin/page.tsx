import Link from 'next/link';
import AuthCard, { AuthDivider, AuthInput, GoogleButton } from '../../components/AuthCard';

export const metadata = {
  title: 'Sign In — HomePlate',
};

export default function SignInPage() {
  return (
    <AuthCard>
      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-500">Sign in to your HomePlate account.</p>
      </div>

      {/* Form */}
      <form className="space-y-4">
        <AuthInput
          label="Email"
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-2.5 text-sm shadow-sm shadow-orange-100 transition-colors"
        >
          Sign In
        </button>
      </form>

      <AuthDivider />

      <GoogleButton />

      {/* Sign up link */}
      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/signup"
          className="font-semibold text-orange-500 hover:text-orange-600 transition-colors"
        >
          Sign up free
        </Link>
      </p>
    </AuthCard>
  );
}
