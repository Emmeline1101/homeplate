import Link from 'next/link';
import CartIcon from './CartIcon';

export default function Navbar() {
  return (
    <nav className="shrink-0 h-16 bg-white shadow-md flex items-center px-6 gap-4 z-20 sticky top-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-base" style={{ backgroundColor: '#1a3a2a' }}>
          🍽
        </div>
        <span className="font-bold text-lg tracking-tight" style={{ color: '#1a3a2a' }}>
          Home<span style={{ color: '#f59e0b' }}>Plate</span>
        </span>
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-lg mx-auto">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 10.825a5.825 5.825 0 1 1-11.65 0 5.825 5.825 0 0 1 11.65 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search dishes, cuisines, neighborhoods…"
            className="w-full pl-11 pr-5 py-2.5 text-sm rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-300 focus:bg-white transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <CartIcon />
        <Link
          href="/auth/signin"
          className="text-sm font-semibold px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/post"
          className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: '#1a3a2a' }}
        >
          Share a Dish
        </Link>
      </div>
    </nav>
  );
}
