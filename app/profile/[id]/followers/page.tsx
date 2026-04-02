import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { createClient } from '../../../lib/supabaseServer';

export default async function FollowersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let profileUserId: string;
  if (id === 'me') {
    if (!authUser) redirect('/auth/signin');
    profileUserId = authUser.id;
  } else {
    profileUserId = id;
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, name')
    .eq('id', profileUserId)
    .single();

  if (!profile) notFound();

  // Fetch followers: people who follow this user
  const { data: rows } = await supabase
    .from('follows')
    .select('follower_id, created_at, follower:users!follower_id(id, name, avatar_url, city, state, rating_avg, top_cook_badge)')
    .eq('following_id', profileUserId)
    .order('created_at', { ascending: false });

  // Current user's following set (to show Follow/Following buttons)
  let myFollowingSet = new Set<string>();
  if (authUser) {
    const { data: myFollows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', authUser.id);
    myFollowingSet = new Set((myFollows ?? []).map(r => r.following_id));
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f7f4ef' }}>
      <Navbar />
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${id}`} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-extrabold" style={{ color: '#1a3a2a' }}>
            {profile.name ? `${profile.name}'s Followers` : 'Followers'}
          </h1>
        </div>

        {!rows || rows.length === 0 ? (
          <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm p-8 text-center">
            <p className="text-gray-400 text-sm">No followers yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm divide-y divide-gray-50">
            {rows.map(row => {
              const u = row.follower as { id: string; name: string | null; avatar_url: string | null; city: string | null; state: string | null; rating_avg: number; top_cook_badge: boolean } | null;
              if (!u) return null;
              const isMe = authUser?.id === u.id;
              const alreadyFollowing = myFollowingSet.has(u.id);
              return (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                  <Link href={`/profile/${u.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a3a2a] to-[#2d6a4f] flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {u.name?.[0] ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-800 truncate">{u.name ?? 'Anonymous'}</span>
                        {u.top_cook_badge && <span className="text-xs">⭐</span>}
                      </div>
                      {(u.city || u.state) && (
                        <p className="text-xs text-gray-400 truncate">{[u.city, u.state].filter(Boolean).join(', ')}</p>
                      )}
                    </div>
                  </Link>
                  {authUser && !isMe && (
                    <Link
                      href={`/profile/${u.id}`}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shrink-0 ${
                        alreadyFollowing
                          ? 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          : 'bg-[#1a3a2a] text-white hover:bg-[#2d6a4f]'
                      }`}
                    >
                      {alreadyFollowing ? '✓ Following' : '+ Follow'}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
