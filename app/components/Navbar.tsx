'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CartIcon from './CartIcon';
import { createClient } from '../lib/supabase';

type UserInfo = { name: string; email: string } | null;

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<UserInfo>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          name: data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'Me',
          email: data.user.email ?? '',
        });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'Me',
          email: session.user.email ?? '',
        });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfileOpen(false);
    router.push('/');
    router.refresh();
  }

  const initial = user?.name?.[0]?.toUpperCase() ?? '?';

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

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          <Link href="/discover" className="px-3 py-1.5 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors font-medium">
            Discover
          </Link>
          <Link href="/blog" className="px-3 py-1.5 rounded-full text-sm text-gray-600 hover:bg-gray-100 transition-colors font-medium">
            Blog
          </Link>
        </div>

        {/* Search bar — desktop */}
        <div className="hidden md:flex flex-1 max-w-lg mx-auto">
          <Link href="/search" className="relative w-full group">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 10.825a5.825 5.825 0 1 1-11.65 0 5.825 5.825 0 0 1 11.65 0z" />
            </svg>
            <div className="w-full pl-11 pr-5 py-2.5 text-sm rounded-full border border-gray-200 bg-gray-50 group-hover:bg-white group-hover:border-gray-300 transition-all text-gray-400 cursor-text">
              Search baked goods, jams, matcha…
            </div>
          </Link>
        </div>

        {/* Spacer on mobile */}
        <div className="flex-1 md:hidden" />

        {/* Mobile search icon */}
        <Link href="/search" className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 10.825a5.825 5.825 0 1 1-11.65 0 5.825 5.825 0 0 1 11.65 0z" />
          </svg>
        </Link>

        {/* Right-side actions */}
        <div className="flex items-center gap-2 shrink-0">
          <CartIcon />

          {user ? (
            <>
              {/* Messages icon — desktop */}
              <Link
                href="/messages"
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Messages"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>

              {/* Share a Bite — desktop */}
              <Link
                href="/post"
                className="hidden md:block text-sm font-semibold px-4 py-2 rounded-full text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: '#1a3a2a' }}
              >
                Share a Bite
              </Link>

              {/* Avatar / profile dropdown — desktop */}
              <div className="hidden md:block relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all hover:ring-2 hover:ring-amber-400 hover:ring-offset-1"
                  style={{ backgroundColor: '#1a3a2a' }}
                  aria-label="My profile"
                >
                  {initial}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    {/* User info */}
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    {[
                      { href: '/profile/me', label: '👤 My Profile' },
                      { href: '/discover', label: '✨ Discover' },
                      { href: '/messages', label: '💬 Messages' },
                      { href: '/post', label: '🍱 Share a Bite' },
                    ].map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Not signed in — desktop */}
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
            </>
          )}

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
          {user ? (
            <>
              {/* User info strip */}
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl mb-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: '#1a3a2a' }}>
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <Link href="/post" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 px-4 text-sm font-bold text-white hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#1a3a2a' }}>
                🍱 Share a Bite
              </Link>
              <div className="border-t border-gray-100 pt-2 space-y-1">
                {[
                  { href: '/', label: '🏠 Home' },
                  { href: '/discover', label: '✨ Discover' },
                  { href: '/search', label: '🔍 Search' },
                  { href: '/blog', label: '📝 Blog' },
                  { href: '/messages', label: '💬 Messages' },
                  { href: '/profile/me', label: '👤 My Profile' },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    {label}
                  </Link>
                ))}
                <button onClick={() => { handleSignOut(); setMenuOpen(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/post" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 px-4 text-sm font-bold text-white hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#1a3a2a' }}>
                🍱 Share a Bite
              </Link>
              <Link href="/auth/signin" onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 px-4 text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                Sign In
              </Link>
              <div className="border-t border-gray-100 pt-2 space-y-1">
                {[
                  { href: '/', label: '🏠 Home' },
                  { href: '/discover', label: '✨ Discover' },
                  { href: '/search', label: '🔍 Search' },
                  { href: '/blog', label: '📝 Blog' },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                    {label}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
