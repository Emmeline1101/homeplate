'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase';

type Moment = {
  id: string;
  caption: string | null;
  photo_urls: string[];
  tags: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
  user: { id: string; name: string | null; avatar_url: string | null } | null;
  liked: boolean;
};

const AVATAR_COLORS = [
  ['#1a3a2a', '#2d6a4f'],
  ['#7c3aed', '#4f46e5'],
  ['#db2777', '#be185d'],
  ['#d97706', '#b45309'],
  ['#0369a1', '#0284c7'],
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function PhotoCarousel({ urls }: { urls: string[] }) {
  const [idx, setIdx] = useState(0);
  if (urls.length === 0) return null;
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gray-100" style={{ aspectRatio: '1 / 1' }}>
      <img
        src={urls[idx]}
        alt=""
        className="w-full h-full object-cover"
      />
      {urls.length > 1 && (
        <>
          <button
            onClick={() => setIdx(i => Math.max(i - 1, 0))}
            disabled={idx === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-0 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setIdx(i => Math.min(i + 1, urls.length - 1))}
            disabled={idx === urls.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center disabled:opacity-0 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {urls.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{ backgroundColor: i === idx ? 'white' : 'rgba(255,255,255,0.5)' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MomentCard({
  moment,
  colorIdx,
  currentUserId,
  onTagClick,
}: {
  moment: Moment;
  colorIdx: number;
  currentUserId: string | null;
  onTagClick: (tag: string) => void;
}) {
  const [liked, setLiked] = useState(moment.liked);
  const [likeCount, setLikeCount] = useState(moment.like_count);
  const [toggling, setToggling] = useState(false);

  const user = moment.user as { id: string; name: string | null; avatar_url: string | null } | null;
  const name = user?.name ?? 'Someone';
  const [from, to] = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length];

  const toggleLike = useCallback(async () => {
    if (!currentUserId || toggling) return;
    setToggling(true);
    const supabase = createClient();
    if (liked) {
      await supabase.from('moment_likes').delete().match({ moment_id: moment.id, user_id: currentUserId });
      setLiked(false);
      setLikeCount(c => Math.max(c - 1, 0));
    } else {
      await supabase.from('moment_likes').insert({ moment_id: moment.id, user_id: currentUserId });
      setLiked(true);
      setLikeCount(c => c + 1);
    }
    setToggling(false);
  }, [liked, toggling, moment.id, currentUserId]);

  return (
    <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <Link href={`/profile/${user?.id ?? 'me'}`}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            {name[0]?.toUpperCase()}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${user?.id ?? 'me'}`}>
            <p className="text-sm font-bold truncate" style={{ color: '#1a3a2a' }}>{name}</p>
          </Link>
          <p className="text-xs text-gray-400">{timeAgo(moment.created_at)}</p>
        </div>
      </div>

      {/* Photos */}
      {moment.photo_urls.length > 0 && (
        <div className="px-4">
          <PhotoCarousel urls={moment.photo_urls} />
        </div>
      )}

      {/* Caption + tags */}
      {(moment.caption || moment.tags.length > 0) && (
        <div className="px-4 pt-3 pb-1 space-y-1">
          {moment.caption && (
            <p className="text-sm text-gray-800 leading-relaxed">{moment.caption}</p>
          )}
          {moment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {moment.tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => onTagClick(tag)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline transition-colors"
                >
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3">
        <button
          onClick={toggleLike}
          disabled={!currentUserId}
          className="flex items-center gap-1.5 group disabled:cursor-default"
        >
          <svg
            className="w-5 h-5 transition-transform duration-150 group-active:scale-125"
            viewBox="0 0 24 24"
            fill={liked ? '#ef4444' : 'none'}
            stroke={liked ? '#ef4444' : '#9ca3af'}
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-xs font-semibold text-gray-500">{likeCount}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs font-semibold text-gray-500">{moment.comment_count}</span>
        </div>
      </div>
    </div>
  );
}

export default function DiscoverFeed({
  focusId,
  activeTag,
  sort,
}: {
  focusId?: string;
  activeTag?: string;
  sort?: string;
}) {
  const router = useRouter();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);

  const currentSort = sort === 'hot' ? 'hot' : 'latest';

  const buildUrl = useCallback(
    (tag: string | undefined, newSort: string) => {
      const params = new URLSearchParams();
      if (tag) params.set('tag', tag);
      if (newSort === 'hot') params.set('sort', 'hot');
      const qs = params.toString();
      return `/discover${qs ? `?${qs}` : ''}`;
    },
    []
  );

  const handleTagClick = useCallback(
    (tag: string) => {
      // Toggle off if already active
      const nextTag = tag === activeTag ? undefined : tag;
      router.push(buildUrl(nextTag, currentSort));
    },
    [activeTag, currentSort, router, buildUrl]
  );

  const handleSortChange = useCallback(
    (newSort: string) => {
      router.push(buildUrl(activeTag, newSort));
    },
    [activeTag, router, buildUrl]
  );

  useEffect(() => {
    const supabase = createClient();
    setLoading(true);

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? null;
      setCurrentUserId(uid);

      // Fetch trending tags from top 100 liked moments (always unfiltered)
      const { data: tagData } = await supabase
        .from('moments')
        .select('tags')
        .order('like_count', { ascending: false })
        .limit(100);

      const tagCounts = new Map<string, number>();
      for (const m of (tagData ?? []) as { tags: string[] }[]) {
        for (const t of m.tags ?? []) {
          tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
        }
      }
      setTrendingTags(
        [...tagCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([tag]) => tag)
      );

      // Fetch moments with optional tag filter and sort
      let q = (supabase as any)
        .from('moments')
        .select('id, caption, photo_urls, tags, like_count, comment_count, created_at, user:user_id(id, name, avatar_url)');

      if (activeTag) {
        q = q.contains('tags', [activeTag]);
      }

      q = currentSort === 'hot'
        ? q.order('like_count', { ascending: false })
        : q.order('created_at', { ascending: false });

      const { data } = await q.limit(40);

      if (!data) { setLoading(false); return; }

      let likedIds = new Set<string>();
      if (uid) {
        const { data: likes } = await supabase
          .from('moment_likes')
          .select('moment_id')
          .eq('user_id', uid)
          .in('moment_id', (data as any[]).map((m: any) => m.id));
        likedIds = new Set((likes ?? []).map((l: any) => l.moment_id));
      }

      setMoments(
        (data as any[]).map((m: any) => ({ ...m, liked: likedIds.has(m.id) }))
      );
      setLoading(false);
    }

    load();
  }, [activeTag, currentSort]);

  return (
    <div className="space-y-4">
      {/* Trending tags bar */}
      {trendingTags.length > 0 && (
        <div>
          <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-2">Trending Topics</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {trendingTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  activeTag === tag
                    ? 'text-white border-transparent'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
                }`}
                style={activeTag === tag ? { backgroundColor: '#1a3a2a', borderColor: '#1a3a2a' } : {}}
              >
                {tag.startsWith('#') ? tag : `#${tag}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sort toggle + active tag filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-h-[28px]">
          {activeTag && (
            <>
              <span className="text-sm font-semibold" style={{ color: '#1a3a2a' }}>{activeTag}</span>
              <button
                onClick={() => handleTagClick(activeTag)}
                className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                aria-label="Clear tag filter"
              >
                <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-0.5 p-1 bg-white rounded-full border border-gray-100 shadow-sm">
          <button
            onClick={() => handleSortChange('latest')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              currentSort === 'latest' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Latest
          </button>
          <button
            onClick={() => handleSortChange('hot')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              currentSort === 'hot' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🔥 Hot
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-black/[0.05] p-4 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-gray-100 rounded w-24" />
                  <div className="h-2.5 bg-gray-100 rounded w-12" />
                </div>
              </div>
              <div className="aspect-square rounded-2xl bg-gray-100" />
            </div>
          ))}
        </div>
      ) : moments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <span className="text-5xl">📸</span>
          <p className="text-sm font-medium">
            {activeTag ? `No moments tagged ${activeTag} yet` : 'No moments yet — be the first!'}
          </p>
          {activeTag ? (
            <button
              onClick={() => handleTagClick(activeTag)}
              className="text-sm font-semibold text-emerald-700 underline underline-offset-2"
            >
              Clear filter
            </button>
          ) : (
            <a href="/discover/new" className="text-sm font-semibold text-emerald-700 underline underline-offset-2">
              Share a moment →
            </a>
          )}
        </div>
      ) : (
        moments.map((m, i) => (
          <div key={m.id} id={m.id}>
            <MomentCard moment={m} colorIdx={i} currentUserId={currentUserId} onTagClick={handleTagClick} />
          </div>
        ))
      )}
    </div>
  );
}
