'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCard, { AuthDivider, GoogleButton } from '../../components/AuthCard';
import { createClient } from '../../lib/supabase';

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 ' +
  'focus:ring-amber-100 transition-colors';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push('/');
    router.refresh();
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <AuthCard>
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-500">Sign in to your HomeBites account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email</label>
          <input
            id="email" type="email" required autoComplete="email"
            placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
            <Link href="/auth/forgot-password" className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors">
              Forgot password?
            </Link>
          </div>
          <input
            id="password" type="password" required autoComplete="current-password"
            placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            className={inputCls}
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60"
          style={{ backgroundColor: '#1a3a2a' }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <AuthDivider />
      <GoogleButton onClick={handleGoogle} />

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-semibold text-amber-600 hover:text-amber-700 transition-colors">
          Sign up free
        </Link>
      </p>
    </AuthCard>
  );
}
