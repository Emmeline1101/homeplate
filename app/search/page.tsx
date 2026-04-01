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
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Search bar */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 10.825a5.825 5.825 0 1 1-11.65 0 5.825 5.825 0 0 1 11.65 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search matcha cake, kimchi, yuzu jam…"
            className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-gray-400"
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
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full border transition-all"
              style={category === cat
                ? { backgroundColor: '#1a3a2a', color: '#fff', borderColor: '#1a3a2a' }
                : { backgroundColor: '#fff', color: '#374151', borderColor: '#e5e7eb' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Price filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium shrink-0">Price:</span>
          {(['all', 'free', 'paid'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPriceFilter(p)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all capitalize"
              style={priceFilter === p
                ? { backgroundColor: '#1a3a2a', color: '#fff', borderColor: '#1a3a2a' }
                : { backgroundColor: '#fff', color: '#374151', borderColor: '#e5e7eb' }
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
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <span className="text-5xl">🔍</span>
            <p className="font-semibold text-gray-700">No results found</p>
            <p className="text-sm text-gray-400">Try a different keyword or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map(l => {
              const [from, to] = CUISINE_GRADIENTS[l.cuisine] ?? ['#94a3b8', '#475569'];
              const isFree = l.price === 0;
              const isLow = l.portions <= 2;
              return (
                <Link
                  key={l.id}
                  href={`/listings/${l.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Image area */}
                  <div className="relative h-36 flex items-center justify-center text-5xl" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                    {l.emoji}
                    {isLow && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                        Almost gone
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <p className="font-bold text-sm text-gray-900 line-clamp-1">{l.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{l.cook} · {l.cookCity}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${from}22`, color: from }}>
                        {l.cuisine}
                      </span>
                      <span className="text-sm font-bold" style={{ color: isFree ? '#16a34a' : '#1a3a2a' }}>
                        {formatPrice(l.price)}
                      </span>
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
