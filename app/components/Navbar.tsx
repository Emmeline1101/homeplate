import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="shrink-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center px-5 gap-4 z-10 sticky top-0">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-lg shadow-sm">
          🍽
        </div>
        <span className="font-bold text-slate-900 text-lg tracking-tight">
          Home<span className="text-orange-500">Plate</span>
        </span>
      </Link>

      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-4.35-4.35M16.65 10.825a5.825 5.825 0 1 1-11.65 0 5.825 5.825 0 0 1 11.65 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search dishes, cuisines, or cooks…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-full border border-transparent focus:outline-none focus:border-orange-300 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/post"
          className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 px-3 py-2 rounded-full hover:bg-orange-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Post a meal
        </Link>
        <Link
          href="/auth/signin"
          className="bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
        >
          Sign in
        </Link>
      </div>
    </nav>
  );
}
