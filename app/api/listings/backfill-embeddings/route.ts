import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: [text], model: 'voyage-3' }),
  });
  if (!res.ok) throw new Error(`Voyage API error: ${await res.text()}`);
  const json = await res.json();
  return json.data[0].embedding as number[];
}

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 只取 embedding 为 null 的 listing
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, description, cuisine_tag')
    .is('embedding', null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!listings?.length) return NextResponse.json({ message: 'nothing to backfill', count: 0 });

  let success = 0;
  const errors: { id: string; error: string }[] = [];

  for (const l of listings) {
    try {
      const text = [l.title, l.description, l.cuisine_tag].filter(Boolean).join(' ');
      const embedding = await getEmbedding(text);
      const { error: updateError } = await supabase.from('listings').update({ embedding }).eq('id', l.id);
      if (updateError) throw new Error(updateError.message);
      success++;
      // 3 RPM 限制：每次等 21 秒
      await new Promise(r => setTimeout(r, 21000));
    } catch (e) {
      errors.push({ id: l.id, error: String(e) });
    }
  }

  return NextResponse.json({ total: listings.length, success, failed: errors.length, errors });
}
