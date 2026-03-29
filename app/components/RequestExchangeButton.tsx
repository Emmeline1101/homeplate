'use client';

import { useState } from 'react';
import { useCart, CartItem } from '../lib/cartStore';

type Props = {
  item: Omit<CartItem, 'quantity'>;
};

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
            Confirm & Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RequestExchangeButton({ item }: Props) {
  const { addItem, openDrawer, items } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [added, setAdded] = useState(false);

  const inCart = items.find(i => i.listingId === item.listingId);

  function handleConfirm() {
    setShowModal(false);
    addItem({ ...item, quantity: 1 });
    setAdded(true);
    openDrawer();
    setTimeout(() => setAdded(false), 2000);
  }

  if (inCart) {
    return (
      <button
        onClick={openDrawer}
        className="w-full rounded-2xl py-4 text-base font-bold text-white transition-colors hover:opacity-90"
        style={{ backgroundColor: '#1a3a2a' }}
      >
        In Cart ({inCart.quantity}) — View Cart
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full rounded-2xl py-4 text-base font-bold text-white transition-all hover:opacity-90"
        style={{ backgroundColor: added ? '#16a34a' : '#1a3a2a' }}
      >
        {added ? '✓ Added to Cart' : 'Request Exchange'}
      </button>

      {showModal && (
        <SafetyModal
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
