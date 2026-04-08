'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthCard, { AuthDivider, GoogleButton } from '../../components/AuthCard';
import { createClient } from '../../lib/supabase';

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 ' +
  'focus:ring-amber-100 transition-colors';

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<'account' | 'permit'>('account');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setStep('permit');
  }

  async function handlePermitSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();

    // 1. Create auth user
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (signUpErr || !data.user) {
      setLoading(false);
      setError(signUpErr?.message ?? 'Sign up failed. Please try again.');
      return;
    }

    // 2. Upload permit if provided
    if (permitFile) {
      const ext = permitFile.name.split('.').pop();
      const path = `${data.user.id}/permit.${ext}`;
      await supabase.storage.from('permit-docs').upload(path, permitFile, { upsert: true });
    }

    setLoading(false);
    router.push('/auth/verify-email');
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
      {step === 'account' ? (
        <>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900">Join HomeBites</h1>
            <p className="text-sm text-slate-500">Share Asian cottage food with your community.</p>
          </div>

          <form onSubmit={handleAccountSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700">Full name</label>
              <input id="name" type="text" required autoComplete="name" placeholder="Jane Smith"
                value={name} onChange={e => setName(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email</label>
              <input id="email" type="email" required autoComplete="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
              <input id="password" type="password" required autoComplete="new-password" placeholder="Min. 8 characters"
                value={password} onChange={e => setPassword(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="block text-sm font-semibold text-slate-700">Confirm password</label>
              <input id="confirm" type="password" required autoComplete="new-password" placeholder="••••••••"
                value={confirm} onChange={e => setConfirm(e.target.value)} className={inputCls} />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <p className="text-xs text-slate-400 leading-relaxed">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="underline underline-offset-2">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>.
            </p>

            <button type="submit" className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-colors"
              style={{ backgroundColor: '#1a3a2a' }}>
              Continue →
            </button>
          </form>

          <AuthDivider />
          <GoogleButton onClick={handleGoogle} />

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-semibold text-amber-600 hover:text-amber-700 transition-colors">
              Sign in
            </Link>
          </p>
        </>
      ) : (
        <>
          {/* Step 2: Permit upload */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <button onClick={() => setStep('account')} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs text-slate-400 font-medium">Step 2 of 2</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Cottage Food Permit</h1>
            <p className="text-sm text-slate-500">
              California requires a Cottage Food Permit to sell food. Upload yours to unlock posting.
            </p>
          </div>

          {/* Permit info box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
            <p className="font-semibold">What counts as a valid permit?</p>
            <p>• California Cottage Food Operator registration (Class A or B)</p>
            <p>• Local county health permit for cottage food</p>
            <p className="text-amber-600 mt-1">Don&apos;t have one yet? <Link href="https://www.cdph.ca.gov/Programs/CEH/DFDCS/CDFD/Pages/FDBPrograms/FoodSafetyProgram/CottageFoodOperations.aspx" className="underline underline-offset-2" target="_blank">Learn how to get it →</Link></p>
          </div>

          <form onSubmit={handlePermitSubmit} className="space-y-4">
            {/* Permit upload */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Upload permit (optional for now)</p>
              <div
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 cursor-pointer hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
              >
                {permitFile ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl">✅</div>
                    <p className="text-sm font-medium text-slate-700">{permitFile.name}</p>
                    <p className="text-xs text-slate-400">Click to replace</p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">📄</div>
                    <p className="text-sm font-medium text-slate-700">PDF, JPG, or PNG — up to 10 MB</p>
                    <p className="text-xs text-slate-400">You can add this later from your profile</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".pdf,image/jpeg,image/png" className="sr-only"
                onChange={e => setPermitFile(e.target.files?.[0] ?? null)} />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#1a3a2a' }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>

            <button type="button" onClick={handlePermitSubmit} disabled={loading}
              className="w-full text-sm text-slate-400 hover:text-slate-600 transition-colors py-1">
              Skip for now
            </button>
          </form>
        </>
      )}
    </AuthCard>
  );
}
