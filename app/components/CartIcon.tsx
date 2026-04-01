'use client';

import { useCart } from '../lib/cartStore';

export default function CartIcon({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const { totalItems, openDrawer } = useCart();

  return (
    <button
      onClick={openDrawer}
      className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-95"
      style={variant === 'light'
        ? { backgroundColor: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(10px)' }
        : undefined}
      aria-label="Open cart"
    >
      <svg className={`w-5 h-5 ${variant === 'light' ? 'text-white' : 'text-gray-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {totalItems > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1"
          style={{ backgroundColor: '#1a3a2a' }}
        >
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </button>
  );
}
