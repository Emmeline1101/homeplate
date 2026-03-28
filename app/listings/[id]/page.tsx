import Navbar from '../../components/Navbar';

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_LISTING = {
  id: '1',
  title: 'Grandma\'s Kung Pao Chicken',
  cuisine: 'Chinese',
  description:
    'A classic Sichuan dish with tender wok-tossed chicken, crunchy peanuts, dried chilies, ' +
    'and Sichuan peppercorns in a rich, savory-sweet sauce. This recipe has been in my family ' +
    'for three generations — each batch is made fresh the morning of pickup using free-range ' +
    'chicken and house-ground chili paste.',
  allergens: ['peanuts', 'soy', 'gluten'],
  portionsLeft: 4,
  totalPortions: 6,
  priceCents: 800,
  pickupStart: '2026-03-28T11:00',
  pickupEnd: '2026-03-28T14:00',
  emoji: '🥡',
  accentColor: '#ef4444',
  bgColor: '#ef444418',
  cook: {
    name: 'Wei Zhang',
    city: 'San Francisco, CA',
    ratingAvg: 4.8,
    reviewCount: 37,
    topCook: true,
  },
};

const MOCK_RECIPE = {
  cookTimeMins: 25,
  servings: 2,
  ingredients: [
    '450 g boneless chicken thigh, cut into 2 cm cubes',
    '½ cup roasted peanuts',
    '8–10 dried red chilies, seeds removed',
    '1 tsp Sichuan peppercorns',
    '3 cloves garlic, minced',
    '1 tbsp fresh ginger, grated',
    '3 stalks scallion, cut into 3 cm pieces',
    '2 tbsp soy sauce',
    '1 tbsp dark soy sauce',
    '1 tbsp Shaoxing rice wine',
    '1 tsp cornstarch',
    '1 tbsp chili bean paste (doubanjiang)',
    '1 tsp sesame oil',
    '1 tsp sugar',
    '2 tbsp neutral oil for wok',
  ],
  steps: [
    'Marinate chicken cubes in soy sauce, Shaoxing wine, and cornstarch for 15 minutes.',
    'Mix sauce: combine dark soy sauce, chili bean paste, sugar, and sesame oil in a small bowl.',
    'Heat wok over high heat until smoking. Add oil, then fry dried chilies and Sichuan peppercorns for 30 seconds until fragrant.',
    'Add marinated chicken in a single layer. Let sear undisturbed for 90 seconds, then toss until golden on all sides.',
    'Push chicken to the side; add garlic and ginger to the center and stir-fry for 30 seconds.',
    'Pour in the sauce mixture and toss everything together to coat evenly.',
    'Add peanuts and scallions. Stir-fry for another 60 seconds over high heat.',
    'Plate immediately. Serve with steamed jasmine rice.',
  ],
};

const MOCK_REVIEWS = [
  {
    id: 'r1',
    reviewer: 'Priya S.',
    stars: 5,
    comment:
      'Absolutely incredible. The Sichuan peppercorns had that perfect numbing heat, and the sauce was incredibly balanced. Will definitely request again!',
    date: 'Mar 22, 2026',
  },
  {
    id: 'r2',
    reviewer: 'James T.',
    stars: 5,
    comment:
      'Generous portion, beautifully packaged, and the flavor was restaurant-quality. Wei was also super friendly at pickup.',
    date: 'Mar 15, 2026',
  },
  {
    id: 'r3',
    reviewer: 'Hana N.',
    stars: 4,
    comment:
      'Really delicious — slightly spicier than I expected but my whole family loved it. Pickup was smooth and on time.',
    date: 'Mar 10, 2026',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number) {
  return cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`;
}

function formatPickup(start: string, end: string) {
  const fmt = (s: string) =>
    new Date(s).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  return `${fmt(start)} – ${fmt(end).split(',').pop()?.trim()}`;
}

function Stars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`${sz} ${i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.97-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.784.57-1.838-.197-1.54-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.099 10.1c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 00.95-.69l1.507-4.674z" />
        </svg>
      ))}
    </span>
  );
}

const ALLERGEN_COLORS: Record<string, string> = {
  peanuts:   'bg-red-50 text-red-600 border-red-200',
  tree_nuts: 'bg-orange-50 text-orange-600 border-orange-200',
  gluten:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  dairy:     'bg-blue-50 text-blue-600 border-blue-200',
  eggs:      'bg-amber-50 text-amber-600 border-amber-200',
  soy:       'bg-green-50 text-green-600 border-green-200',
  shellfish: 'bg-pink-50 text-pink-600 border-pink-200',
  sesame:    'bg-purple-50 text-purple-600 border-purple-200',
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params; // consume the promise (id unused with mock data)

  const listing = MOCK_LISTING;
  const recipe  = MOCK_RECIPE;
  const reviews = MOCK_REVIEWS;

  const portionPct    = (listing.portionsLeft / listing.totalPortions) * 100;
  const portionsIsLow = listing.portionsLeft <= 2;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* ── Hero photo ── */}
        <div
          className="w-full h-64 rounded-3xl flex items-center justify-center text-8xl shadow-sm"
          style={{ background: listing.bgColor }}
        >
          {listing.emoji}
        </div>

        {/* ── Title card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">

          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              {listing.title}
            </h1>
            <span
              className="shrink-0 text-sm font-semibold px-3 py-1 rounded-full mt-0.5"
              style={{ color: listing.accentColor, backgroundColor: listing.bgColor }}
            >
              {listing.cuisine}
            </span>
          </div>

          {/* Allergen badges */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs font-medium text-slate-500 self-center mr-1">Allergens:</span>
            {listing.allergens.map((a) => (
              <span
                key={a}
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${ALLERGEN_COLORS[a] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}
              >
                {a.replace('_', ' ')}
              </span>
            ))}
          </div>

          <hr className="border-slate-100" />

          {/* Cook profile */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-lg font-bold shrink-0">
              {listing.cook.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-900 text-sm">{listing.cook.name}</span>
                {listing.cook.topCook && (
                  <span className="text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
                    ⭐ Top Cook
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{listing.cook.city}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Stars rating={listing.cook.ratingAvg} />
                <span className="text-xs font-semibold text-slate-700">
                  {listing.cook.ratingAvg.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">
                  ({listing.cook.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">{listing.description}</p>
        </div>

        {/* ── Availability card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Availability</h2>

          {/* Portions bar */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className={`font-semibold ${portionsIsLow ? 'text-red-500' : 'text-slate-700'}`}>
                {portionsIsLow ? '⚡ Almost gone!' : 'Portions left'}
              </span>
              <span className="text-slate-500">
                {listing.portionsLeft} of {listing.totalPortions}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${portionPct}%`,
                  backgroundColor: portionsIsLow ? '#ef4444' : listing.accentColor,
                }}
              />
            </div>
          </div>

          {/* Price + pickup */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Price per portion</p>
              <p className="text-xl font-bold text-slate-900">
                {formatPrice(listing.priceCents)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Pickup window</p>
              <p className="text-sm font-semibold text-slate-800 leading-snug">
                {formatPickup(listing.pickupStart, listing.pickupEnd)}
              </p>
            </div>
          </div>

          {/* CTA */}
          <button className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-base py-4 shadow-md shadow-emerald-100 transition-colors">
            Request Exchange
          </button>
        </div>

        {/* ── Recipe card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recipe</h2>
            <div className="flex gap-3 text-xs text-slate-500">
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
            <h3 className="text-sm font-semibold text-slate-700 mb-2.5">Ingredients</h3>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: listing.accentColor }}
                  />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-slate-100" />

          {/* Steps */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Instructions</h3>
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                    style={{ backgroundColor: listing.accentColor }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Reviews</h2>
            <div className="flex items-center gap-1.5">
              <Stars rating={listing.cook.ratingAvg} size="sm" />
              <span className="text-sm font-semibold text-slate-700">
                {listing.cook.ratingAvg.toFixed(1)}
              </span>
              <span className="text-sm text-slate-400">
                · {listing.cook.reviewCount} total
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((review, i) => (
              <div key={review.id}>
                {i > 0 && <hr className="border-slate-100 mb-4" />}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold shrink-0">
                    {review.reviewer[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-800">
                        {review.reviewer}
                      </span>
                      <span className="text-xs text-slate-400 shrink-0">{review.date}</span>
                    </div>
                    <Stars rating={review.stars} size="sm" />
                    <p className="text-sm text-slate-600 leading-relaxed mt-1.5">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-4" />
      </main>
    </div>
  );
}
