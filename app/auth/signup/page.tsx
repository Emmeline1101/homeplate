import Link from 'next/link';
import AuthCard, { AuthDivider, AuthInput, GoogleButton } from '../../components/AuthCard';

export const metadata = {
  title: 'Create Account — HomePlate',
};

export default function SignUpPage() {
  return (
    <AuthCard>
      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500">
          Join HomePlate and start sharing homemade meals.
        </p>
      </div>

      {/* Form */}
      <form className="space-y-4">
        <AuthInput
          label="Full name"
          id="name"
          type="text"
          placeholder="Jane Smith"
          autoComplete="name"
        />
        <AuthInput
          label="Email"
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <AuthInput
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
        />
        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700">
            Confirm password
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
          />
        </div>

        {/* Terms */}
        <p className="text-xs text-slate-400 leading-relaxed">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-slate-600 transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-slate-600 transition-colors">
            Privacy Policy
          </Link>
          .
        </p>

        <button
          type="submit"
          className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-2.5 text-sm shadow-sm shadow-orange-100 transition-colors"
        >
          Create Account
        </button>
      </form>

      <AuthDivider />

      <GoogleButton />

      {/* Sign in link */}
      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link
          href="/auth/signin"
          className="font-semibold text-orange-500 hover:text-orange-600 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
