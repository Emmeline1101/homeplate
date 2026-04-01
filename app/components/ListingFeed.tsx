'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LISTINGS, CUISINE_GRADIENTS as GRADIENTS } from '../lib/mock';

const CATEGORIES = [
  'All', 'Baked Goods', 'Asian Sweets', 'Jams & Preserves',
  'Confections', 'Dried & Packaged', 'Fermented', 'Noodles & Pantry', 'Cookies & Biscuits',
];

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

function ListingCard({ l }: { l: typeof LISTINGS[0] }) {
  const [from, to] = GRADIENTS[l.cuisine] ?? ['#94a3b8', '#475569'];
  const isFree = l.price === 0;
  const isLow  = l.portions <= 2;

  return (
    <Link
      href={`/listings/${l.id}`}
      className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100"
    >
      {/* Photo — 16:9 */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        />

        {/* Bottom overlay: cook info */}
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-2.5 flex items-center gap-2"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }}
        >
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[11px] font-bold shrink-0"
            style={{ backgroundColor: '#1a3a2a' }}
          >
            {l.cook[0]}
          </div>
          <span className="text-white text-xs font-semibold truncate flex-1">{l.cook}</span>
          {/* Rating */}
          <div className="flex items-center gap-1 shrink-0">
            <svg className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.784.57-1.838-.197-1.54-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.099 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 00.95-.69l1.507-4.674z" />
            </svg>
            <span className="text-white text-xs font-bold">{l.cookRating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 py-3">
        {/* Title + price */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3
            className="font-bold text-[15px] leading-snug line-clamp-1"
            style={{ color: '#1a3a2a' }}
          >
            {l.title}
          </h3>
          <span
            className="shrink-0 font-bold text-sm"
            style={{ color: isFree ? '#16a34a' : '#1a3a2a' }}
          >
            {formatPrice(l.price)}
          </span>
        </div>

        {/* Cuisine tag + meta */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                background: `${GRADIENTS[l.cuisine]?.[0]}22`,
                color: GRADIENTS[l.cuisine]?.[0],
              }}
            >
              {l.cuisine}
            </span>
            <span className="text-xs text-gray-400 truncate">
              {l.distance} · {isLow
                ? <span className="text-red-500 font-semibold">{l.portions} left</span>
                : `${l.portions} portions`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ListingFeed() {
  const [active, setActive] = useState('All');

  const filtered = active === 'All'
    ? LISTINGS
    : LISTINGS.filter((l) => l.cuisine === active);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#faf7f2' }}>

      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-3">
        <h2 className="text-xl font-bold mb-4" style={{ color: '#1a3a2a' }}>
          Cottage food near you
        </h2>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className="shrink-0 text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-150"
                style={isActive
                  ? { backgroundColor: '#1a3a2a', color: '#fff', borderColor: '#1a3a2a' }
                  : { backgroundColor: '#fff', color: '#374151', borderColor: '#e5e7eb' }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort row */}
      <div className="shrink-0 px-5 pb-3 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          <span className="font-semibold text-gray-600">{filtered.length}</span> listings
        </p>
        <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 focus:outline-none">
          <option>Closest first</option>
          <option>Newest first</option>
          <option>Price: Low → High</option>
        </select>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-5 pb-6" style={{ scrollbarWidth: 'thin' }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
            <span className="text-3xl">🥐</span>
            <p className="text-sm">No listings in this category yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
