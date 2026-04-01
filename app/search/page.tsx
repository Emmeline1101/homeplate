'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { LISTINGS, CUISINE_GRADIENTS } from '../lib/mock';

const CATEGORIES = [
  'All', 'Baked Goods', 'Asian Sweets', 'Jams & Preserves',
  'Confections', 'Dried & Packaged', 'Fermented', 'Noodles & Pantry', 'Cookies & Biscuits',
];

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E")`;

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    return LISTINGS.filter(l => {
      const matchesQuery = !q ||
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.cook.toLowerCase().includes(q) ||
        l.cuisine.toLowerCase().includes(q) ||
        l.cookCity.toLowerCase().includes(q);
      const matchesCategory = category === 'All' || l.cuisine === category;
      const matchesPrice =
        priceFilter === 'all' ? true :
        priceFilter === 'free' ? l.price === 0 :
        l.price > 0;
      return matchesQuery && matchesCategory && matchesPrice;
    });
  }, [query, category, priceFilter]);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f7f4ef' }}>
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-5 space-y-4">

        {/* Search bar */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 10.825a5.825 5.825 0 1 1-11.65 0 5.825 5.825 0 0 1 11.65 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search matcha cake, kimchi, yuzu jam…"
            className="w-full pl-11 pr-10 py-3.5 text-sm rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full border transition-all whitespace-nowrap"
              style={category === cat
                ? { backgroundColor: '#1a3a2a', color: '#fff', borderColor: '#1a3a2a' }
                : { backgroundColor: '#fff', color: '#4b5563', borderColor: '#e5e7eb' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filters + count row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-medium shrink-0">Price:</span>
          {(['all', 'free', 'paid'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPriceFilter(p)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all capitalize"
              style={priceFilter === p
                ? { backgroundColor: '#1a3a2a', color: '#fff', borderColor: '#1a3a2a' }
                : { backgroundColor: '#fff', color: '#4b5563', borderColor: '#e5e7eb' }
              }
            >
              {p === 'all' ? 'All' : p === 'free' ? 'Free only' : 'Paid only'}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">
            <span className="font-semibold text-gray-600">{results.length}</span> results
          </span>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <span className="text-5xl">🔍</span>
            <p className="font-bold text-gray-700">No results found</p>
            <p className="text-sm text-gray-400">Try a different keyword or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {results.map(l => {
              const [from, to] = CUISINE_GRADIENTS[l.cuisine] ?? ['#94a3b8', '#475569'];
              const isFree = l.price === 0;
              const isLow  = l.portions <= 2;
              const pct    = Math.round((l.portions / l.totalPortions) * 100);

              return (
                <Link
                  key={l.id}
                  href={`/listings/${l.id}`}
                  className="group block bg-white rounded-3xl overflow-hidden border border-black/[0.05] shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  {/* Hero */}
                  <div className="relative w-full overflow-hidden" style={{ paddingBottom: '75%' }}>
                    <div
                      className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]"
                      style={{ background: `linear-gradient(150deg, ${from} 0%, ${to} 100%)` }}
                    />
                    <div
                      className="absolute inset-0 mix-blend-overlay opacity-30"
                      style={{ backgroundImage: NOISE, backgroundSize: '180px' }}
                    />
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(0,0,0,0.18) 100%)' }} />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[56px] leading-none drop-shadow-lg select-none transition-transform duration-500 group-hover:scale-110">
                        {l.emoji}
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex gap-1">
                      {isFree && (
                        <span className="text-[10px] font-extrabold tracking-wide px-2 py-0.5 rounded-full bg-white/85 backdrop-blur-sm text-emerald-700 shadow-sm">
                          FREE
                        </span>
                      )}
                      {l.topCook && (
                        <span className="text-[10px] font-extrabold tracking-wide px-2 py-0.5 rounded-full bg-amber-400 text-white shadow-sm">
                          ⭐ TOP
                        </span>
                      )}
                      {isLow && (
                        <span className="text-[10px] font-extrabold tracking-wide px-2 py-0.5 rounded-full bg-red-500 text-white shadow-sm">
                          {l.portions} LEFT
                        </span>
                      )}
                    </div>

                    {/* Cook strip */}
                    <div
                      className="absolute bottom-0 left-0 right-0 px-3 py-2.5"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-full border border-white/60 flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                          style={{ backgroundColor: '#1a3a2a' }}
                        >
                          {l.cook[0]}
                        </div>
                        <span className="text-white text-[11px] font-medium flex-1 truncate leading-none">{l.cook}</span>
                        <span className="text-white text-[11px] font-bold shrink-0">{l.cookRating.toFixed(1)} ⭐</span>
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="px-3.5 pt-3 pb-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-[13px] leading-snug tracking-tight line-clamp-1" style={{ color: '#1a3a2a' }}>
                        {l.title}
                      </h3>
                      <span className="shrink-0 text-sm font-extrabold tabular-nums" style={{ color: isFree ? '#16a34a' : '#1a3a2a' }}>
                        {formatPrice(l.price)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="h-[3px] rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: isLow ? '#ef4444' : '#1a3a2a' }}
                        />
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: isLow ? '#ef4444' : '#9ca3af' }}>
                        {isLow ? `⚡ ${l.portions} left` : `${l.portions} of ${l.totalPortions}`}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="h-4" />
      </main>
    </div>
  );
}
