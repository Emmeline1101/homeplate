'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthCard from '../../components/AuthCard';
import { createClient } from '../../lib/supabase';

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 ' +
  'focus:ring-amber-100 transition-colors';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/auth/reset-password`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  }

  return (
    <AuthCard>
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900">Forgot your password?</h1>
        <p className="text-sm text-slate-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {sent ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            Check your inbox — a reset link has been sent to <strong>{email}</strong>.
          </div>
          <p className="text-center text-sm text-slate-500">
            Didn&apos;t receive it?{' '}
            <button
              onClick={() => setSent(false)}
              className="font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Try again
            </button>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputCls}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: '#1a3a2a' }}
          >
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-slate-500">
        Remember your password?{' '}
        <Link href="/auth/signin" className="font-semibold text-amber-600 hover:text-amber-700 transition-colors">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
