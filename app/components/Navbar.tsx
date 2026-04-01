'use client';

import { useState } from 'react';
import Link from 'next/link';
import CartIcon from './CartIcon';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="shrink-0 bg-white shadow-md z-20 sticky top-0">
      {/* Main bar */}
      <div className="h-14 md:h-16 flex items-center px-4 md:px-6 gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-1">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white text-sm md:text-base" style={{ backgroundColor: '#1a3a2a' }}>
            🍱
          </div>
          <span className="font-bold text-base md:text-lg tracking-tight" style={{ color: '#1a3a2a' }}>
            Home<span style={{ color: '#f59e0b' }}>Bites</span>
          </span>
        </Link>

        {/* Search — hidden on mobile, visible md+ */}
        <div className="hidden md:flex flex-1 max-w-lg mx-auto">
          <div className="relative w-full">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 10.825a5.825 5.825 0 1 1-11.65 0 5.825 5.825 0 0 1 11.65 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search baked goods, jams, matcha…"
              className="w-full pl-11 pr-5 py-2.5 text-sm rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-300 focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Spacer on mobile */}
        <div className="flex-1 md:hidden" />

        {/* Mobile: search icon link */}
        <Link href="/search" className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 10.825a5.825 5.825 0 1 1-11.65 0 5.825 5.825 0 0 1 11.65 0z" />
          </svg>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <CartIcon />

          {/* Desktop actions */}
          <Link
            href="/auth/signin"
            className="hidden md:block text-sm font-semibold px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/post"
            className="hidden md:block text-sm font-semibold px-4 py-2 rounded-full text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#1a3a2a' }}
          >
            Share a Bite
          </Link>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link
            href="/post"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 w-full rounded-xl py-2.5 px-4 text-sm font-bold text-white text-center justify-center transition-colors hover:opacity-90"
            style={{ backgroundColor: '#1a3a2a' }}
          >
            🍱 Share a Bite
          </Link>
          <Link
            href="/auth/signin"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 w-full rounded-xl py-2.5 px-4 text-sm font-semibold text-gray-700 border border-gray-200 text-center justify-center hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
          <div className="border-t border-gray-100 pt-2 space-y-1">
            {[
              { href: '/', label: '🏠 Home' },
              { href: '/search', label: '🔍 Search' },
              { href: '/messages', label: '💬 Messages' },
              { href: '/profile/me', label: '👤 My Profile' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
