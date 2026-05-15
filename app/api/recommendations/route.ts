/**
 * GET /api/recommendations
 *
 * Returns personalized listing recommendations based on the user's
 * viewing history. Algorithm:
 *
 * 1. Fetch user's last 50 viewed listing IDs.
 * 2. Fetch those listings' cuisine_tags to build a preference score.
 * 3. Fetch up to 80 active listings the user has NOT seen.
 * 4. Score candidates: +3 per cuisine match, +rating_avg bonus.
 * 5. Return top 12 sorted by score desc.
 *
 * Unauthenticated users get the 12 newest active listings instead.
 */

import { NextResponse } from 'next/server';
import { createClient } from '../../lib/supabaseServer';

type FeedListing = {
  id: string
  title: string
  cuisine_tag: string | null
  emoji: string | null
  photo_urls: string[]
  quantity_left: number
  quantity_total: number
  price_cents: number
  users: {
    name: string | null
    rating_avg: number
    top_cook_badge: boolean
    city: string | null
  } | null
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ── Fallback: unauthenticated or no history yet ───────────────────────────
  if (!user) {
    const { data } = await supabase
      .from('listings')
      .select('id, title, cuisine_tag, emoji, photo_urls, quantity_left, quantity_total, price_cents, users:user_id(name, rating_avg, top_cook_badge, city)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12);

    return NextResponse.json({ listings: (data ?? []) as unknown as FeedListing[], based_on: [] });
  }

  // ── Step 1: recent view IDs ───────────────────────────────────────────────
  const { data: viewRows } = await supabase
    .from('listing_views')
    .select('listing_id')
    .eq('user_id', user.id)
    .order('viewed_at', { ascending: false })
    .limit(50);

  const viewedIds = (viewRows ?? []).map((r) => r.listing_id);

  // ── Step 2: cuisine preference from viewed listings ───────────────────────
  const cuisineCounts: Record<string, number> = {};

  if (viewedIds.length > 0) {
    const { data: viewedListings } = await supabase
      .from('listings')
      .select('cuisine_tag')
      .in('id', viewedIds.slice(0, 30));

    for (const l of viewedListings ?? []) {
      if (l.cuisine_tag) {
        cuisineCounts[l.cuisine_tag] = (cuisineCounts[l.cuisine_tag] ?? 0) + 1;
      }
    }
  }

  const topCuisines = Object.entries(cuisineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);

  // ── Step 3: candidate listings (active, not yet viewed) ───────────────────
  const { data: candidates } = await supabase
    .from('listings')
    .select('id, title, cuisine_tag, emoji, photo_urls, quantity_left, quantity_total, price_cents, users:user_id(name, rating_avg, top_cook_badge, city)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(80);

  const viewedSet = new Set(viewedIds);
  const unseen = ((candidates ?? []) as unknown as FeedListing[]).filter(
    (l) => !viewedSet.has(l.id),
  );

  // ── Step 4: score + sort ──────────────────────────────────────────────────
  const scored = unseen.map((l) => ({
    listing: l,
    score:
      (cuisineCounts[l.cuisine_tag ?? ''] ?? 0) * 3 +
      (l.users?.rating_avg ?? 0),
  }));

  scored.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    listings: scored.slice(0, 12).map((s) => s.listing),
    based_on: topCuisines,
  });
}
