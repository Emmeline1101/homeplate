import { createClient } from '@supabase/supabase-js';

const SYSTEM = `You are a friendly assistant on HomeBites, a community marketplace for homemade food makers.

Your expertise:
- Recommending food listings from the platform based on ingredients the user has
- California Cottage Food Law (AB 1616, SB 1591): Class A (direct sales only) vs Class B (indirect/home delivery allowed)
- Allowed cottage food items: baked goods without cream/custard/meat, jams, jellies, candy, chocolate, dried goods, granola, roasted nuts, honey, tea blends
- NOT allowed: hot food, refrigerated dairy-based products, meat, fresh pasta with eggs, food requiring refrigeration
- Helping sellers write appealing, accurate descriptions of their cottage food
- Asian baking techniques and ingredients (matcha, ube, taro, mochi, red bean, pandan, etc.)
- General food allergy disclosure best practices

Tone: Warm, knowledgeable, concise. You love food and the food community. Keep responses under 150 words unless a detailed answer is genuinely needed.

When listing recommendations are provided in [AVAILABLE LISTINGS], always reference specific items by name and mention the cook's name if available. Be encouraging and specific.`;

const INGREDIENT_KEYWORDS = [
  'i have', 'ingredient', 'what can i', 'what food', 'what dish',
  'recommend', 'suggest', 'looking for', 'want to buy', 'find me',
  '我有', '食材', '推荐', '建议', '想买', '找', 'what should i',
  'i want', 'craving', 'hungry', 'what matches', 'pairs well',
];

function isIngredientOrFoodQuery(messages: { role: string; content: string }[]): boolean {
  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUser) return false;
  const lower = lastUser.content.toLowerCase();
  return INGREDIENT_KEYWORDS.some(k => lower.includes(k));
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: [text], model: 'voyage-3' }),
  });
  if (!res.ok) throw new Error(`Voyage error: ${await res.text()}`);
  const json = await res.json();
  return json.data[0].embedding as number[];
}

type ListingResult = {
  id: string;
  title: string;
  description: string | null;
  cuisine_tag: string | null;
  emoji: string | null;
  quantity_left: number;
  price_cents: number;
  similarity?: number;
  users?: { name: string | null; rating_avg: number; top_cook_badge: boolean; city: string | null } | null;
};

async function searchRelevantListings(query: string): Promise<ListingResult[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const embedding = await getEmbedding(query);

    const { data: matches, error } = await supabase.rpc('search_listings', {
      query_embedding: embedding,
      match_threshold: 0.1,
      match_count: 8,
    });

    if (error || !matches?.length) return [];

    const ids = matches.map((m: { id: string }) => m.id);
    const { data: full } = await supabase
      .from('listings')
      .select('id, title, description, cuisine_tag, emoji, quantity_left, price_cents, users:user_id(name, rating_avg, top_cook_badge, city)')
      .in('id', ids)
      .eq('status', 'active')
      .gt('quantity_left', 0);

    if (!full?.length) return [];

    const simMap = Object.fromEntries(matches.map((m: { id: string; similarity: number }) => [m.id, m.similarity]));
    const results = (full as ListingResult[]).map(l => ({ ...l, similarity: simMap[l.id] }));
    results.sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));
    return results.slice(0, 5);
  } catch (err) {
    console.error('[chat] searchRelevantListings error:', err);
    return [];
  }
}

function formatListingsContext(listings: ListingResult[]): string {
  if (!listings.length) return '';
  const lines = listings.map(l => {
    const cook = l.users?.name ?? 'A local cook';
    const city = l.users?.city ? ` in ${l.users.city}` : '';
    const price = l.price_cents === 0 ? 'Free' : `$${(l.price_cents / 100).toFixed(2)}`;
    const badge = l.users?.top_cook_badge ? ' ⭐ Top Cook' : '';
    return `- [${l.emoji ?? '🍽️'} ${l.title}] by ${cook}${city}${badge} — ${price} (${l.quantity_left} left) | ID:${l.id}`;
  });
  return `\n\n[AVAILABLE LISTINGS on HomeBites right now]\n${lines.join('\n')}\n\nRecommend 2-3 of these by name and explain why they match the user's request. Include the cook's name.`;
}

export async function POST(req: Request) {
  const { messages } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[];
  };

  let listings: ListingResult[] = [];
  let systemPrompt = SYSTEM;

  if (isIngredientOrFoodQuery(messages)) {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser) {
      listings = await searchRelevantListings(lastUser.content);
      if (listings.length) {
        systemPrompt = SYSTEM + formatListingsContext(listings);
      }
    }
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'nvidia/nemotron-3-nano-30b-a3b:free',
      max_tokens: 500,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  });

  const data = await res.json() as {
    choices?: { message: { content: string } }[];
    error?: { message: string };
  };

  if (!res.ok || data.error) {
    console.error('[/api/chat] OpenRouter error:', res.status, data.error ?? data);
    return Response.json({ text: 'Sorry, something went wrong. Please try again.' }, { status: 500 });
  }

  const text = data.choices?.[0]?.message?.content ?? '';

  // Return matched listings so the frontend can render cards
  const listingCards = listings.map(l => ({
    id: l.id,
    title: l.title,
    emoji: l.emoji,
    cuisine_tag: l.cuisine_tag,
    price_cents: l.price_cents,
    quantity_left: l.quantity_left,
    cook_name: l.users?.name ?? null,
    city: l.users?.city ?? null,
    rating_avg: l.users?.rating_avg ?? null,
    top_cook_badge: l.users?.top_cook_badge ?? false,
  }));

  return Response.json({ text, listings: listingCards });
}
