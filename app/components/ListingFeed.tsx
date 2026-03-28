'use client';

import { useState } from 'react';
import Link from 'next/link';

const LISTINGS = [
  {
    id: '1',
    title: 'Kung Pao Chicken',
    cuisine: 'Chinese',
    cookName: 'Wei Zhang',
    cookRating: 4.8,
    distance: '0.4 mi',
    portionsLeft: 4,
    totalPortions: 6,
    price: 800,
    emoji: '🥡',
    accentColor: '#ef4444',
  },
  {
    id: '2',
    title: 'Street Tacos al Pastor',
    cuisine: 'Mexican',
    cookName: 'Maria Flores',
    cookRating: 4.9,
    distance: '1.1 mi',
    portionsLeft: 8,
    totalPortions: 12,
    price: 0,
    emoji: '🌮',
    accentColor: '#f97316',
  },
  {
    id: '3',
    title: 'Homemade Lasagna',
    cuisine: 'Italian',
    cookName: 'Gianna Ricci',
    cookRating: 4.7,
    distance: '0.7 mi',
    portionsLeft: 2,
    totalPortions: 4,
    price: 1200,
    emoji: '🍝',
    accentColor: '#22c55e',
  },
  {
    id: '4',
    title: 'Tonkotsu Ramen',
    cuisine: 'Japanese',
    cookName: 'Hana Nakamura',
    cookRating: 5.0,
    distance: '2.3 mi',
    portionsLeft: 5,
    totalPortions: 6,
    price: 1000,
    emoji: '🍜',
    accentColor: '#3b82f6',
  },
  {
    id: '5',
    title: 'Butter Chicken & Naan',
    cuisine: 'Indian',
    cookName: 'Priya Sharma',
    cookRating: 4.6,
    distance: '0.9 mi',
    portionsLeft: 3,
    totalPortions: 8,
    price: 900,
    emoji: '🍛',
    accentColor: '#a855f7',
  },
  {
    id: '6',
    title: 'Slow-Smoked BBQ Brisket',
    cuisine: 'American',
    cookName: 'James Carter',
    cookRating: 4.8,
    distance: '1.5 mi',
    portionsLeft: 1,
    totalPortions: 3,
    price: 1500,
    emoji: '🥩',
    accentColor: '#eab308',
  },
];

const CATEGORIES = [
  { label: 'All',      icon: '🍴' },
  { label: 'Chinese',  icon: '🥡' },
  { label: 'Mexican',  icon: '🌮' },
  { label: 'Italian',  icon: '🍝' },
  { label: 'Japanese', icon: '🍜' },
  { label: 'Indian',   icon: '🍛' },
  { label: 'American', icon: '🥩' },
];

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

function ListingCard({ listing }: { listing: typeof LISTINGS[0] }) {
  const isLow = listing.portionsLeft <= 2;
  const isFree = listing.price === 0;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-200"
    >
      {/* Photo area */}
      <div
        className="relative h-44 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${listing.accentColor}22, ${listing.accentColor}10)` }}
      >
        <span className="text-7xl group-hover:scale-110 transition-transform duration-300 select-none">
          {listing.emoji}
        </span>

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm"
            style={{ color: listing.accentColor }}>
            {listing.cuisine}
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${isFree
              ? 'bg-emerald-500 text-white'
              : 'bg-white/90 backdrop-blur-sm text-slate-800'}`}
          >
            {formatPrice(listing.price)}
          </span>
        </div>

        {/* Low stock ribbon */}
        {isLow && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 backdrop-blur-sm text-white text-[11px] font-bold text-center py-1 tracking-wide">
            ⚡ Only {listing.portionsLeft} left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-slate-900 text-[15px] leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
          {listing.title}
        </h3>

        {/* Cook row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
              style={{ backgroundColor: listing.accentColor }}
            >
              {listing.cookName[0]}
            </div>
            <span className="text-xs text-slate-600 font-medium">{listing.cookName}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <svg className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.784.57-1.838-.197-1.54-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.099 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 00.95-.69l1.507-4.674z" />
            </svg>
            <span className="font-semibold text-slate-700">{listing.cookRating.toFixed(1)}</span>
            <span className="text-slate-300">·</span>
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C5.24 0 3 2.24 3 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
            </svg>
            {listing.distance}
          </div>
        </div>

        {/* Portions bar */}
        <div className="space-y-1">
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(listing.portionsLeft / listing.totalPortions) * 100}%`,
                backgroundColor: isLow ? '#ef4444' : listing.accentColor,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {listing.portionsLeft}/{listing.totalPortions} portions available
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function ListingFeed() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? LISTINGS
    : LISTINGS.filter((l) => l.cuisine === activeCategory);

  return (
    <div className="flex flex-col h-full">
      {/* Category chips */}
      <div className="shrink-0 px-4 pt-4 pb-0">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {CATEGORIES.map(({ label, icon }) => {
            const active = activeCategory === label;
            return (
              <button
                key={label}
                onClick={() => setActiveCategory(label)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-150 border ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{icon}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort row */}
      <div className="shrink-0 px-4 pb-3 flex items-center justify-between border-b border-slate-100">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{filtered.length}</span> listings nearby
        </p>
        <select className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:border-orange-300">
          <option>Closest first</option>
          <option>Newest first</option>
          <option>Price: Low → High</option>
        </select>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
            <span className="text-4xl">🍽</span>
            <p className="text-sm font-medium">No listings in this category yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
