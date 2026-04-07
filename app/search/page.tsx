'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { CUISINE_GRADIENTS } from '../lib/mock';
import { createClient } from '../lib/supabase';

type SearchListing = {
  id: string
  title: string
  description: string | null
  cuisine_tag: string | null
  emoji: string | null
  quantity_left: number
  quantity_total: number
  price_cents: number
  similarity?: number
  users: {
    name: string | null
    rating_avg: number
    top_cook_badge: boolean
    city: string | null
  } | null
}

const CATEGORIES = [
  'All', 'Baked Goods', 'Asian Sweets', 'Jams & Preserves',
  'Confections', 'Dried & Packaged', 'Fermented', 'Noodles & Pantry', 'Cookies & Biscuits',
];

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E")`;

export default function SearchPage() {
  const [query, setQuery]                     = useState('');
  const [category, setCategory]               = useState('All');
  const [priceFilter, setPriceFilter]         = useState<'all' | 'free' | 'paid'>('all');
  const [allListings, setAllListings]         = useState<SearchListing[]>([]);
  const [semanticResults, setSemanticResults] = useState<SearchListing[] | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [searching, setSearching]             = useState(false);
  const debounceRef                           = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 初始加载全部 listings（无搜索词时展示）
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('listings')
      .select('id, title, description, cuisine_tag, emoji, quantity_left, quantity_total, price_cents, users:user_id(name, rating_avg, top_cook_badge, city)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAllListings((data as unknown as SearchListing[]) ?? []);
        setLoading(false);
      });
  }, []);

  // 语义搜索（按回车触发）
  const runSemanticSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSemanticResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data: SearchListing[] = await res.json();
      setSemanticResults(data);
    } catch {
      setSemanticResults(null);
    } finally {
      setSearching(false);
    }
  }, [allListings]);

  // 清空搜索词时重置结果
  useEffect(() => {
    if (!query.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSemanticResults(null);
    }
  }, [query]);

  // 过滤逻辑：有语义结果用语义结果，否则用关键词兜底
  const results = useMemo(() => {
    const base = semanticResults ?? allListings.filter(l => {
      const q = query.toLowerCase().trim();
      return !q ||
        l.title.toLowerCase().includes(q) ||
        (l.description ?? '').toLowerCase().includes(q) ||
        (l.cuisine_tag ?? '').toLowerCase().includes(q);
    });

    return base.filter(l => {
      const matchesCategory = category === 'All' || l.cuisine_tag === category;
      const matchesPrice =
        priceFilter === 'all'  ? true :
        priceFilter === 'free' ? l.price_cents === 0 :
        l.price_cents > 0;
      return matchesCategory && matchesPrice;
    });
  }, [query, category, priceFilter, allListings, semanticResults]);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f7f4ef' }}>
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-5 space-y-4">

        {/* Search bar */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16.65 10.825a5.825 5.825 0 1 1-11.65 0 5.825 5.825 0 0 1 11.65 0z" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runSemanticSearch(query)}
            placeholder="Search matcha cake, kimchi, yuzu jam… (press Enter)"
            className="w-full pl-11 pr-10 py-3.5 text-sm rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-gray-400"
          />
          {searching ? (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </span>
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
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
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-3xl bg-gray-100 animate-pulse" style={{ height: 220 }} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <span className="text-5xl">🔍</span>
            <p className="font-bold text-gray-700">No results found</p>
            <p className="text-sm text-gray-400">Try a different keyword or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {results.map(l => {
              const cuisine = l.cuisine_tag ?? '';
              const [from, to] = CUISINE_GRADIENTS[cuisine] ?? ['#94a3b8', '#475569'];
              const isFree = l.price_cents === 0;
              const isLow  = l.quantity_left <= 2;
              const pct    = Math.round((l.quantity_left / l.quantity_total) * 100);
              const cookName = l.users?.name ?? 'Unknown Cook';

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
                        {l.emoji ?? '🍱'}
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2.5 left-2.5 flex gap-1">
                      {isFree && (
                        <span className="text-[10px] font-extrabold tracking-wide px-2 py-0.5 rounded-full bg-white/85 backdrop-blur-sm text-emerald-700 shadow-sm">FREE</span>
                      )}
                      {l.users?.top_cook_badge && (
                        <span className="text-[10px] font-extrabold tracking-wide px-2 py-0.5 rounded-full bg-amber-400 text-white shadow-sm">⭐ TOP</span>
                      )}
                      {isLow && (
                        <span className="text-[10px] font-extrabold tracking-wide px-2 py-0.5 rounded-full bg-red-500 text-white shadow-sm">{l.quantity_left} LEFT</span>
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
                          {cookName[0]}
                        </div>
                        <span className="text-white text-[11px] font-medium flex-1 truncate leading-none">{cookName}</span>
                        <span className="text-white text-[11px] font-bold shrink-0">{(l.users?.rating_avg ?? 0).toFixed(1)} ⭐</span>
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
                        {formatPrice(l.price_cents)}
                      </span>
                    </div>

                    <div>
                      <div className="h-[3px] rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: isLow ? '#ef4444' : '#1a3a2a' }}
                        />
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: isLow ? '#ef4444' : '#9ca3af' }}>
                        {isLow ? `⚡ ${l.quantity_left} left` : `${l.quantity_left} of ${l.quantity_total}`}
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
