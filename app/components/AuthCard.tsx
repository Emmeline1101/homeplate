import Link from 'next/link';

// ── Auth page shell ───────────────────────────────────────────────────────────

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f7f4ef' }}>

      {/* Left — brand panel (desktop only) */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] shrink-0 p-12"
        style={{ backgroundColor: '#1a3a2a' }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-xl">🍱</div>
          <span className="text-white font-bold text-xl tracking-tight">
            Home<span style={{ color: '#f59e0b' }}>Bites</span>
          </span>
        </Link>

        {/* Center copy */}
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/40">Asian Cottage Food</p>
            <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Handmade with care.<br />Less sweet,<br />more soul.
            </h2>
          </div>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            A community marketplace for Asian cottage food makers — matcha cakes, mochi, yuzu jams, and more.
          </p>

          {/* Testimonial */}
          <div className="border-l-2 border-amber-400/60 pl-4">
            <p className="text-white/80 text-sm italic leading-relaxed">
              {'"Finally found someone who makes egg tarts that aren\'t overly sweet. This community is a treasure."'}
            </p>
            <p className="text-white/40 text-xs mt-2 font-semibold">— Sandra K., San Francisco</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/30 text-xs">© 2026 HomeBites · CA Cottage Food Compliant</p>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl text-white" style={{ backgroundColor: '#1a3a2a' }}>🍱</div>
          <span className="font-bold text-xl tracking-tight" style={{ color: '#1a3a2a' }}>
            Home<span style={{ color: '#f59e0b' }}>Bites</span>
          </span>
        </Link>

        {/* Card */}
        <div className="w-full max-w-sm bg-white rounded-3xl border border-black/[0.06] shadow-lg shadow-black/[0.04] p-8 space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

export function AuthDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-100" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-white px-3 text-gray-400 font-medium">or continue with</span>
      </div>
    </div>
  );
}

export function GoogleButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition-colors shadow-sm"
    >
      <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Continue with Google
    </button>
  );
}

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-amber-400 focus:ring-2 ' +
  'focus:ring-amber-100 transition-all';

export function AuthInput({
  label, id, type = 'text', placeholder, autoComplete,
}: {
  label: string; id: string; type?: string; placeholder?: string; autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700">{label}</label>
      <input id={id} name={id} type={type} placeholder={placeholder} autoComplete={autoComplete} className={inputCls} />
    </div>
  );
}
