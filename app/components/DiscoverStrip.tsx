'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '../lib/supabase';

type StripMoment = {
  id: string;
  caption: string | null;
  photo_urls: string[];
  created_at: string;
  user: { id: string; name: string | null } | null;
};

const AVATAR_COLORS = [
  ['#1a3a2a', '#2d6a4f'],
  ['#7c3aed', '#4f46e5'],
  ['#db2777', '#be185d'],
  ['#d97706', '#b45309'],
  ['#0369a1', '#0284c7'],
];

export default function DiscoverStrip() {
  const [moments, setMoments] = useState<StripMoment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('moments')
      .select('id, caption, photo_urls, created_at, user:user_id(id, name)')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setMoments((data as unknown as StripMoment[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (!loading && moments.length === 0) return null;

  return (
    <div className="shrink-0 px-5 pt-4 pb-2">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400">Discover</p>
        <Link
          href="/discover"
          className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors"
        >
          See all →
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {/* Post new moment */}
        <Link
          href="/discover/new"
          className="shrink-0 flex flex-col items-center gap-1.5 group"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 group-hover:border-gray-400 transition-colors bg-white"
          >
            <svg className="w-6 h-6 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Share</span>
        </Link>

        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="shrink-0 flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 animate-pulse" />
                <div className="w-10 h-2 rounded bg-gray-100 animate-pulse" />
              </div>
            ))
          : moments.map((m, idx) => {
              const user = m.user as { id: string; name: string | null } | null;
              const name = user?.name ?? '?';
              const firstLetter = name[0]?.toUpperCase() ?? '?';
              const [from, to] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const hasPhoto = m.photo_urls.length > 0;

              return (
                <Link
                  key={m.id}
                  href={`/discover?focus=${m.id}`}
                  className="shrink-0 flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-offset-1 ring-transparent group-hover:ring-amber-400 transition-all duration-150"
                    style={!hasPhoto ? { background: `linear-gradient(135deg, ${from}, ${to})` } : undefined}
                  >
                    {hasPhoto ? (
                      <img
                        src={m.photo_urls[0]}
                        alt={m.caption ?? ''}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                        {firstLetter}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium truncate w-14 text-center leading-tight">
                    {name.split(' ')[0]}
                  </span>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
