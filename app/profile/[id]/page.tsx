import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { LISTINGS, CUISINE_GRADIENTS } from '../../lib/mock';

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

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // For mock data, derive a "cook" profile from any listing by this cook.
  // In production this would be a Supabase query on the users table.
  const allListings = LISTINGS;
  const cookListings = id === 'me'
    ? allListings.slice(0, 4)   // "my" profile shows first 4 as demo
    : allListings.filter(l => l.id === id || l.cook.toLowerCase().replace(/\s+/g, '-') === id);

  const sample = cookListings[0] ?? allListings[0];
  const cookName   = id === 'me' ? 'You' : sample.cook;
  const cookCity   = sample.cookCity;
  const cookRating = sample.cookRating;
  const cookReviews = sample.cookReviews;
  const isTopCook  = sample.topCook;

  // Mock permit status based on id parity
  const permitStatus: 'verified' | 'pending' | 'none' =
    id === 'me' ? 'pending' : (parseInt(sample.id) % 3 === 0 ? 'pending' : 'verified');

  const reviews = [
    { reviewer: 'Sandra K.', stars: 5, comment: 'Amazing quality and so beautifully packaged. Will definitely order again!', date: 'Mar 2026' },
    { reviewer: 'Tom H.',    stars: 5, comment: 'Less sweet than anything I\'ve found at a store — exactly what I was looking for.', date: 'Feb 2026' },
    { reviewer: 'Amy L.',    stars: 4, comment: 'Great product, super easy pickup experience. The mochi was perfectly chewy.', date: 'Feb 2026' },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Profile header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Cover */}
          <div className="h-24 md:h-32" style={{ background: 'linear-gradient(135deg, #1a3a2a, #2d6a4f)' }} />

          {/* Avatar + info */}
          <div className="px-5 pb-5">
            <div className="-mt-10 mb-3 flex items-end justify-between">
              <div
                className="w-20 h-20 rounded-2xl border-4 border-white flex items-center justify-center text-3xl font-bold text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                {cookName[0]}
              </div>
              {id === 'me' && (
                <button className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold" style={{ color: '#1a3a2a' }}>{cookName}</h1>
                {isTopCook && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">⭐ Top Cook</span>
                )}
              </div>

              <p className="text-sm text-gray-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {cookCity}
              </p>

              <div className="flex items-center gap-2">
                <Stars rating={cookRating} />
                <span className="text-sm font-bold text-gray-700">{cookRating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">· {cookReviews} reviews</span>
              </div>

              <PermitBadge status={permitStatus} />

              {id === 'me' && permitStatus !== 'verified' && (
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  <p className="font-semibold mb-0.5">Upload your permit to start selling</p>
                  <p>You need a valid CA Cottage Food Permit to post listings.</p>
                  <button className="mt-1.5 text-amber-700 font-semibold underline underline-offset-2">Upload permit →</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Listings', value: cookListings.length },
            { label: 'Exchanges', value: cookReviews },
            { label: 'Rating', value: cookRating.toFixed(1) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: '#1a3a2a' }}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Listings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-base" style={{ color: '#1a3a2a' }}>
            {id === 'me' ? 'My Listings' : `${cookName}'s Listings`}
          </h2>
          {cookListings.length === 0 ? (
            <p className="text-sm text-gray-400">No listings yet.</p>
          ) : (
            <div className="space-y-3">
              {cookListings.map(l => {
                const [from, to] = CUISINE_GRADIENTS[l.cuisine] ?? ['#94a3b8', '#475569'];
                return (
                  <Link
                    key={l.id}
                    href={`/listings/${l.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                    >
                      {l.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{l.title}</p>
                      <p className="text-xs text-gray-400">{l.cuisine} · {l.portions} portions left</p>
                    </div>
                    <span className="text-sm font-bold shrink-0" style={{ color: l.price === 0 ? '#16a34a' : '#1a3a2a' }}>
                      {formatPrice(l.price)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-base" style={{ color: '#1a3a2a' }}>Reviews</h2>
          <div className="space-y-4">
            {reviews.map((r, i) => (
              <div key={i}>
                {i > 0 && <hr className="border-gray-100 mb-4" />}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                    {r.reviewer[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-800">{r.reviewer}</span>
                      <span className="text-xs text-gray-400">{r.date}</span>
                    </div>
                    <Stars rating={r.stars} />
                    <p className="text-sm text-gray-600 leading-relaxed mt-1">{r.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-4" />
      </main>
    </div>
  );
}
