'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useCart, type CartItem } from '../lib/cartStore';
import { useOrders, type Order } from '../lib/ordersStore';
import { confirmExchange } from '../actions/confirmExchange';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';

// ── Stripe setup ──────────────────────────────────────────────────────────────

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

// ── Order Summary ─────────────────────────────────────────────────────────────

function OrderSummary({ items, total }: { items: CartItem[]; total: number }) {
  const freeCount = items.filter(i => i.price === 0).length;
  const paidItems = items.filter(i => i.price > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
      <h2 className="font-bold text-sm tracking-wide uppercase text-gray-400">Order Summary</h2>

      <div className="divide-y divide-gray-100">
        {items.map(item => (
          <div key={item.listingId} className="flex items-center gap-3 py-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: '#f5f5f0' }}>
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{item.title}</p>
              <p className="text-xs text-gray-400">{item.cook} · ×{item.quantity}</p>
            </div>
            <p className="text-sm font-bold shrink-0" style={{ color: item.price === 0 ? '#16a34a' : '#1a3a2a' }}>
              {item.price === 0 ? 'Free' : fmt(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-gray-200 space-y-1.5 text-sm">
        {freeCount > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>{freeCount} free {freeCount === 1 ? 'exchange' : 'exchanges'}</span>
            <span className="font-semibold text-green-600">Free</span>
          </div>
        )}
        {paidItems.length > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>Paid items</span>
            <span className="font-semibold text-gray-800">
              {fmt(paidItems.reduce((s, i) => s + i.price * i.quantity, 0))}
            </span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base pt-1" style={{ color: '#1a3a2a' }}>
          <span>Total</span>
          <span>{total === 0 ? 'Free' : fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Stripe Payment Form ───────────────────────────────────────────────────────

function StripeForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitErr } = await elements.submit();
    if (submitErr) {
      setError(submitErr.message ?? 'Payment failed');
      setLoading(false);
      return;
    }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/checkout?success=1' },
      redirect: 'if_required',
    });

    if (confirmErr) {
      setError(confirmErr.message ?? 'Payment failed');
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-colors hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: '#1a3a2a' }}
      >
        {loading ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  );
}

// ── PayPal Section ────────────────────────────────────────────────────────────

// PayPal support removed — only Stripe is used for payments now.

// ── Success Modal ─────────────────────────────────────────────────────────────

function SuccessModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const freeCount = order.items.filter(i => i.price === 0).length;
  const paidCount = order.items.filter(i => i.price > 0).length;

  // Earliest pickup across all items
  const earliestPickup = order.items.reduce<Date | null>((earliest, item) => {
    const d = new Date(item.pickupStart);
    return !earliest || d < earliest ? d : earliest;
  }, null);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Green header band */}
        <div className="bg-gradient-to-br from-[#1a3a2a] to-[#2d6a4f] px-6 pt-8 pb-10 text-center relative overflow-hidden">
          {/* decorative circles */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

          <div className="relative w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
            🎉
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-1">
            {order.total === 0 ? 'Exchange Confirmed!' : 'Payment Successful!'}
          </h2>
          <p className="text-sm text-white/70">
            {order.total === 0
              ? 'Your free exchange is all set.'
              : `$${(order.total / 100).toFixed(2)} paid · exchange confirmed`}
          </p>
        </div>

        {/* Items list */}
        <div className="px-6 pt-5 pb-2 space-y-2">
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">Your order</p>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {order.items.map(item => (
              <div key={item.listingId} className="flex items-center gap-3">
                <span className="text-2xl shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.cook} · ×{item.quantity}</p>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: item.price === 0 ? '#16a34a' : '#1a3a2a' }}>
                  {item.price === 0 ? 'Free' : `$${((item.price * item.quantity) / 100).toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pickup info */}
        {earliestPickup && (
          <div className="mx-6 my-3 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 flex items-start gap-3">
            <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs font-bold text-amber-800">Pickup starts</p>
              <p className="text-xs text-amber-700 mt-0.5">
                {earliestPickup.toLocaleString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                  hour: 'numeric', minute: '2-digit',
                })}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {freeCount > 0 && paidCount === 0 && 'Coordinate pickup directly with your cook.'}
                {paidCount > 0 && "You'll hear from your cook about exact pickup location."}
              </p>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="px-6 pb-6 pt-2 flex flex-col gap-2">
          <Link
            href="/profile/me"
            onClick={onClose}
            className="w-full rounded-xl py-3 text-sm font-bold text-white text-center hover:opacity-90 transition-colors"
            style={{ backgroundColor: '#1a3a2a' }}
          >
            View My Orders
          </Link>
          <Link
            href="/"
            onClick={onClose}
            className="w-full rounded-xl py-3 text-sm font-semibold text-gray-600 text-center hover:bg-gray-50 transition-colors border border-gray-200"
          >
            Browse More Dishes
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Safety Modal (free-only orders) ──────────────────────────────────────────

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
          <button onClick={onCancel} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90" style={{ backgroundColor: '#1a3a2a' }}>
            Confirm Exchange
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type PayMethod = 'card';

export default function CheckoutPage() {
  const { items, totalPrice, hydrated, clear } = useCart();
  const { addOrder } = useOrders();
  const router  = useRouter();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [payMethod,    setPayMethod]    = useState<PayMethod>('card');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [showSafety,   setShowSafety]   = useState(false);
  const [loadingPI,    setLoadingPI]    = useState(false);

  const hasPaidItems = totalPrice > 0;

  // Create Stripe PaymentIntent when arriving with paid items
  const fetchIntent = useCallback(async () => {
    if (!hasPaidItems) return;
    setLoadingPI(true);
    try {
      const res  = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPrice }),
      });
      const data = await res.json() as { clientSecret?: string };
      if (data.clientSecret) setClientSecret(data.clientSecret);
    } finally {
      setLoadingPI(false);
    }
  }, [hasPaidItems, totalPrice]);

  // Wait for cart hydration before redirecting — avoids false-empty on first render
  useEffect(() => {
    if (!hydrated) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === '1') {
      clear();
      return;
    }

    if (items.length === 0) {
      router.replace('/cart');
      return;
    }

    fetchIntent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function buildOrder(cartItems: CartItem[]): Order {
    return {
      id: crypto.randomUUID(),
      items: cartItems.map(i => ({
        listingId: i.listingId,
        title: i.title,
        cuisine: i.cuisine,
        cook: i.cook,
        emoji: i.emoji,
        price: i.price,
        quantity: i.quantity,
        pickupStart: i.pickupStart,
        pickupEnd: i.pickupEnd,
      })),
      total: cartItems.reduce((s, i) => s + i.price * i.quantity, 0),
      placedAt: new Date().toISOString(),
      pickupStatus: 'pending',
    };
  }

  async function handleFreeConfirm() {
    const snapshot = [...items];
    const order = buildOrder(snapshot);
    addOrder(order);
    setShowSafety(false);
    clear();
    setConfirmedOrder(order);
    // Decrement quantity_left in DB (fire-and-forget, non-blocking)
    confirmExchange(snapshot.map(i => ({ listingId: i.listingId, quantity: i.quantity })));
  }

  async function handlePaymentSuccess() {
    const snapshot = [...items];
    const order = buildOrder(snapshot);
    addOrder(order);
    clear();
    setConfirmedOrder(order);
    confirmExchange(snapshot.map(i => ({ listingId: i.listingId, quantity: i.quantity })));
  }

  // Re-fetch PaymentIntent when switching back to card (so secret is fresh)
  function selectMethod(m: PayMethod) {
    setPayMethod(m);
    if (m === 'card' && !clientSecret) fetchIntent();
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="mb-2">
          <BackButton fallback="/cart" variant="ghost" />
        </div>

        <h1 className="text-2xl font-bold" style={{ color: '#1a3a2a' }}>Checkout</h1>

        {!hydrated ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading…
          </div>
        ) : confirmedOrder ? null : (
          <>
            {/* Order summary */}
            <OrderSummary items={items} total={totalPrice} />

            {/* Free-only flow */}
            {!hasPaidItems && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-xl">🎉</div>
                  <div>
                    <p className="font-bold text-gray-900">All Free Exchanges</p>
                    <p className="text-sm text-gray-400">No payment needed — just confirm below.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSafety(true)}
                  className="w-full rounded-xl py-3.5 text-sm font-bold text-white hover:opacity-90 transition-colors"
                  style={{ backgroundColor: '#1a3a2a' }}
                >
                  Confirm Exchange
                </button>
              </div>
            )}

            {/* Paid flow */}
            {hasPaidItems && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
                <h2 className="font-bold text-base" style={{ color: '#1a3a2a' }}>Payment Method</h2>

                {/* Method tabs */}
                <div className="flex gap-3">
                  {(['card'] as PayMethod[]).map(m => (
                    <button
                      key={m}
                      onClick={() => selectMethod(m)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all"
                      style={
                        payMethod === m
                          ? { backgroundColor: '#1a3a2a', color: '#fff', borderColor: '#1a3a2a' }
                          : { backgroundColor: '#fff', color: '#374151', borderColor: '#e5e7eb' }
                      }
                    >
                      {m === 'card' ? (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="2" y="5" width="20" height="14" rx="2" /><path strokeLinecap="round" d="M2 10h20" />
                          </svg>
                          Credit / Debit Card
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.067 8.478c.492.315.844.825.983 1.42.386 1.66-.942 3.245-2.978 3.245h-.639c-.24 0-.445.174-.483.411l-.558 3.6-.085.547a.491.491 0 01-.484.411H13.6a.303.303 0 01-.3-.347l.677-4.302.07-.447a.491.491 0 01.484-.411h.949c2.107 0 3.759-1.592 4.204-3.73.056-.271.084-.534.083-.793zm-7.63-5.478H8.404a.491.491 0 00-.484.411L5.77 17.147a.303.303 0 00.3.347h2.415a.491.491 0 00.484-.411l.629-3.99a.491.491 0 01.484-.411h1.514c2.976 0 5.287-1.993 5.848-4.738.378-1.855-.105-3.466-1.267-4.474a4.376 4.376 0 00-3.74-.878z" />
                          </svg>
                          PayPal
                        </>
                      )}
                    </button>
                  ))}
                </div>

                {/* Card payment (Stripe Elements) */}
                {payMethod === 'card' && (
                  loadingPI ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-400">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading payment form…
                    </div>
                  ) : clientSecret ? (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: 'stripe',
                          variables: { colorPrimary: '#1a3a2a', borderRadius: '12px' },
                        },
                      }}
                    >
                      <StripeForm onSuccess={handlePaymentSuccess} />
                    </Elements>
                  ) : (
                    <p className="text-sm text-red-500 text-center py-4">
                      Could not load card payment. Check your Stripe keys in <code>.env.local</code>.
                    </p>
                  )
                )}

                {/* PayPal removed — only card payments supported */}
              </div>
            )}
          </>
        )}
      </main>

      {showSafety && (
        <SafetyModal
          onCancel={() => setShowSafety(false)}
          onConfirm={handleFreeConfirm}
        />
      )}

      {confirmedOrder && (
        <SuccessModal
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
        />
      )}
    </div>
  );
}
