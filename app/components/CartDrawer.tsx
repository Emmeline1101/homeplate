'use client';

import { useState, useEffect } from 'react';
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

// ── Safety Modal ──────────────────────────────────────────────────────────────

function SafetyModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 mx-auto">
          <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div className="text-center space-y-1.5">
          <h2 className="text-base font-bold text-gray-900">Safety Confirmation</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            I confirm this food was prepared in a clean environment and all allergens are accurately disclosed.
          </p>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#1a3a2a' }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
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
  const { items, totalItems, totalPrice, drawerOpen, closeDrawer, clear } = useCart();
  const router = useRouter();
  const [showSafety, setShowSafety] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Reset confirmed state when cart changes
  useEffect(() => { setConfirmed(false); }, [items]);

  function handleConfirm() {
    setShowSafety(false);
    setConfirmed(true);
    clear();
  }

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
          {confirmed ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-3xl">✅</div>
              <div>
                <p className="font-bold text-gray-900">Exchange Confirmed!</p>
                <p className="text-sm text-gray-400 mt-1">You'll hear from your cooks soon.</p>
              </div>
            </div>
          ) : items.length === 0 ? (
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
        {!confirmed && items.length > 0 && (
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
                  if (totalPrice > 0) {
                    closeDrawer();
                    router.push('/checkout');
                  } else {
                    setShowSafety(true);
                  }
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

      {showSafety && (
        <SafetyModal
          onCancel={() => setShowSafety(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
