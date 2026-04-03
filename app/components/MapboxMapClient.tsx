'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const PINS = [
  { id: '00000000-0000-4001-8000-000000000001', title: 'Sourdough Starter Bread',  category: 'Baked Goods',        cook: 'Mei L.',    price: 450  },
  { id: '00000000-0000-4001-8000-000000000002', title: 'Horchata Rice Cookies',    category: 'Cookies & Biscuits', cook: 'Carlos R.', price: 500  },
  { id: '00000000-0000-4001-8000-000000000003', title: 'Rosemary Olive Focaccia',  category: 'Baked Goods',        cook: 'Sofia M.',  price: 800  },
  { id: '00000000-0000-4001-8000-000000000004', title: 'Miso Caramel Granola',     category: 'Dried & Packaged',   cook: 'Kenji T.',  price: 750  },
  { id: '00000000-0000-4001-8000-000000000005', title: 'Cardamom Honey Cake',      category: 'Baked Goods',        cook: 'Priya S.',  price: 650  },
  { id: '00000000-0000-4001-8000-000000000006', title: 'Peach Jalapeño Jam',       category: 'Jams & Preserves',   cook: 'Jake W.',   price: 0    },
  { id: '00000000-0000-4001-8000-000000000007', title: 'Vegan Kimchi',             category: 'Fermented',          cook: 'Linh N.',   price: 0    },
  { id: '00000000-0000-4001-8000-000000000008', title: 'Mango Coconut Mochi',      category: 'Asian Sweets',       cook: 'Nong P.',   price: 599  },
  { id: '00000000-0000-4001-8000-000000000009', title: 'Sesame Peanut Brittle',    category: 'Confections',        cook: 'Jisu K.',   price: 0    },
  { id: '00000000-0000-4001-8000-000000000010', title: 'Berbere Spice Blend',      category: 'Dried & Packaged',   cook: 'Hana G.',   price: 800  },
  { id: '00000000-0000-4001-8000-000000000011', title: 'Baklava Rolls',            category: 'Confections',        cook: 'Elena V.',  price: 499  },
  { id: '00000000-0000-4001-8000-000000000012', title: 'Mamoul Date Cookies',      category: 'Cookies & Biscuits', cook: 'Omar F.',   price: 750  },
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
            <span className="text-gray-400">·</span>
            <span className={p.price === 0 ? 'text-green-400' : 'text-amber-300'}>
              {p.price === 0 ? 'Free' : `$${(p.price / 100).toFixed(2)}`}
            </span>
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
