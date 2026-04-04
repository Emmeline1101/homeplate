'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, CartItem } from '../lib/cartStore';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

function fmtPickup(start: string) {
  return new Date(start).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

// ── Cart Item Row ─────────────────────────────────────────────────────────────

function ItemRow({ item }: { item: CartItem }) {
  const { removeItem, setQty } = useCart();

  return (
    <div className="flex gap-3 py-4 border-b border-gray-100 last:border-0">
      {/* Emoji */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ backgroundColor: '#f5f5f0' }}
      >
        {item.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1">{item.title}</p>
          <button
            onClick={() => removeItem(item.listingId)}
            className="shrink-0 text-gray-300 hover:text-red-400 transition-colors mt-0.5"
            aria-label="Remove"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{item.cook} · {item.cuisine}</p>
        <p className="text-xs text-gray-400">{fmtPickup(item.pickupStart)}</p>

        {/* Qty + subtotal */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setQty(item.listingId, item.quantity - 1)}
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-sm font-bold"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
            <button
              onClick={() => setQty(item.listingId, item.quantity + 1)}
              disabled={item.quantity >= item.maxPortions}
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          <p className="text-sm font-bold" style={{ color: item.price === 0 ? '#16a34a' : '#1a3a2a' }}>
            {item.price === 0 ? 'Free' : fmt(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────────

export default function CartDrawer() {
  const { items, totalItems, totalPrice, drawerOpen, closeDrawer } = useCart();
  const router = useRouter();

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const freeCount = items.filter(i => i.price === 0).length;
  const paidTotal = items.filter(i => i.price > 0).reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDrawer}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg" style={{ color: '#1a3a2a' }}>
            Your Cart
            {totalItems > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
            )}
          </h2>
          <button onClick={closeDrawer} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="text-5xl">🛒</div>
              <p className="text-sm font-medium text-gray-500">Your cart is empty</p>
              <button onClick={closeDrawer} className="text-sm font-semibold underline underline-offset-2" style={{ color: '#1a3a2a' }}>
                Browse dishes
              </button>
            </div>
          ) : (
            <div>
              {items.map(item => <ItemRow key={item.listingId} item={item} />)}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="shrink-0 px-5 py-4 border-t border-gray-100 space-y-3" style={{ backgroundColor: '#faf7f2' }}>
            {/* Summary */}
            <div className="space-y-1 text-sm">
              {freeCount > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>{freeCount} free {freeCount === 1 ? 'exchange' : 'exchanges'}</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
              )}
              {paidTotal > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Paid items</span>
                  <span className="font-semibold text-gray-800">{fmt(paidTotal)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-200" style={{ color: '#1a3a2a' }}>
                <span>Total</span>
                <span>{totalPrice === 0 ? 'Free' : fmt(totalPrice)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  closeDrawer();
                  router.push('/checkout');
                }}
                className="w-full rounded-xl py-3 text-sm font-bold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: '#1a3a2a' }}
              >
                {totalPrice > 0 ? 'Proceed to Checkout' : 'Confirm Exchange'}
              </button>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="w-full rounded-xl py-3 text-sm font-semibold text-center border border-gray-200 text-gray-700 hover:bg-white transition-colors"
              >
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </div>

    </>
  );
}
