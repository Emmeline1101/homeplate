'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const PINS = [
  { id: '1',  title: 'Kung Pao Chicken',        cuisine: 'Chinese'   },
  { id: '2',  title: 'Tacos al Pastor',          cuisine: 'Mexican'   },
  { id: '3',  title: 'Homemade Lasagna',         cuisine: 'Italian'   },
  { id: '4',  title: 'Tonkotsu Ramen',           cuisine: 'Japanese'  },
  { id: '5',  title: 'Butter Chicken',           cuisine: 'Indian'    },
  { id: '6',  title: 'BBQ Brisket',              cuisine: 'American'  },
  { id: '7',  title: 'Phở Bò',                   cuisine: 'Vietnamese'},
  { id: '8',  title: 'Green Curry',              cuisine: 'Thai'      },
  { id: '9',  title: 'Kimchi Jjigae',            cuisine: 'Korean'    },
  { id: '10', title: 'Doro Wat',                 cuisine: 'Ethiopian' },
  { id: '11', title: 'Spanakopita',              cuisine: 'Greek'     },
  { id: '12', title: 'Lamb Kofta',               cuisine: 'Lebanese'  },
];

const MapboxMap = dynamic(() => import('./MapboxMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
      <span className="text-gray-500 text-sm">Loading map…</span>
    </div>
  ),
});

function MapPlaceholder() {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-5 px-8"
      style={{ backgroundColor: '#111827' }}
    >
      <div className="text-center">
        <div className="text-5xl mb-3">🗺️</div>
        <p className="text-gray-300 font-semibold">Map Preview</p>
        <p className="text-gray-500 text-xs mt-1">
          Add <code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">NEXT_PUBLIC_MAPBOX_TOKEN</code> to see the map
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center max-w-xs">
        {PINS.map((p) => (
          <Link
            key={p.id}
            href={`/listings/${p.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-200 hover:text-white transition-colors"
            style={{ backgroundColor: '#1a3a2a' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            {p.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

const HAS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.startsWith('pk.');

export default function MapboxMapClient() {
  if (!HAS_TOKEN) return <MapPlaceholder />;
  return <MapboxMap />;
}
