# HomePlate — Product Spec v1.0

## Overview
A nationwide peer-to-peer platform where home cooks share
portions of homemade dishes with neighbors across the US.
Think Airbnb for home-cooked food — every neighborhood
becomes a permanent potluck.

## Target Users
- Home cooks: make 4–6 portions, list them for exchange
- Food explorers: browse the map, request dishes to try
- Most users will be both cook and explorer

## Go-to-Market
- Launch in 3 ZIP codes in the Bay Area first
- Expand to full Bay Area, then LA and NYC
- SEO via public recipe pages for long-term organic traffic
- Content loop: "what my neighbor made me" on social media

---

## Feature 1: Map
- Full US map via Mapbox GL JS
- Auto-locate user on load (with permission)
- Listings shown as clustered pins, expanding on zoom
- Click a pin → ListingCard preview (photo, dish name,
  cook name, cuisine tag, portions left, distance)
- Filter sidebar: cuisine type, allergen-free, max distance,
  available now, min cook rating
- City and ZIP code search bar
- "Near me" toggle for listings within 2 miles

## Feature 2: Listings & Recipes
- Cook posts a dish with:
  - Title, description, cuisine tag (30+ options)
  - Up to 5 photo uploads
  - Portions available (1–20)
  - Pickup window (date and time range)
  - Price in cents OR free exchange toggle
  - Optional: full recipe with ingredients and steps
  - Optional: "secret recipe" mode — shows dish, hides recipe
- Listing auto-expires 48h after made_at timestamp
- Cook can pause a listing without deleting it
- Recipe pages are public, shareable, and SEO-indexed
- Users can bookmark and save listings

## Feature 3: Exchange Flow
- Two modes:
  - Free swap: I give you X, you give me Y (no payment)
  - Paid: requester pays via Stripe for a portion
- Steps:
  1. Requester selects portion count and pickup time
  2. Cook receives email + in-app notification
  3. Cook confirms or declines (with optional reason)
  4. Both parties receive pickup confirmation
  5. Requester marks "picked up"
  6. Cook marks "exchange complete"
  7. Review prompt sent to both within 1 hour

## Feature 4: Rating System
- Reviews required to unlock next exchange request
- 4 dimensions rated 1–5 stars each:
  - Taste
  - Food Safety
  - Packaging and Presentation
  - Punctuality
- Optional written comment (max 400 characters)
- Reviews are public on the cook's profile and listing page
- Cook's overall score = weighted average across all dimensions
- Score below 3.0 → warning banner + admin review gate
- "Top Cook" badge: 50+ reviews and 4.5+ average

## Feature 5: Food Safety
- Required fields on every listing:
  - Allergens: peanuts, tree nuts, gluten, dairy, eggs, soy,
    shellfish, sesame, fish, sulfites, none
  - Made date and approximate time
  - Needs reheating (yes or no)
  - Safe until (auto-set to made_at + 48 hours)
  - Storage tip (100 characters max)
- Safety disclaimer modal required before every publish:
  "I confirm this food was prepared in a clean environment
  and is safe for consumption. All allergens are disclosed."
- Report button on every listing
  (reasons: unsafe, mislabeled allergens, expired, suspicious)
- 3 reports → listing auto-hidden + admin notified
- Admin dashboard: review flagged listings, ban users,
  approve low-rated cooks

## Feature 6: AI (Claude API)
- Recipe generator: cook describes a dish, AI writes
  full recipe with ingredients and step-by-step instructions
- Allergen checker: AI scans listing description and flags
  any potential undisclosed allergens before publishing
- Content moderation: AI pre-screens descriptions for
  safety red flags before human admin review

---

## MVP Scope — Ship These First
- Auth (email + Google via Supabase)
- User profiles with location (city level)
- Create, browse, and search listings
- Map view with Mapbox
- Basic exchange request and confirm flow
- Simple 5-star rating (single score)
- Allergen labels and safety disclaimer
- Email notifications via Resend
- Deploy on Vercel

## Phase 2
- Full 4-dimension review system
- Stripe payments for paid listings
- Recipe display and public recipe index
- AI recipe generator and allergen checker
- Admin moderation dashboard
- Push notifications

## Phase 3
- Mobile app (React Native)
- Cook verification program
- Top Cook badges and leaderboard
- Community events (neighborhood potlucks)
- Canada expansion

---

## Legal Notes
- Users accept Terms of Service confirming food is homemade
- Platform is a marketplace, not a food seller
- Link to cottage food laws by state on safety page
- Platform is not liable for food safety incidents (in T&C)
```
