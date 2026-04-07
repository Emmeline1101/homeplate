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

  if (!res.ok) throw new Error(`Voyage API error: ${await res.text()}`);
  const json = await res.json();
  return json.data[0].embedding as number[];
}

export async function POST(req: NextRequest) {
  const { listingId, title, description, cuisine_tag } = await req.json();

  if (!listingId || !title) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const text = [title, description, cuisine_tag].filter(Boolean).join(' ');
  const embedding = await getEmbedding(text);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await supabase
    .from('listings')
    .update({ embedding })
    .eq('id', listingId);

  if (error) {
    console.error('embed update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
