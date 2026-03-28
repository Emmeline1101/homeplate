import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { getListing, getRecipe, getReviews, CUISINE_GRADIENTS } from '../../lib/mock';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

function formatPickup(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' };
  const s = new Date(start).toLocaleString('en-US', opts);
  const e = new Date(end).toLocaleString('en-US', { hour:'numeric', minute:'2-digit' });
  return `${s} – ${e}`;
}

const ALLERGEN_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  peanuts:   { bg:'#fef2f2', text:'#dc2626', border:'#fecaca' },
  tree_nuts: { bg:'#fff7ed', text:'#c2410c', border:'#fed7aa' },
  gluten:    { bg:'#fefce8', text:'#a16207', border:'#fef08a' },
  dairy:     { bg:'#eff6ff', text:'#1d4ed8', border:'#bfdbfe' },
  eggs:      { bg:'#fffbeb', text:'#b45309', border:'#fde68a' },
  soy:       { bg:'#f0fdf4', text:'#15803d', border:'#bbf7d0' },
  shellfish: { bg:'#fdf4ff', text:'#7e22ce', border:'#e9d5ff' },
  sesame:    { bg:'#faf5ff', text:'#6d28d9', border:'#ddd6fe' },
  none:      { bg:'#f0fdf4', text:'#166534', border:'#bbf7d0' },
};

function Stars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} className={`${sz} ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.784.57-1.838-.197-1.54-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.099 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 00.95-.69l1.507-4.674z" />
        </svg>
      ))}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListing(id);
  if (!listing) notFound();

  const recipe  = getRecipe(listing.cuisine);
  const reviews = getReviews(id);

  const [gradFrom, gradTo] = CUISINE_GRADIENTS[listing.cuisine] ?? ['#94a3b8', '#475569'];
  const portionPct = (listing.portions / listing.totalPortions) * 100;
  const isLow      = listing.portions <= 2;
  const isFree     = listing.price === 0;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to listings
        </Link>

        {/* ── Hero photo ── */}
        <div
          className="w-full rounded-3xl overflow-hidden flex items-center justify-center text-8xl shadow-sm"
          style={{ height: 260, background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
        >
          {listing.emoji}
        </div>

        {/* ── Title card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">

          {/* Title + cuisine */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold leading-tight" style={{ color: '#1a3a2a' }}>
              {listing.title}
            </h1>
            <span
              className="shrink-0 text-xs font-bold px-3 py-1 rounded-full mt-1"
              style={{ background: `${gradFrom}22`, color: gradFrom }}
            >
              {listing.cuisine}
            </span>
          </div>

          {/* Allergens */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-gray-400 font-medium mr-0.5">Allergens:</span>
            {listing.allergens.map((a) => {
              const s = ALLERGEN_STYLE[a] ?? ALLERGEN_STYLE['none'];
              return (
                <span
                  key={a}
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize"
                  style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
                >
                  {a === 'none' ? 'Allergen-free' : a.replace('_', ' ')}
                </span>
              );
            })}
          </div>

          <hr className="border-gray-100" />

          {/* Cook */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
              style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
            >
              {listing.cook[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm" style={{ color: '#1a3a2a' }}>{listing.cook}</span>
                {listing.topCook && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                    ⭐ Top Cook
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{listing.cookCity}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Stars rating={listing.cookRating} />
                <span className="text-xs font-bold text-gray-700">{listing.cookRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({listing.cookReviews} reviews)</span>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
        </div>

        {/* ── Availability card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-base" style={{ color: '#1a3a2a' }}>Availability</h2>

          {/* Portions bar */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className={`font-semibold ${isLow ? 'text-red-500' : 'text-gray-700'}`}>
                {isLow ? '⚡ Almost gone!' : 'Portions available'}
              </span>
              <span className="text-gray-400">{listing.portions} of {listing.totalPortions}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width:`${portionPct}%`, backgroundColor: isLow ? '#ef4444' : '#1a3a2a' }}
              />
            </div>
          </div>

          {/* Price + pickup */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Price per portion</p>
              <p className="text-2xl font-bold" style={{ color: isFree ? '#16a34a' : '#1a3a2a' }}>
                {formatPrice(listing.price)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Pickup window</p>
              <p className="text-sm font-semibold text-gray-800 leading-snug">
                {formatPickup(listing.pickupStart, listing.pickupEnd)}
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            className="w-full rounded-2xl text-white font-bold text-base py-4 transition-opacity hover:opacity-90 shadow-sm"
            style={{ backgroundColor: '#1a3a2a' }}
          >
            Request Exchange
          </button>
        </div>

        {/* ── Recipe card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base" style={{ color: '#1a3a2a' }}>Recipe</h2>
            <div className="flex gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/>
                </svg>
                {recipe.cookTimeMins} min
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                {recipe.servings} servings
              </span>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Ingredients</h3>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: gradFrom }} />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-gray-100" />

          {/* Steps */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Instructions</h3>
            <ol className="space-y-3.5">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                    style={{ backgroundColor: '#1a3a2a' }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base" style={{ color: '#1a3a2a' }}>Reviews</h2>
            <div className="flex items-center gap-1.5">
              <Stars rating={listing.cookRating} size="sm" />
              <span className="text-sm font-bold text-gray-700">{listing.cookRating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">· {listing.cookReviews} total</span>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((review, i) => (
              <div key={review.id}>
                {i > 0 && <hr className="border-gray-100 mb-4" />}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-bold shrink-0">
                    {review.reviewer[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800">{review.reviewer}</span>
                      <span className="text-xs text-gray-400 shrink-0">{review.date}</span>
                    </div>
                    <Stars rating={review.stars} size="sm" />
                    <p className="text-sm text-gray-600 leading-relaxed mt-1.5">{review.comment}</p>
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
