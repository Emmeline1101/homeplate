import { notFound } from 'next/navigation';
import Link from 'next/link';
import BackButton from '../../components/BackButton';
import RequestExchangeButton from '../../components/RequestExchangeButton';
import MessageSellerButton from '../../components/MessageSellerButton';
import CartIcon from '../../components/CartIcon';
import { CUISINE_GRADIENTS } from '../../lib/mock';
import { createClient } from '../../lib/supabaseServer';
import type { Listing, Recipe } from '../../lib/database.types';

type ListingWithCook = Listing & {
  cook: {
    id: string; name: string | null; avatar_url: string | null;
    rating_avg: number; review_count: number; top_cook_badge: boolean; city: string | null;
  } | null;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

function formatPickup(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  const s = new Date(start).toLocaleString('en-US', opts);
  const e = new Date(end).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${s} – ${e}`;
}

const ALLERGEN_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  peanuts:   { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  tree_nuts: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  gluten:    { bg: '#fefce8', text: '#a16207', border: '#fef08a' },
  dairy:     { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  eggs:      { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  soy:       { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  shellfish: { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
  sesame:    { bg: '#faf5ff', text: '#6d28d9', border: '#ddd6fe' },
  none:      { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
};

function Stars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
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
  const supabase = await createClient();

  // Fetch listing + cook info
  const { data: listing } = await supabase
    .from('listings')
    .select(`*, cook:user_id(id, name, avatar_url, rating_avg, review_count, top_cook_badge, city)`)
    .eq('id', id)
    .single() as { data: ListingWithCook | null; error: unknown };

  if (!listing) notFound();

  const cook = listing.cook;

  // Fetch recipe for this listing
  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('listing_id', id)
    .maybeSingle() as { data: Recipe | null; error: unknown };

  // Fetch recent reviews for the cook
  const { data: reviews } = cook?.id
    ? await supabase
        .from('reviews')
        .select('id, stars_avg, comment, created_at, reviewer:users!reviewer_id(name)')
        .eq('reviewee_id', cook.id)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] };

  const activeListing = listing;

  const cuisine     = activeListing.cuisine_tag ?? '';
  const [gradFrom, gradTo] = CUISINE_GRADIENTS[cuisine] ?? ['#94a3b8', '#475569'];
  const portionPct  = (activeListing.quantity_left / activeListing.quantity_total) * 100;
  const isSoldOut   = activeListing.quantity_left === 0 || activeListing.status === 'sold_out';
  const isLow       = !isSoldOut && activeListing.quantity_left <= 2;
  const isFree      = activeListing.price_cents === 0;
  const cookName    = cook?.name ?? 'Unknown Cook';
  const cookRating  = cook?.rating_avg ?? 0;
  const cookReviews = cook?.review_count ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── Full-bleed hero ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: '62vh', minHeight: 340, maxHeight: 520 }}
      >
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(160deg, ${gradFrom} 0%, ${gradTo} 60%, #0d2218 100%)` }}
        />
        <div
          className="absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '220px',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 120% 100% at 50% 100%, rgba(0,0,0,0.55) 0%, transparent 60%)' }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-28"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 100%)' }}
        />
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, transparent 70%)' }}
        />

        {/* Emoji */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0" style={{ paddingTop: 48 }}>
          <div
            className="absolute"
            style={{
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
          <span
            className="relative select-none"
            style={{
              fontSize: 120, lineHeight: 1,
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.45)) drop-shadow(0 2px 6px rgba(0,0,0,0.3))',
            }}
          >
            {activeListing.emoji ?? '🍱'}
          </span>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 80, background: 'linear-gradient(to top, #ffffff 0%, transparent 100%)' }}
        />

        {/* Floating controls */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 md:pt-4">
          <BackButton fallback="/" />
          <div className="flex items-center gap-2">
            {isSoldOut ? (
              <span className="text-[11px] font-extrabold tracking-wide px-2.5 py-1 rounded-full bg-gray-700 text-white shadow-md">
                SOLD OUT
              </span>
            ) : isLow && (
              <span className="text-[11px] font-extrabold tracking-wide px-2.5 py-1 rounded-full bg-red-500 text-white shadow-md">
                {activeListing.quantity_left} LEFT
              </span>
            )}
            {cook?.top_cook_badge && (
              <span className="text-[11px] font-extrabold tracking-wide px-2.5 py-1 rounded-full bg-amber-400 text-white shadow-md">
                ⭐ TOP
              </span>
            )}
            {isFree && (
              <span className="text-[11px] font-extrabold tracking-wide px-2.5 py-1 rounded-full shadow-md text-emerald-700"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}>
                FREE
              </span>
            )}
            <CartIcon variant="light" />
          </div>
        </div>

        {/* Cuisine tag */}
        <div className="absolute bottom-6 left-4">
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full text-white shadow-md"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
          >
            {cuisine}
          </span>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pb-64 md:pb-12 space-y-3 -mt-1">

        {/* Title + cook card */}
        <div className="bg-white space-y-4 pt-2 pb-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-[22px] font-extrabold leading-tight tracking-tight" style={{ color: '#1a3a2a' }}>
              {activeListing.title}
            </h1>
            <span
              className="shrink-0 text-lg font-extrabold tabular-nums mt-0.5"
              style={{ color: isFree ? '#16a34a' : '#1a3a2a' }}
            >
              {formatPrice(activeListing.price_cents)}
            </span>
          </div>

          {/* Cook row */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
            >
              {cookName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm text-gray-900">{cookName}</span>
                {cook?.top_cook_badge && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                    ⭐ Top Cook
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Stars rating={cookRating} size="sm" />
                <span className="text-xs font-bold text-gray-700">{cookRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">· {cook?.city ?? ''}</span>
              </div>
            </div>
            {cook?.id && (
              <Link
                href={`/profile/${cook.id}`}
                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Profile
              </Link>
            )}
          </div>

          {/* Description */}
          {activeListing.description && (
            <p className="text-sm text-gray-500 leading-relaxed">{activeListing.description}</p>
          )}

          {/* Allergens */}
          {activeListing.allergens && activeListing.allergens.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-gray-400 font-medium">Allergens:</span>
              {activeListing.allergens.map((a) => {
                const s = ALLERGEN_STYLE[a] ?? ALLERGEN_STYLE['none'];
                return (
                  <span key={a} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize"
                    style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}>
                    {a === 'none' ? 'Allergen-free' : a.replace('_', ' ')}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Video ── */}
        {activeListing.video_url && (
          <div className="py-4 border-b border-gray-100 space-y-3">
            <h2 className="font-bold text-sm tracking-wide uppercase text-gray-400">Video</h2>
            <video
              src={activeListing.video_url}
              controls
              playsInline
              preload="metadata"
              className="w-full rounded-2xl bg-black"
              style={{ maxHeight: 360 }}
            />
          </div>
        )}

        {/* ── Availability ── */}
        <div className="py-4 border-b border-gray-100 space-y-4">
          <h2 className="font-bold text-sm tracking-wide uppercase text-gray-400">Availability</h2>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className={`font-semibold ${isSoldOut ? 'text-gray-400' : isLow ? 'text-red-500' : 'text-gray-700'}`}>
                {isSoldOut ? 'No portions left' : isLow ? '⚡ Almost gone' : 'Portions available'}
              </span>
              <span className="text-gray-400 tabular-nums">{activeListing.quantity_left} / {activeListing.quantity_total}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${portionPct}%`, backgroundColor: isLow ? '#ef4444' : '#1a3a2a' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#f7f4ef' }}>
              <p className="text-[11px] font-medium text-gray-400 mb-1">Price per portion</p>
              <p className="text-xl font-extrabold tabular-nums" style={{ color: isFree ? '#16a34a' : '#1a3a2a' }}>
                {formatPrice(activeListing.price_cents)}
              </p>
            </div>
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#f7f4ef' }}>
              <p className="text-[11px] font-medium text-gray-400 mb-1">Pickup window</p>
              <p className="text-xs font-semibold text-gray-800 leading-snug">
                {activeListing.pickup_start && activeListing.pickup_end
                  ? formatPickup(activeListing.pickup_start, activeListing.pickup_end)
                  : 'TBD'}
              </p>
            </div>
          </div>

          <div className="hidden md:block space-y-2">
            <RequestExchangeButton item={{
              listingId: activeListing.id,
              title: activeListing.title,
              cuisine: cuisine,
              cook: cookName,
              emoji: activeListing.emoji ?? '🍱',
              price: activeListing.price_cents,
              maxPortions: activeListing.quantity_left,
              pickupStart: activeListing.pickup_start ?? '',
              pickupEnd: activeListing.pickup_end ?? '',
            }} disabled={isSoldOut} />
            <MessageSellerButton cookName={cookName} listingId={activeListing.id} />
          </div>
        </div>

        {/* ── Recipe ── */}
        {recipe && (
          <div className="py-4 border-b border-gray-100 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm tracking-wide uppercase text-gray-400">Recipe</h2>
              <div className="flex gap-4 text-xs text-gray-400">
                {recipe.cook_time_mins && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                    </svg>
                    {recipe.cook_time_mins} min
                  </span>
                )}
                {recipe.servings && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {recipe.servings} servings
                  </span>
                )}
              </div>
            </div>

            {/* Ingredients */}
            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-gray-300 mb-3">Ingredients</p>
                <ul className="space-y-2.5">
                  {(recipe.ingredients as Array<{ name: string; amount: string; unit: string }>).map((ing, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                      <span
                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: gradFrom }}
                      >
                        {i + 1}
                      </span>
                      {ing.amount} {ing.unit} {ing.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="h-px bg-gray-100" />

            {/* Steps */}
            {Array.isArray(recipe.steps) && recipe.steps.length > 0 && (
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-gray-300 mb-3">Instructions</p>
                <ol className="space-y-4">
                  {(recipe.steps as Array<{ step_number: number; instruction: string }>).map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                        style={{ backgroundColor: '#1a3a2a' }}
                      >
                        {step.step_number}
                      </span>
                      <p className="text-sm text-gray-600 leading-relaxed">{step.instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* ── Reviews ── */}
        <div className="py-4 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm tracking-wide uppercase text-gray-400">Reviews</h2>
            <div className="flex items-center gap-1.5">
              <Stars rating={cookRating} size="sm" />
              <span className="text-sm font-bold text-gray-700">{cookRating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">· {cookReviews}</span>
            </div>
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="space-y-5">
              {reviews.map((review, i) => {
                const reviewer = review.reviewer as { name: string | null } | null;
                const name = reviewer?.name ?? 'Anonymous';
                return (
                  <div key={review.id}>
                    {i > 0 && <div className="h-px bg-gray-100 mb-5" />}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: `linear-gradient(135deg, ${gradFrom}cc, ${gradTo}cc)` }}
                      >
                        {name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-800">{name}</span>
                          <span className="text-xs text-gray-400 shrink-0">
                            {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <Stars rating={review.stars_avg ?? 0} size="sm" />
                        {review.comment && (
                          <p className="text-sm text-gray-600 leading-relaxed mt-1.5">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No reviews yet.</p>
          )}
        </div>

      </main>

      {/* ── Sticky mobile CTA bar ── */}
      <div
        className="md:hidden fixed bottom-16 left-0 right-0 px-4 pt-3 pb-2 border-t border-gray-100 space-y-2"
        style={{ backgroundColor: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[11px] text-gray-400">Price per portion</p>
            <p className="text-lg font-extrabold tabular-nums" style={{ color: isFree ? '#16a34a' : '#1a3a2a' }}>
              {formatPrice(activeListing.price_cents)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Stars rating={cookRating} size="sm" />
            <span className="text-xs font-bold text-gray-600 ml-0.5">{cookRating.toFixed(1)}</span>
          </div>
        </div>
        <RequestExchangeButton item={{
          listingId: activeListing.id,
          title: activeListing.title,
          cuisine: cuisine,
          cook: cookName,
          emoji: activeListing.emoji ?? '🍱',
          price: activeListing.price_cents,
          maxPortions: activeListing.quantity_left,
          pickupStart: activeListing.pickup_start ?? '',
          pickupEnd: activeListing.pickup_end ?? '',
        }} />
        <MessageSellerButton cookName={cookName} listingId={activeListing.id} />
      </div>
    </div>
  );
}
