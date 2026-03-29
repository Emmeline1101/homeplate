'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
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

type SortMode = 'pickup' | 'price-asc' | 'price-desc' | 'cuisine';

function sortItems(items: CartItem[], mode: SortMode): CartItem[] {
  const copy = [...items];
  switch (mode) {
    case 'pickup':
      return copy.sort((a, b) => new Date(a.pickupStart).getTime() - new Date(b.pickupStart).getTime());
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'cuisine':
      return copy.sort((a, b) => a.cuisine.localeCompare(b.cuisine));
  }
}

// ── Safety Modal ──────────────────────────────────────────────────────────────

function SafetyModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            Confirm Exchange
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Item Card ─────────────────────────────────────────────────────────────────

function ItemCard({ item }: { item: CartItem }) {
  const { removeItem, setQty } = useCart();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4">
      {/* Emoji */}
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
        style={{ backgroundColor: '#f5f5f0' }}
      >
        {item.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-gray-900 leading-tight">{item.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{item.cook} · {item.cuisine}</p>
            <p className="text-xs text-gray-400">Pickup: {fmtPickup(item.pickupStart)}</p>
          </div>
          <button
            onClick={() => removeItem(item.listingId)}
            className="shrink-0 text-gray-300 hover:text-red-400 transition-colors"
            aria-label="Remove item"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Qty + price */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty(item.listingId, item.quantity - 1)}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors font-bold"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
            <button
              onClick={() => setQty(item.listingId, item.quantity + 1)}
              disabled={item.quantity >= item.maxPortions}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          <p className="text-base font-bold" style={{ color: item.price === 0 ? '#16a34a' : '#1a3a2a' }}>
            {item.price === 0 ? 'Free' : fmt(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const { items, totalItems, totalPrice, clear } = useCart();
  const [sortMode, setSortMode] = useState<SortMode>('pickup');
  const [showModal, setShowModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const sorted = sortItems(items, sortMode);
  const freeCount = items.filter(i => i.price === 0).length;
  const paidTotal = items.filter(i => i.price > 0).reduce((s, i) => s + i.price * i.quantity, 0);

  const SORT_OPTIONS: { value: SortMode; label: string }[] = [
    { value: 'pickup',     label: 'Pickup time' },
    { value: 'price-asc',  label: 'Price: Low → High' },
    { value: 'price-desc', label: 'Price: High → Low' },
    { value: 'cuisine',    label: 'Cuisine' },
  ];

  function handleConfirm() {
    setShowModal(false);
    setConfirmed(true);
    clear();
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to listings
        </Link>

        <h1 className="text-2xl font-bold mb-6" style={{ color: '#1a3a2a' }}>
          Your Cart
          {totalItems > 0 && (
            <span className="ml-2 text-base font-normal text-gray-400">
              ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </span>
          )}
        </h1>

        {/* Confirmed state */}
        {confirmed ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-4xl">✅</div>
            <div>
              <p className="text-xl font-bold text-gray-900">Exchange Confirmed!</p>
              <p className="text-sm text-gray-400 mt-2">You&apos;ll hear from your cooks soon.</p>
            </div>
            <Link
              href="/"
              className="mt-4 px-6 py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#1a3a2a' }}
            >
              Browse More Dishes
            </Link>
          </div>
        ) : items.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center gap-4 text-center">
            <div className="text-6xl">🛒</div>
            <div>
              <p className="font-bold text-gray-900">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Find something delicious to request.</p>
            </div>
            <Link
              href="/"
              className="mt-2 px-6 py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#1a3a2a' }}
            >
              Browse Dishes
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Sort bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-medium">Sort by:</span>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSortMode(opt.value)}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all"
                  style={
                    sortMode === opt.value
                      ? { backgroundColor: '#1a3a2a', color: '#fff' }
                      : { backgroundColor: '#fff', color: '#374151', border: '1px solid #e5e7eb' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Item list */}
            <div className="space-y-3">
              {sorted.map(item => (
                <ItemCard key={item.listingId} item={item} />
              ))}
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4" style={{ backgroundColor: '#faf7f2' }}>
              <h2 className="font-bold text-base" style={{ color: '#1a3a2a' }}>Order Summary</h2>

              <div className="space-y-2 text-sm">
                {freeCount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>{freeCount} free {freeCount === 1 ? 'exchange' : 'exchanges'}</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                )}
                {paidTotal > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Paid items subtotal</span>
                    <span className="font-semibold text-gray-800">{fmt(paidTotal)}</span>
                  </div>
                )}
                <div
                  className="flex justify-between font-bold text-base pt-3 border-t border-gray-200"
                  style={{ color: '#1a3a2a' }}
                >
                  <span>Total</span>
                  <span>{totalPrice === 0 ? 'Free' : fmt(totalPrice)}</span>
                </div>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: '#1a3a2a' }}
              >
                Confirm Exchange
              </button>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <SafetyModal
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
