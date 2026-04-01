import Link from 'next/link';
import AuthCard from '../../components/AuthCard';

export const metadata = { title: 'Check Your Email — HomeBites' };

export default function VerifyEmailPage() {
  return (
    <AuthCard>
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-4xl">
          📬
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-slate-900">Check your inbox</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            We&apos;ve sent a confirmation link to your email address. Click it to activate your account.
          </p>
        </div>
        <p className="text-xs text-slate-400">
          Already confirmed?{' '}
          <Link href="/auth/signin" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
