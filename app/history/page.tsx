import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import ClearHistoryButton from './ClearHistoryButton';
import { createClient } from '../lib/supabaseServer';
import { CUISINE_GRADIENTS } from '../lib/mock';

type ViewRow = {
  id: string;
  viewed_at: string;
  source: string;
  listing: {
    id: string;
    title: string;
    cuisine_tag: string | null;
    emoji: string | null;
    photo_urls: string[];
    price_cents: number;
    status: string;
    quantity_left: number;
    cook: { name: string | null } | null;
  } | null;
};

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} 小时前`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} 天前`;
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function groupByDate(views: ViewRow[]): { label: string; items: ViewRow[] }[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;

  const groups: Record<string, ViewRow[]> = {
    '今天': [],
    '昨天': [],
    '过去 7 天': [],
    '更早': [],
  };

  for (const v of views) {
    const t = new Date(v.viewed_at).getTime();
    if (t >= todayStart) groups['今天'].push(v);
    else if (t >= yesterdayStart) groups['昨天'].push(v);
    else if (t >= weekStart) groups['过去 7 天'].push(v);
    else groups['更早'].push(v);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  // Fetch all views for this user with listing details
  const { data: rawViews } = await supabase
    .from('listing_views')
    .select(`
      id,
      viewed_at,
      source,
      listing:listing_id (
        id, title, cuisine_tag, emoji, photo_urls,
        price_cents, status, quantity_left,
        cook:user_id ( name )
      )
    `)
    .eq('user_id', user.id)
    .order('viewed_at', { ascending: false }) as { data: ViewRow[] | null };

  // Deduplicate: keep only the most recent view per listing
  const seen = new Set<string>();
  const views: ViewRow[] = [];
  for (const v of rawViews ?? []) {
    if (!v.listing) continue;
    if (seen.has(v.listing.id)) continue;
    seen.add(v.listing.id);
    views.push(v);
  }

  const groups = groupByDate(views);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f7f4ef' }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pb-20 md:pb-8 pt-4 space-y-3">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton fallback="/profile/me" />
            <h1 className="text-lg font-extrabold tracking-tight" style={{ color: '#1a3a2a' }}>
              浏览历史
            </h1>
          </div>
          {views.length > 0 && <ClearHistoryButton />}
        </div>

        {/* Empty state */}
        {views.length === 0 && (
          <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm p-12 flex flex-col items-center gap-4 text-center">
            <span className="text-5xl">👀</span>
            <div>
              <p className="font-bold text-gray-700">还没有浏览记录</p>
              <p className="text-sm text-gray-400 mt-1">浏览 listing 后会自动记录在这里</p>
            </div>
            <Link
              href="/"
              className="mt-2 text-sm font-semibold px-5 py-2.5 rounded-full text-white hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#1a3a2a' }}
            >
              去探索食物
            </Link>
          </div>
        )}

        {/* History groups */}
        {groups.map(({ label, items }) => (
          <div key={label} className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 pt-2">{label}</p>
            <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm overflow-hidden">
              {items.map((v, i) => {
                const l = v.listing!;
                const cuisine = l.cuisine_tag ?? '';
                const [from, to] = CUISINE_GRADIENTS[cuisine] ?? ['#94a3b8', '#475569'];
                const isSoldOut = l.status === 'sold_out' || l.quantity_left === 0;
                const cookName = (l.cook as { name: string | null } | null)?.name ?? 'Unknown Cook';

                return (
                  <div key={v.id}>
                    {i > 0 && <div className="h-px bg-gray-100 mx-4" />}
                    <Link
                      href={`/listings/${l.id}`}
                      className="flex items-center gap-3.5 px-4 py-3 hover:bg-gray-50 transition-colors group"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-2xl shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                        {l.photo_urls?.[0] ? (
                          <img
                            src={l.photo_urls[0]}
                            alt={l.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-2xl"
                            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                          >
                            {l.emoji ?? '🍱'}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold truncate" style={{ color: '#1a3a2a' }}>{l.title}</p>
                          {isSoldOut && (
                            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">已售完</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {cuisine && <span>{cuisine} · </span>}
                          {cookName}
                        </p>
                        <p className="text-[11px] text-gray-300 mt-0.5">{relativeTime(v.viewed_at)}</p>
                      </div>

                      {/* Price */}
                      <span
                        className="text-sm font-extrabold shrink-0 tabular-nums"
                        style={{ color: l.price_cents === 0 ? '#16a34a' : '#1a3a2a' }}
                      >
                        {formatPrice(l.price_cents)}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {views.length > 0 && (
          <p className="text-center text-xs text-gray-300 pb-2">共 {views.length} 条记录</p>
        )}
      </main>
    </div>
  );
}
