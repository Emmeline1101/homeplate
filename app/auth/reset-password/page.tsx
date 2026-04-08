'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '../../components/AuthCard';
import { createClient } from '../../lib/supabase';

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 ' +
  'focus:ring-amber-100 transition-colors';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push('/auth/signin?reset=success');
  }

  return (
    <AuthCard>
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900">Set new password</h1>
        <p className="text-sm text-slate-500">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
            New Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm" className="block text-sm font-semibold text-slate-700">
            Confirm Password
          </label>
          <input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Repeat your new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
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
          {loading ? 'Saving…' : 'Update Password'}
        </button>
      </form>
    </AuthCard>
  );
}
