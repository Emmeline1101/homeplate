import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: [text],
      model: 'voyage-3',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Voyage API error: ${err}`);
  }

  const json = await res.json();
  return json.data[0].embedding as number[];
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!query) return NextResponse.json([]);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const embedding = await getEmbedding(query);

  const { data: matches, error } = await supabase.rpc('search_listings', {
    query_embedding: embedding,
    match_threshold: 0.1,
    match_count: 30,
  });

  if (error) {
    console.error('search_listings rpc error:', error);
    return NextResponse.json([], { status: 500 });
  }
  if (!matches?.length) return NextResponse.json([]);

  // 补全 users 数据
  const ids = matches.map((m: { id: string }) => m.id);
  const { data: full } = await supabase
    .from('listings')
    .select('id, title, description, cuisine_tag, emoji, quantity_left, quantity_total, price_cents, users:user_id(name, rating_avg, top_cook_badge, city)')
    .in('id', ids);

  const similarityMap = Object.fromEntries(matches.map((m: { id: string; similarity: number }) => [m.id, m.similarity]));
  const enriched = (full ?? []).map(l => ({ ...l, similarity: similarityMap[l.id] }));
  enriched.sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));

  return NextResponse.json(enriched);
}
