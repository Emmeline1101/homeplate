'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LISTINGS, CUISINE_GRADIENTS as GRADIENTS } from '../lib/mock';

const CATEGORIES: { label: string; emoji: string }[] = [
  { label: 'All',              emoji: '✨' },
  { label: 'Baked Goods',      emoji: '🥐' },
  { label: 'Asian Sweets',     emoji: '🍡' },
  { label: 'Jams & Preserves', emoji: '🫙' },
  { label: 'Confections',      emoji: '🍫' },
  { label: 'Dried & Packaged', emoji: '🧃' },
  { label: 'Fermented',        emoji: '🥬' },
  { label: 'Noodles & Pantry', emoji: '🍜' },
  { label: 'Cookies & Biscuits', emoji: '🍪' },
];

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

// ── Noise texture as inline data-URI ─────────────────────────────────────────
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E")`;

// ── Card ─────────────────────────────────────────────────────────────────────

function ListingCard({ l }: { l: typeof LISTINGS[0] }) {
  const [from, to] = GRADIENTS[l.cuisine] ?? ['#94a3b8', '#475569'];
  const isFree = l.price === 0;
  const isLow  = l.portions <= 2;
  const pct    = Math.round((l.portions / l.totalPortions) * 100);

  return (
    <Link
      href={`/listings/${l.id}`}
      className="group block bg-white rounded-3xl overflow-hidden border border-black/[0.05] shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Hero image area */}
      <div className="relative w-full overflow-hidden" style={{ paddingBottom: '75%' }}>
        {/* Gradient background */}
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
          style={{ background: `linear-gradient(150deg, ${from} 0%, ${to} 100%)` }}
        />
        {/* Subtle noise for texture */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-30"
          style={{ backgroundImage: NOISE, backgroundSize: '180px' }}
        />
        {/* Radial vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(0,0,0,0.18) 100%)' }} />

        {/* Emoji — the hero */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[64px] leading-none drop-shadow-lg select-none transition-transform duration-500 group-hover:scale-110">
            {l.emoji}
          </span>
        </div>

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {isFree && (
            <span className="text-[10px] font-extrabold tracking-wide px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-sm text-emerald-700 shadow-sm">
              FREE
            </span>
          )}
          {l.topCook && (
            <span className="text-[10px] font-extrabold tracking-wide px-2.5 py-1 rounded-full bg-amber-400 text-white shadow-sm">
              ⭐ TOP
            </span>
          )}
          {isLow && (
            <span className="text-[10px] font-extrabold tracking-wide px-2.5 py-1 rounded-full bg-red-500 text-white shadow-sm">
              {l.portions} LEFT
            </span>
          )}
        </div>

        {/* Bottom glassmorphism: cook strip */}
        <div
          className="absolute bottom-0 left-0 right-0 px-3.5 py-3"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.12) 70%, transparent 100%)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full border border-white/60 flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ backgroundColor: '#1a3a2a' }}
            >
              {l.cook[0]}
            </div>
            <span className="text-white text-xs font-medium flex-1 truncate leading-none">{l.cook}</span>
            <div className="flex items-center gap-0.5 shrink-0">
              <svg className="w-2.5 h-2.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.784.57-1.838-.197-1.54-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.099 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 00.95-.69l1.507-4.674z" />
              </svg>
              <span className="text-white text-xs font-bold">{l.cookRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 pt-3.5 pb-4 space-y-2.5">
        {/* Title + price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-[14px] leading-snug tracking-tight line-clamp-1" style={{ color: '#1a3a2a' }}>
            {l.title}
          </h3>
          <span className="shrink-0 text-sm font-extrabold tabular-nums" style={{ color: isFree ? '#16a34a' : '#1a3a2a' }}>
            {formatPrice(l.price)}
          </span>
        </div>

        {/* Category pill + distance */}
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full leading-relaxed"
            style={{ background: `${from}1a`, color: from }}
          >
            {l.cuisine}
          </span>
          <span className="text-[11px] text-gray-400">{l.distance}</span>
        </div>

        {/* Portions progress bar */}
        <div>
          <div className="h-[3px] rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, backgroundColor: isLow ? '#ef4444' : '#1a3a2a' }}
            />
          </div>
          <p className="text-[11px] mt-1.5" style={{ color: isLow ? '#ef4444' : '#9ca3af' }}>
            {isLow ? `⚡ ${l.portions} portions left` : `${l.portions} of ${l.totalPortions} portions`}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── Feed ─────────────────────────────────────────────────────────────────────

export default function ListingFeed() {
  const [active, setActive] = useState('All');

  const filtered = active === 'All'
    ? LISTINGS
    : LISTINGS.filter(l => l.cuisine === active);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#f7f4ef' }}>

      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-2">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 mb-1">Community</p>
        <h2 className="text-xl font-extrabold tracking-tight mb-4" style={{ color: '#1a3a2a' }}>
          Cottage food near you
        </h2>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(({ label, emoji }) => {
            const isActive = active === label;
            return (
              <button
                key={label}
                onClick={() => setActive(label)}
                className="shrink-0 flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-full border transition-all duration-150 whitespace-nowrap"
                style={isActive
                  ? { backgroundColor: '#1a3a2a', color: '#fff', borderColor: '#1a3a2a' }
                  : { backgroundColor: '#fff', color: '#4b5563', borderColor: '#e5e7eb' }
                }
              >
                <span className="text-[13px] leading-none">{emoji}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meta row */}
      <div className="shrink-0 px-5 py-2.5 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          <span className="font-semibold text-gray-600">{filtered.length}</span> listings
        </p>
        <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-300 cursor-pointer">
          <option>Closest first</option>
          <option>Newest first</option>
          <option>Price: Low → High</option>
        </select>
      </div>

      {/* Cards — 2-col grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
            <span className="text-4xl">🥐</span>
            <p className="text-sm">Nothing here yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(l => <ListingCard key={l.id} l={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
