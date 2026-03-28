'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const MOCK_LISTINGS = [
  { id: '1', title: 'Kung Pao Chicken',      cuisine: 'Chinese'  },
  { id: '2', title: 'Street Tacos al Pastor', cuisine: 'Mexican'  },
  { id: '3', title: 'Homemade Lasagna',       cuisine: 'Italian'  },
  { id: '4', title: 'Tonkotsu Ramen',         cuisine: 'Japanese' },
  { id: '5', title: 'Butter Chicken',         cuisine: 'Indian'   },
  { id: '6', title: 'BBQ Brisket',            cuisine: 'American' },
];

const CUISINE_COLORS: Record<string, string> = {
  Chinese:  '#ef4444',
  Mexican:  '#f97316',
  Italian:  '#22c55e',
  Japanese: '#3b82f6',
  Indian:   '#a855f7',
  American: '#eab308',
};

// Only import the heavy mapbox-gl bundle when a real token is present
const MapboxMap = dynamic(() => import('./MapboxMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
      <span className="text-slate-400 text-sm">Loading map…</span>
    </div>
  ),
});

function MapPlaceholder() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-4">
      <div className="text-6xl">🗺️</div>
      <div className="text-center px-8">
        <p className="text-slate-700 font-semibold text-lg">Map Preview</p>
        <p className="text-slate-500 text-sm mt-1">
          Add <code className="bg-slate-200 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to enable the interactive map
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center px-8 mt-2">
        {MOCK_LISTINGS.map((l) => (
          <Link
            key={l.id}
            href={`/listings/${l.id}`}
            className="flex items-center gap-1.5 bg-white hover:bg-orange-50 rounded-full px-3 py-1 shadow-sm text-xs font-medium text-slate-700 hover:text-orange-600 transition-colors"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: CUISINE_COLORS[l.cuisine] ?? '#6366f1' }}
            />
            {l.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

const HAS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.startsWith('pk.');

export default function MapboxMapClient() {
  if (!HAS_TOKEN) {
    return <MapPlaceholder />;
  }
  return <MapboxMap />;
}
