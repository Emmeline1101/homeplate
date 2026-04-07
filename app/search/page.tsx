'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import FollowButton from '../components/FollowButton';
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

type SearchUser = {
  id: string
  name: string | null
  avatar_url: string | null
  user_code?: string | null
  city: string | null
  rating_avg: number
  review_count: number
  top_cook_badge: boolean
}

const CATEGORIES = [
  'All', 'Baked Goods', 'Asian Sweets', 'Jams & Preserves',
  'Confections', 'Dried & Packaged', 'Fermented', 'Noodles & Pantry', 'Cookies & Biscuits',
];

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E")`;

// ── Shared user row card used in both search results and recommendations ──
function UserCard({
  user,
  currentUserId,
  isFollowing,
}: {
  user: SearchUser
  currentUserId: string | null
  isFollowing: boolean
}) {
  const displayName = user.name ?? 'Unknown Cook';
  const initial = displayName[0]?.toUpperCase() ?? '?';
  const isMe = currentUserId === user.id;

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-black/[0.05] shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={displayName} className="w-11 h-11 rounded-full object-cover shrink-0" />
        ) : (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
            style={{ backgroundColor: '#1a3a2a' }}
          >
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm truncate" style={{ color: '#1a3a2a' }}>{displayName}</span>
            {user.top_cook_badge && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-400 text-white shrink-0">⭐ TOP</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {user.user_code && <span className="text-xs text-gray-400 font-mono">#{user.user_code}</span>}
            {user.city && <span className="text-xs text-gray-400">· {user.city}</span>}
            <span className="text-xs text-gray-400">· {user.rating_avg.toFixed(1)}⭐ ({user.review_count})</span>
          </div>
        </div>
      </Link>

      {/* Follow button — only shown when logged in and not own card */}
      {currentUserId && !isMe && (
        <div className="shrink-0">
          <FollowButton
            targetId={user.id}
            initialIsFollowing={isFollowing}
            isFriend={false}
          />
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const [tab, setTab]                         = useState<'food' | 'people'>('food');
  const [query, setQuery]                     = useState('');
  const [category, setCategory]               = useState('All');
  const [priceFilter, setPriceFilter]         = useState<'all' | 'free' | 'paid'>('all');
  const [allListings, setAllListings]         = useState<SearchListing[]>([]);
  const [semanticResults, setSemanticResults] = useState<SearchListing[] | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [searching, setSearching]             = useState(false);
  const debounceRef                           = useRef<ReturnType<typeof setTimeout> | null>(null);

  // People search state
  const [userResults, setUserResults]         = useState<SearchUser[]>([]);
  const [userLoading, setUserLoading]         = useState(false);
  const userDebounceRef                       = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Recommended users state
  const [currentUserId, setCurrentUserId]     = useState<string | null>(null);
  const [currentCity, setCurrentCity]         = useState<string | null>(null);
  const [followingIds, setFollowingIds]       = useState<Set<string>>(new Set());
  const [suggestedUsers, setSuggestedUsers]   = useState<SearchUser[]>([]);
  const [topCooks, setTopCooks]               = useState<SearchUser[]>([]);
  const [recLoading, setRecLoading]           = useState(false);

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

  // 用户搜索（防抖 300ms）
  useEffect(() => {
    if (tab !== 'people') return;
    if (userDebounceRef.current) clearTimeout(userDebounceRef.current);
    const q = query.trim();
    if (!q) { setUserResults([]); return; }

    userDebounceRef.current = setTimeout(async () => {
      setUserLoading(true);
      try {
        const supabase = createClient();
        // 判断是否是 user_code 查询（纯数字或以 # 开头）
        const codeMatch = q.match(/^#?(\d{6})$/);
        let data: SearchUser[] | null = null;

        if (codeMatch) {
          const { data: rows } = await supabase
            .from('users')
            .select('id, name, avatar_url, user_code, city, rating_avg, review_count, top_cook_badge')
            .eq('user_code', codeMatch[1])
            .limit(10);
          data = rows as SearchUser[] | null;
        } else {
          const { data: rows } = await supabase
            .from('users')
            .select('id, name, avatar_url, user_code, city, rating_avg, review_count, top_cook_badge')
            .ilike('name', `%${q}%`)
            .order('rating_avg', { ascending: false })
            .limit(20);
          data = rows as SearchUser[] | null;
        }
        setUserResults(data ?? []);
      } finally {
        setUserLoading(false);
      }
    }, 300);
  }, [query, tab]);

  // 加载推荐用户（切换到 People tab 时触发）
  useEffect(() => {
    if (tab !== 'people') return;
    setRecLoading(true);

    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: authData }) => {
      const uid = authData.user?.id ?? null;
      setCurrentUserId(uid);

      // 获取当前用户城市 + 已关注列表
      let city: string | null = null;
      let followedSet = new Set<string>();

      if (uid) {
        const [{ data: profile }, { data: followRows }] = await Promise.all([
          supabase.from('users').select('city').eq('id', uid).single(),
          supabase.from('follows').select('following_id').eq('follower_id', uid),
        ]);
        city = profile?.city ?? null;
        setCurrentCity(city);
        followedSet = new Set((followRows ?? []).map((r: { following_id: string }) => r.following_id));
        setFollowingIds(followedSet);
      }

      const exclude = uid ? [uid, ...Array.from(followedSet)] : [];

      const userSelect = 'id, name, avatar_url, user_code, city, rating_avg, review_count, top_cook_badge';

      // Top Cooks（有 top_cook_badge，高评分排序）
      let topQ = supabase
        .from('users')
        .select(userSelect)
        .eq('top_cook_badge', true)
        .order('rating_avg', { ascending: false })
        .limit(8);
      if (exclude.length) topQ = topQ.not('id', 'in', `(${exclude.join(',')})`);
      const { data: topData } = await topQ;
      setTopCooks((topData as SearchUser[]) ?? []);

      // 同城推荐（已登录且有城市）
      if (uid && city) {
        const topIds = (topData ?? []).map((u: SearchUser) => u.id);
        const excludeSuggested = [...exclude, ...topIds];
        let sugQ = supabase
          .from('users')
          .select(userSelect)
          .eq('city', city)
          .order('rating_avg', { ascending: false })
          .limit(5);
        if (excludeSuggested.length) sugQ = sugQ.not('id', 'in', `(${excludeSuggested.join(',')})`);
        const { data: sugData } = await sugQ;
        setSuggestedUsers((sugData as SearchUser[]) ?? []);
      } else {
        setSuggestedUsers([]);
      }

      setRecLoading(false);
    });
  }, [tab]);

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
            onKeyDown={e => e.key === 'Enter' && tab === 'food' && runSemanticSearch(query)}
            placeholder={tab === 'food' ? 'Search matcha cake, kimchi, yuzu jam… (press Enter)' : 'Search by name or #123456 user ID…'}
            className="w-full pl-11 pr-10 py-3.5 text-sm rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-gray-400"
          />
          {(searching || userLoading) ? (
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

        {/* Tab switcher: Food / People */}
        <div className="flex gap-1 p-1 rounded-2xl border border-gray-200 bg-white w-fit">
          {(['food', 'people'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setQuery(''); }}
              className="px-5 py-1.5 rounded-xl text-sm font-semibold transition-all"
              style={tab === t
                ? { backgroundColor: '#1a3a2a', color: '#fff' }
                : { color: '#6b7280' }
              }
            >
              {t === 'food' ? '🍱 Food' : '👤 People'}
            </button>
          ))}
        </div>

        {/* Category filter pills — food tab only */}
        {tab === 'food' && (
        <>{/* Category filter pills */}
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

        {/* Food results */}
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
        </>)}

        {/* ── People tab ─────────────────────────────────────── */}
        {tab === 'people' && (
          <>
            {!query.trim() ? (
              /* ── Recommended users (empty query state) ──────── */
              recLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Hint */}
                  <p className="text-xs text-gray-400 text-center">
                    Search by name above, or enter a 6-digit ID like{' '}
                    <span className="font-mono font-semibold text-gray-500">#042891</span>
                  </p>

                  {/* Same-city suggestions */}
                  {suggestedUsers.length > 0 && (
                    <section>
                      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-0.5">
                        📍 People near you in {currentCity}
                      </h2>
                      <div className="space-y-2">
                        {suggestedUsers.map(u => (
                          <UserCard
                            key={u.id}
                            user={u}
                            currentUserId={currentUserId}
                            isFollowing={followingIds.has(u.id)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Top Cooks */}
                  {topCooks.length > 0 && (
                    <section>
                      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-0.5">
                        ⭐ Top Cooks
                      </h2>
                      <div className="space-y-2">
                        {topCooks.map(u => (
                          <UserCard
                            key={u.id}
                            user={u}
                            currentUserId={currentUserId}
                            isFollowing={followingIds.has(u.id)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Empty state — no recommendations at all */}
                  {suggestedUsers.length === 0 && topCooks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                      <span className="text-5xl">👤</span>
                      <p className="font-bold text-gray-700">Find a cook</p>
                      <p className="text-sm text-gray-400">Type a name or user ID to get started</p>
                    </div>
                  )}
                </div>
              )
            ) : userLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : userResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <span className="text-5xl">🔍</span>
                <p className="font-bold text-gray-700">No users found</p>
                <p className="text-sm text-gray-400">Try a different name or user ID</p>
              </div>
            ) : (
              <div className="space-y-2">
                {userResults.map(u => (
                  <UserCard
                    key={u.id}
                    user={u}
                    currentUserId={currentUserId}
                    isFollowing={followingIds.has(u.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <div className="h-4" />
      </main>
    </div>
  );
}
