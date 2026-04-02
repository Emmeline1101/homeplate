@AGENTS.md
# HomePlate

Nationwide peer-to-peer homemade food exchange platform.
Tagline: "Cook what you love. Share with your neighbors."

## Commands
- `npm run dev`    — Start dev server on port 3000
- `npm run build`  — Production build
- `npm test`       — Run Jest tests
- `npm run lint`   — ESLint check
- `vercel --prod`  — Deploy to production

## Tech Stack
- Next.js 15 App Router + TypeScript (strict mode)
- Supabase — PostgreSQL database, Auth, Storage, Row Level Security
- Mapbox GL JS — interactive map with geo clustering
- Tailwind CSS — styling
- Resend — transactional email
- Stripe — payments for paid listings
- Claude API — recipe AI and content moderation
- Vercel — deployment and edge functions
- PostHog — analytics

## Architecture
- Server Components by default
- Add "use client" only for interactive components (map, forms)
- All DB access via Supabase in server components or server actions
- No direct client-side DB queries
- Row Level Security enforced at DB level — never bypass it
- Images stored in Supabase Storage at: listings/{user_id}/{uuid}.jpg
- No `any` types — TypeScript strict mode enforced

## Database Tables
- users — id, email, name, avatar_url, bio, city, state, zip,
  lat, lng, rating_avg, review_count, top_cook_badge,
  stripe_account_id, created_at
- listings — id, user_id, title, description, cuisine_tag,
  allergens[], quantity_total, quantity_left, made_at,
  expires_at, pickup_start, pickup_end, price_cents,
  photo_urls[], recipe_id, status, report_count, lat, lng,
  created_at
- recipes — id, listing_id, user_id, ingredients (jsonb),
  steps (jsonb), cook_time_mins, servings, is_public, created_at
- exchanges — id, listing_id, requester_id, provider_id,
  quantity, pickup_time, status, payment_intent_id, created_at
- reviews — id, exchange_id, reviewer_id, reviewee_id,
  stars_taste, stars_safety, stars_packaging,
  stars_punctuality, comment, created_at
- reports — id, listing_id, reporter_id, reason, created_at

## Key Business Rules
- User location stored as lat/lng; map displays city-level only,
  never exact address
- Every listing MUST include allergens[] before publishing
- Listings auto-expire 48 hours after made_at
- Exchange flow: pending → confirmed → completed → reviewed
- rating_avg and review_count updated via Supabase DB trigger
- 3 reports on one listing → auto-hidden, admin notified
- Cooks with avg rating below 3.0 require admin approval
  before new listings go live
- Stripe used only for paid listings; free exchanges skip payment

## Pages
- /             — Map + browse feed (split view)
- /explore      — Browse by cuisine, city, trending
- /listings/[id]— Listing detail + recipe panel
- /profile/[id] — Cook profile, listings, reviews received
- /post         — Create or edit a listing
- /dashboard    — My exchanges (pending, active, completed)
- /recipes      — Public recipe index (SEO)
- /admin        — Moderation queue (staff only)

## Environment Variables Needed
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_MAPBOX_TOKEN
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RESEND_API_KEY
ANTHROPIC_API_KEY
NEXT_PUBLIC_POSTHOG_KEY

