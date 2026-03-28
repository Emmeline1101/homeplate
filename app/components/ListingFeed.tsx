'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Cuisine gradient palette ────────────────────────────────────────────────
const GRADIENTS: Record<string, [string, string]> = {
  Chinese:   ['#f87171', '#f97316'],
  Mexican:   ['#fb923c', '#eab308'],
  Italian:   ['#4ade80', '#16a34a'],
  Japanese:  ['#818cf8', '#3b82f6'],
  Indian:    ['#fbbf24', '#f97316'],
  American:  ['#94a3b8', '#475569'],
  Vietnamese:['#86efac', '#22c55e'],
  Thai:      ['#c084fc', '#7c3aed'],
  Korean:    ['#f472b6', '#db2777'],
  Ethiopian: ['#fb923c', '#b45309'],
  Greek:     ['#67e8f9', '#2563eb'],
  Lebanese:  ['#5eead4', '#0f766e'],
};

// ── 30 mock listings ─────────────────────────────────────────────────────────
const LISTINGS = [
  // Chinese
  { id:'1',  title:'Kung Pao Chicken',          cuisine:'Chinese',   cook:'Wei Zhang',       rating:4.8, city:'San Francisco, CA',  distance:'0.4 mi', portions:4,  price:900  },
  { id:'2',  title:'Xiao Long Bao',             cuisine:'Chinese',   cook:'Mei Lin',          rating:4.9, city:'New York, NY',        distance:'0.8 mi', portions:6,  price:1200 },
  { id:'3',  title:'Mapo Tofu',                 cuisine:'Chinese',   cook:'Chen Wei',         rating:4.7, city:'Los Angeles, CA',     distance:'1.2 mi', portions:3,  price:800  },
  // Mexican
  { id:'4',  title:'Tacos al Pastor',           cuisine:'Mexican',   cook:'Maria Flores',     rating:4.9, city:'Los Angeles, CA',     distance:'0.6 mi', portions:10, price:0    },
  { id:'5',  title:'Chicken Enchiladas',        cuisine:'Mexican',   cook:'Rosa Gutierrez',   rating:4.7, city:'Austin, TX',          distance:'1.0 mi', portions:5,  price:1000 },
  { id:'6',  title:'Tamales de Pollo',          cuisine:'Mexican',   cook:'Carmen Vega',      rating:4.8, city:'Houston, TX',         distance:'1.8 mi', portions:8,  price:800  },
  // Italian
  { id:'7',  title:'Homemade Lasagna',          cuisine:'Italian',   cook:'Gianna Ricci',     rating:4.7, city:'New York, NY',        distance:'0.7 mi', portions:2,  price:1200 },
  { id:'8',  title:'Truffle Risotto',           cuisine:'Italian',   cook:'Marco Bianchi',    rating:4.9, city:'Chicago, IL',         distance:'1.4 mi', portions:3,  price:1400 },
  { id:'9',  title:'Pasta Carbonara',           cuisine:'Italian',   cook:'Sofia Romano',     rating:4.6, city:'Boston, MA',          distance:'0.9 mi', portions:4,  price:1100 },
  // Japanese
  { id:'10', title:'Tonkotsu Ramen',            cuisine:'Japanese',  cook:'Hana Nakamura',    rating:5.0, city:'Seattle, WA',         distance:'2.3 mi', portions:5,  price:1000 },
  { id:'11', title:'Chicken Karaage',           cuisine:'Japanese',  cook:'Yuki Tanaka',      rating:4.8, city:'San Francisco, CA',   distance:'0.5 mi', portions:4,  price:900  },
  { id:'12', title:'Salmon Sushi Platter',      cuisine:'Japanese',  cook:'Kenji Ito',        rating:4.9, city:'New York, NY',        distance:'1.1 mi', portions:2,  price:1500 },
  // Indian
  { id:'13', title:'Butter Chicken & Naan',     cuisine:'Indian',    cook:'Priya Sharma',     rating:4.6, city:'Chicago, IL',         distance:'0.9 mi', portions:3,  price:900  },
  { id:'14', title:'Lamb Biryani',              cuisine:'Indian',    cook:'Arjun Patel',      rating:4.8, city:'Houston, TX',         distance:'1.3 mi', portions:4,  price:1100 },
  { id:'15', title:'Dal Makhani',               cuisine:'Indian',    cook:'Ananya Krishnan',  rating:4.7, city:'Washington, DC',      distance:'0.7 mi', portions:6,  price:800  },
  // American
  { id:'16', title:'Slow-Smoked BBQ Brisket',  cuisine:'American',  cook:'James Carter',     rating:4.8, city:'Austin, TX',          distance:'1.5 mi', portions:1,  price:1500 },
  { id:'17', title:'New England Clam Chowder', cuisine:'American',  cook:'Sarah Mitchell',   rating:4.7, city:'Boston, MA',          distance:'0.6 mi', portions:5,  price:800  },
  { id:'18', title:'Fried Chicken & Waffles',  cuisine:'American',  cook:'Marcus Johnson',   rating:4.9, city:'Atlanta, GA',         distance:'1.0 mi', portions:4,  price:1000 },
  // Vietnamese
  { id:'19', title:'Phở Bò',                   cuisine:'Vietnamese',cook:'Linh Nguyen',      rating:4.8, city:'Portland, OR',        distance:'0.8 mi', portions:6,  price:900  },
  { id:'20', title:'Bánh Mì Thịt Nướng',       cuisine:'Vietnamese',cook:'An Tran',          rating:4.7, city:'Seattle, WA',         distance:'1.2 mi', portions:8,  price:0    },
  // Thai
  { id:'21', title:'Green Curry & Jasmine Rice',cuisine:'Thai',     cook:'Nong Saesow',      rating:4.9, city:'Miami, FL',           distance:'0.9 mi', portions:5,  price:900  },
  { id:'22', title:'Pad Thai',                  cuisine:'Thai',     cook:'Pim Charoenwong',  rating:4.7, city:'Los Angeles, CA',     distance:'1.6 mi', portions:7,  price:800  },
  // Korean
  { id:'23', title:'Kimchi Jjigae',            cuisine:'Korean',    cook:'Jisoo Park',       rating:4.8, city:'Seattle, WA',         distance:'0.5 mi', portions:4,  price:800  },
  { id:'24', title:'LA Galbi (Short Ribs)',     cuisine:'Korean',    cook:'Min-jun Lee',      rating:5.0, city:'New York, NY',        distance:'1.9 mi', portions:3,  price:1600 },
  { id:'25', title:'Bibimbap',                  cuisine:'Korean',   cook:'Soyeon Kim',       rating:4.6, city:'San Francisco, CA',   distance:'0.7 mi', portions:5,  price:900  },
  // Ethiopian
  { id:'26', title:'Doro Wat with Injera',     cuisine:'Ethiopian', cook:'Tigist Haile',     rating:4.9, city:'Washington, DC',      distance:'1.1 mi', portions:4,  price:0    },
  { id:'27', title:'Tibs & Injera Platter',    cuisine:'Ethiopian', cook:'Almaz Kebede',     rating:4.8, city:'Minneapolis, MN',     distance:'2.0 mi', portions:3,  price:1000 },
  // Greek
  { id:'28', title:'Spanakopita',              cuisine:'Greek',     cook:'Elena Papadopoulos',rating:4.7,city:'Chicago, IL',         distance:'0.8 mi', portions:6,  price:800  },
  // Lebanese
  { id:'29', title:'Lamb Kofta & Hummus',      cuisine:'Lebanese',  cook:'Layla Khalil',     rating:4.9, city:'Miami, FL',           distance:'1.3 mi', portions:4,  price:1200 },
  { id:'30', title:'Kibbeh Platter',           cuisine:'Lebanese',  cook:'Omar Nassar',      rating:4.8, city:'Denver, CO',          distance:'1.7 mi', portions:5,  price:1000 },
];

const CATEGORIES = [
  'All','Chinese','Mexican','Italian','Japanese',
  'Indian','American','Vietnamese','Thai','Korean','Ethiopian','Greek','Lebanese',
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
            <span className="text-white text-xs font-bold">{l.rating.toFixed(1)}</span>
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
          Dishes near you
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
            <span className="text-3xl">🍽</span>
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
