'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CUISINE_GRADIENTS as GRADIENTS } from '../lib/mock';
import { createClient } from '../lib/supabase';
import DiscoverStrip from './DiscoverStrip';

type FeedListing = {
  id: string
  title: string
  cuisine_tag: string | null
  emoji: string | null
  photo_urls: string[]
  quantity_left: number
  quantity_total: number
  price_cents: number
  users: {
    name: string | null
    rating_avg: number
    top_cook_badge: boolean
    city: string | null
  } | null
}

// Curated Unsplash fallback photos per cuisine tag
const CUISINE_PHOTOS: Record<string, string> = {
  'Baked Goods':        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=75&auto=format&fit=crop',
  'Asian Sweets':       'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=75&auto=format&fit=crop',
  'Jams & Preserves':   'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=75&auto=format&fit=crop',
  'Confections':        'https://images.unsplash.com/photo-1548907040-4baa3e63a2a3?w=400&q=75&auto=format&fit=crop',
  'Dried & Packaged':   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=75&auto=format&fit=crop',
  'Fermented':          'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&q=75&auto=format&fit=crop',
  'Noodles & Pantry':   'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=75&auto=format&fit=crop',
  'Cookies & Biscuits': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=75&auto=format&fit=crop',
}
const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&q=75&auto=format&fit=crop'

const CATEGORIES: { label: string; emoji: string }[] = [
  { label: 'All',                emoji: '✨' },
  { label: 'Baked Goods',        emoji: '🥐' },
  { label: 'Asian Sweets',       emoji: '🍡' },
  { label: 'Jams & Preserves',   emoji: '🫙' },
  { label: 'Confections',        emoji: '🍫' },
  { label: 'Dried & Packaged',   emoji: '🧃' },
  { label: 'Fermented',          emoji: '🥬' },
  { label: 'Noodles & Pantry',   emoji: '🍜' },
  { label: 'Cookies & Biscuits', emoji: '🍪' },
];

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

// ── Card ─────────────────────────────────────────────────────────────────────

function ListingCard({ l }: { l: FeedListing }) {
  const cuisine = l.cuisine_tag ?? '';
  const [from, to] = GRADIENTS[cuisine] ?? ['#94a3b8', '#475569'];
  const isFree    = l.price_cents === 0;
  const isLow     = l.quantity_left <= 2;
  const pct       = Math.round((l.quantity_left / l.quantity_total) * 100);
  const cookName  = l.users?.name ?? 'Unknown Cook';
  const rating    = l.users?.rating_avg ?? 0;
  const isTop     = l.users?.top_cook_badge ?? false;

  return (
    <Link
      href={`/listings/${l.id}`}
      className="group block bg-white rounded-3xl overflow-hidden border border-black/[0.05] shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Hero image area */}
      <div className="relative w-full overflow-hidden" style={{ paddingBottom: '75%' }}>
        {(() => {
          const photoSrc = l.photo_urls?.[0] ?? CUISINE_PHOTOS[cuisine] ?? DEFAULT_PHOTO;
          return (
            <img
              src={photoSrc}
              alt={l.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          );
        })()}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, transparent 40%, rgba(0,0,0,0.18) 100%)' }} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {isFree && (
            <span className="text-[10px] font-extrabold tracking-wide px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-sm text-emerald-700 shadow-sm">
              FREE
            </span>
          )}
          {isTop && (
            <span className="text-[10px] font-extrabold tracking-wide px-2.5 py-1 rounded-full bg-amber-400 text-white shadow-sm">
              ⭐ TOP
            </span>
          )}
          {isLow && (
            <span className="text-[10px] font-extrabold tracking-wide px-2.5 py-1 rounded-full bg-red-500 text-white shadow-sm">
              {l.quantity_left} LEFT
            </span>
          )}
        </div>

        {/* Cook strip */}
        <div
          className="absolute bottom-0 left-0 right-0 px-3.5 py-3"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.12) 70%, transparent 100%)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full border border-white/60 flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ backgroundColor: '#1a3a2a' }}
            >
              {cookName[0]}
            </div>
            <span className="text-white text-xs font-medium flex-1 truncate leading-none">{cookName}</span>
            <div className="flex items-center gap-0.5 shrink-0">
              <svg className="w-2.5 h-2.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.784.57-1.838-.197-1.54-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.099 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 00.95-.69l1.507-4.674z" />
              </svg>
              <span className="text-white text-xs font-bold">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 pt-3.5 pb-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-[14px] leading-snug tracking-tight line-clamp-1" style={{ color: '#1a3a2a' }}>
            {l.title}
          </h3>
          <span className="shrink-0 text-sm font-extrabold tabular-nums" style={{ color: isFree ? '#16a34a' : '#1a3a2a' }}>
            {formatPrice(l.price_cents)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full leading-relaxed"
            style={{ background: `${from}1a`, color: from }}
          >
            {cuisine}
          </span>
          <span className="text-[11px] text-gray-400">{l.users?.city ?? ''}</span>
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
            {isLow ? `⚡ ${l.quantity_left} portions left` : `${l.quantity_left} of ${l.quantity_total} portions`}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── Feed ─────────────────────────────────────────────────────────────────────

type SortMode = 'newest' | 'price-asc' | 'price-desc' | 'rating';

function sortListings(items: FeedListing[], mode: SortMode): FeedListing[] {
  const copy = [...items];
  switch (mode) {
    case 'price-asc':  return copy.sort((a, b) => a.price_cents - b.price_cents);
    case 'price-desc': return copy.sort((a, b) => b.price_cents - a.price_cents);
    case 'rating':     return copy.sort((a, b) => (b.users?.rating_avg ?? 0) - (a.users?.rating_avg ?? 0));
    default:           return copy; // already ordered by created_at desc from DB
  }
}

export default function ListingFeed() {
  const [active, setActive]       = useState('All');
  const [sortMode, setSortMode]   = useState<SortMode>('newest');
  const [listings, setListings]   = useState<FeedListing[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('listings')
      .select('id, title, cuisine_tag, emoji, photo_urls, quantity_left, quantity_total, price_cents, users:user_id(name, rating_avg, top_cook_badge, city)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setListings((data as unknown as FeedListing[]) ?? []);
        setLoading(false);
      });
  }, []);

  const categoryFiltered = active === 'All'
    ? listings
    : listings.filter(l => l.cuisine_tag === active);

  const filtered = sortListings(categoryFiltered, sortMode);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#f7f4ef' }}>

      {/* Discover strip */}
      <DiscoverStrip />

      {/* Header */}
      <div className="shrink-0 px-5 pt-4 pb-2">
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
        <select
          value={sortMode}
          onChange={e => setSortMode(e.target.value as SortMode)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-300 cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Top rated</option>
        </select>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-3xl bg-gray-100 animate-pulse" style={{ height: 240 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
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
