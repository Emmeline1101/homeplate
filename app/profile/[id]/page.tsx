import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Navbar from '../../components/Navbar';
import FollowButton from '../../components/FollowButton';
import { createClient } from '../../lib/supabaseServer';
import { CUISINE_GRADIENTS } from '../../lib/mock';

// ── Helpers ───────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.784.57-1.838-.197-1.54-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.099 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 00.95-.69l1.507-4.674z" />
        </svg>
      ))}
    </span>
  );
}

function PermitBadge({ status }: { status: 'verified' | 'pending' | 'none' }) {
  if (status === 'verified') return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      CA Permit Verified
    </span>
  );
  if (status === 'pending') return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      ⏳ Verification Pending
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
      No Permit Uploaded
    </span>
  );
}

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E")`;

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // Resolve profile user ID
  let profileUserId: string;
  if (id === 'me') {
    if (!authUser) redirect('/auth/signin');
    profileUserId = authUser.id;
  } else {
    profileUserId = id;
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('users')
    .select('id, name, email, avatar_url, bio, city, state, rating_avg, review_count, follower_count, following_count, top_cook_badge, permit_status')
    .eq('id', profileUserId)
    .single();

  if (!profile) notFound();

  // Fetch follow status (only needed when viewing another user's profile)
  let isFollowing = false;
  let isFriend = false;
  if (authUser && authUser.id !== profileUserId) {
    const [{ data: followRow }, { data: followBackRow }] = await Promise.all([
      supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', authUser.id)
        .eq('following_id', profileUserId)
        .maybeSingle(),
      supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', profileUserId)
        .eq('following_id', authUser.id)
        .maybeSingle(),
    ]);
    isFollowing = !!followRow;
    isFriend = isFollowing && !!followBackRow;
  }

  // Fetch this cook's listings
  const { data: cookListings } = await supabase
    .from('listings')
    .select('id, title, cuisine_tag, emoji, quantity_left, quantity_total, price_cents, status')
    .eq('user_id', profileUserId)
    .in('status', ['active', 'draft'])
    .order('created_at', { ascending: false });

  // Fetch this user's published blog posts
  const { data: blogPosts } = await (supabase as any)
    .from('blog_posts')
    .select('id, slug, title, excerpt, cover_image_url, category, like_count, view_count, created_at')
    .eq('user_id', profileUserId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6);

  // Fetch this user's moments
  const { data: moments } = await (supabase as any)
    .from('moments')
    .select('id, caption, photo_urls, like_count, comment_count, created_at')
    .eq('user_id', profileUserId)
    .order('created_at', { ascending: false })
    .limit(18);

  // Fetch reviews received
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, stars_avg, comment, created_at, reviewer:users!reviewer_id(name)')
    .eq('reviewee_id', profileUserId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Pick gradient from most common cuisine
  const dominantCuisine = cookListings?.[0]?.cuisine_tag ?? '';
  const [coverFrom, coverTo] = CUISINE_GRADIENTS[dominantCuisine] ?? ['#1a3a2a', '#2d6a4f'];

  const isOwnProfile = authUser?.id === profileUserId;
  const permitStatus = (profile.permit_status ?? 'none') as 'verified' | 'pending' | 'none';

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f7f4ef' }}>
      <Navbar />

      {/* ── Cover ── */}
      <div className="relative w-full overflow-hidden" style={{ height: 160 }}>
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(150deg, ${coverFrom} 0%, ${coverTo} 100%)` }}
        />
        <div
          className="absolute inset-0 mix-blend-overlay opacity-25"
          style={{ backgroundImage: NOISE, backgroundSize: '180px' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, transparent 30%, rgba(0,0,0,0.2) 100%)' }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to top, #f7f4ef, transparent)' }}
        />
      </div>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 -mt-12 pb-20 md:pb-8 space-y-3">

        {/* ── Profile header card ── */}
        <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm overflow-hidden">
          <div className="px-5 pb-6 pt-3">
            <div className="flex items-end justify-between mb-4">
              <div
                className="w-20 h-20 rounded-2xl border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-md"
                style={{ background: `linear-gradient(135deg, ${coverFrom}, ${coverTo})` }}
              >
                {profile.name?.[0] ?? '?'}
              </div>
              {isOwnProfile ? (
                <button className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  Edit Profile
                </button>
              ) : authUser ? (
                <FollowButton
                  targetId={profileUserId}
                  initialIsFollowing={isFollowing}
                  isFriend={isFriend}
                />
              ) : (
                <Link
                  href="/auth/signin"
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#1a3a2a] text-white hover:bg-[#2d6a4f] transition-colors"
                >
                  + Follow
                </Link>
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#1a3a2a' }}>
                  {profile.name ?? 'Anonymous Cook'}
                </h1>
                {profile.top_cook_badge && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">⭐ Top Cook</span>
                )}
              </div>

              {isOwnProfile && profile.email && (
                <p className="text-sm text-gray-400">{profile.email}</p>
              )}

              {(profile.city || profile.state) && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {[profile.city, profile.state].filter(Boolean).join(', ')}
                </p>
              )}

              <div className="flex items-center gap-2">
                <Stars rating={profile.rating_avg ?? 0} />
                <span className="text-sm font-bold text-gray-700">{(profile.rating_avg ?? 0).toFixed(1)}</span>
                <span className="text-sm text-gray-400">· {profile.review_count ?? 0} reviews</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <Link href={`/profile/${profileUserId}/followers`} className="hover:underline underline-offset-2">
                  <span className="font-bold text-gray-800">{profile.follower_count ?? 0}</span>
                  <span className="text-gray-400 ml-1">followers</span>
                </Link>
                <Link href={`/profile/${profileUserId}/following`} className="hover:underline underline-offset-2">
                  <span className="font-bold text-gray-800">{profile.following_count ?? 0}</span>
                  <span className="text-gray-400 ml-1">following</span>
                </Link>
                {isFriend && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">👥 Friends</span>
                )}
              </div>

              <PermitBadge status={permitStatus} />

              {isOwnProfile && permitStatus !== 'verified' && (
                <div className="mt-1 rounded-2xl p-3.5 text-xs border" style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
                  <p className="font-bold text-amber-800 mb-0.5">Upload your permit to start selling</p>
                  <p className="text-amber-700">You need a valid CA Cottage Food Permit to post listings.</p>
                  <button className="mt-1.5 text-amber-700 font-semibold underline underline-offset-2">Upload permit →</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Listings',  value: cookListings?.length ?? 0,             suffix: '' },
            { label: 'Moments',   value: (moments as any[] | null)?.length ?? 0, suffix: '' },
            { label: 'Reviews',   value: profile.review_count ?? 0,             suffix: '' },
            { label: 'Rating',    value: (profile.rating_avg ?? 0).toFixed(1),  suffix: '★' },
          ].map(({ label, value, suffix }) => (
            <div key={label} className="bg-white rounded-3xl border border-black/[0.05] shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold tabular-nums" style={{ color: '#1a3a2a' }}>
                {value}{suffix && <span className="text-amber-400 ml-0.5">{suffix}</span>}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Listings ── */}
        <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-base" style={{ color: '#1a3a2a' }}>
            {isOwnProfile ? 'My Listings' : `${profile.name ?? 'Cook'}'s Listings`}
          </h2>
          {!cookListings || cookListings.length === 0 ? (
            <p className="text-sm text-gray-400">No listings yet.</p>
          ) : (
            <div className="space-y-2">
              {cookListings.map(l => {
                const cuisine = l.cuisine_tag ?? '';
                const [from, to] = CUISINE_GRADIENTS[cuisine] ?? ['#94a3b8', '#475569'];
                return (
                  <Link
                    key={l.id}
                    href={`/listings/${l.id}`}
                    className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                    >
                      {l.emoji ?? '🍱'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: '#1a3a2a' }}>{l.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{cuisine} · {l.quantity_left} portions left</p>
                      <div className="mt-1.5 h-[3px] rounded-full bg-gray-100 overflow-hidden w-24">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.round((l.quantity_left / l.quantity_total) * 100)}%`,
                            backgroundColor: l.quantity_left <= 2 ? '#ef4444' : '#1a3a2a',
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-extrabold shrink-0 tabular-nums" style={{ color: l.price_cents === 0 ? '#16a34a' : '#1a3a2a' }}>
                      {formatPrice(l.price_cents)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Reviews ── */}
        <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-base" style={{ color: '#1a3a2a' }}>Reviews</h2>
          {!reviews || reviews.length === 0 ? (
            <p className="text-sm text-gray-400">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r, i) => {
                const reviewer = r.reviewer as { name: string | null } | null;
                const name = reviewer?.name ?? 'Anonymous';
                return (
                  <div key={r.id}>
                    {i > 0 && <div className="h-px bg-gray-100 mb-4" />}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: `linear-gradient(135deg, ${coverFrom}cc, ${coverTo}cc)` }}
                      >
                        {name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800">{name}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <Stars rating={r.stars_avg ?? 0} />
                        {r.comment && (
                          <p className="text-sm text-gray-600 leading-relaxed mt-1.5">{r.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Blog Posts ── */}
        {(blogPosts && blogPosts.length > 0) || isOwnProfile ? (
          <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base" style={{ color: '#1a3a2a' }}>
                {isOwnProfile ? 'My Blog Posts' : `${profile.name ?? 'Cook'}'s Posts`}
              </h2>
              {isOwnProfile && (
                <Link href="/blog/write" className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  ✏️ Write a Post
                </Link>
              )}
            </div>
            {!blogPosts || blogPosts.length === 0 ? (
              <p className="text-sm text-gray-400">No posts yet.</p>
            ) : (
              <div className="space-y-2">
                {(blogPosts as any[]).map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
                  >
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-amber-50">
                        📝
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate group-hover:text-amber-600 transition-colors" style={{ color: '#1a3a2a' }}>
                        {post.title}
                      </p>
                      {post.excerpt && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>❤️ {post.like_count}</span>
                        <span>·</span>
                        <span>👁 {post.view_count}</span>
                        <span>·</span>
                        <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* ── Moments ── */}
        {((moments as any[] | null) && (moments as any[]).length > 0) || isOwnProfile ? (
          <div className="bg-white rounded-3xl border border-black/[0.05] shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base" style={{ color: '#1a3a2a' }}>
                {isOwnProfile ? 'My Moments' : `${profile.name ?? 'Cook'}'s Moments`}
              </h2>
              {isOwnProfile && (
                <Link href="/discover/new" className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  + Share
                </Link>
              )}
            </div>
            {!(moments as any[] | null) || (moments as any[]).length === 0 ? (
              <p className="text-sm text-gray-400">No moments yet.</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {(moments as any[]).map((m: any) => (
                  <Link
                    key={m.id}
                    href={`/discover?focus=${m.id}`}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group"
                  >
                    {m.photo_urls?.[0] ? (
                      <img
                        src={m.photo_urls[0]}
                        alt={m.caption ?? ''}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-2xl"
                        style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
                      >
                        📸
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-3 text-white text-xs font-bold">
                        <span>♥ {m.like_count}</span>
                        <span>💬 {m.comment_count}</span>
                      </div>
                    </div>
                    {m.photo_urls?.length > 1 && (
                      <div className="absolute top-2 right-2 w-4 h-4">
                        <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 drop-shadow">
                          <path d="M4 6a2 2 0 012-2h2.5M20 18a2 2 0 01-2 2h-2.5M8.5 4H18a2 2 0 012 2v9.5M4 8.5V18a2 2 0 002 2h9.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                        </svg>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : null}

        <div className="h-4" />
      </main>
    </div>
  );
}
