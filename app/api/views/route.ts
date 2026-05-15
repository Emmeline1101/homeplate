import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../lib/supabaseServer';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { listing_id?: string; source?: string };
  const listing_id = body.listing_id?.trim();
  if (!listing_id) {
    return NextResponse.json({ error: 'listing_id required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, reason: 'unauthenticated' });
  }

  await supabase.from('listing_views').insert({
    user_id: user.id,
    listing_id,
    source: body.source ?? 'feed',
  });

  return NextResponse.json({ ok: true });
}
