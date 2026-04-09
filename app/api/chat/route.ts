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

When listing recommendations are provided in [AVAILABLE LISTINGS], always reference specific items by name and mention the cook's name if available. Be encouraging and specific.

At the very end of every response, on its own line, output a JSON suggestions block in exactly this format (no other text on that line):
<!--sug:["follow-up question 1","follow-up question 2","follow-up question 3"]-->
Each question should be short (under 60 characters), natural, and relevant to what was just discussed.`;

// Layer 1: explicit intent phrases
const INTENT_PHRASES = [
  'i have', 'ingredient', 'what can i', 'what food', 'what dish',
  'recommend', 'suggest', 'looking for', 'want to buy', 'find me',
  'what should i', 'i want', 'craving', 'hungry', 'what matches',
  'pairs well', 'show me', 'any ', 'do you have', 'is there',
  'available', 'got any', 'can i get', 'can i buy', 'give me',
  'list', 'browse', 'what\'s good', "what's available", 'near me',
  'in my area', 'for sale', 'for free', 'free food',
  // Chinese
  '我有', '食材', '推荐', '建议', '想买', '找', '有没有',
  '给我', '看看', '什么好', '附近', '想吃', '买点', '有什么',
];

// Layer 2: food vocabulary — any food noun triggers a search
const FOOD_NOUNS = [
  'cake', 'bread', 'cookie', 'cookies', 'pie', 'tart', 'muffin', 'muffins',
  'brownie', 'brownies', 'macaron', 'macarons', 'croissant', 'croissants',
  'dumpling', 'dumplings', 'bao', 'noodle', 'noodles', 'pasta', 'rice',
  'soup', 'stew', 'curry', 'salad', 'sandwich', 'wrap', 'taco', 'burrito',
  'kimchi', 'mochi', 'matcha', 'taro', 'ube', 'pandan', 'red bean',
  'jam', 'jelly', 'honey', 'granola', 'nut', 'nuts', 'chocolate', 'candy',
  'dessert', 'desserts', 'snack', 'snacks', 'pastry', 'pastries', 'bake',
  'baked', 'homemade', 'food', 'meal', 'dish', 'treat', 'sweets',
  // Chinese
  '蛋糕', '面包', '饼干', '派', '塔', '马卡龙', '可颂', '饺子', '包子',
  '面条', '汤', '咖喱', '沙拉', '寿司', '泡菜', '年糕', '抹茶', '芋头',
  '红豆', '果酱', '蜂蜜', '麦片', '坚果', '巧克力', '糖果', '甜点',
  '零食', '烘焙', '手工', '食物', '美食',
];

// Layer 3: questions that are purely about regulations/law — skip search
const REGULATION_ONLY = [
  'cottage food law', 'ab 1616', 'sb 1591', 'class a', 'class b',
  'is it legal', 'can i sell', 'allowed to sell', 'permit', 'license',
  'allergen disclosure', 'labeling requirement',
];

function isListingQuery(messages: { role: string; content: string }[]): boolean {
  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUser) return false;
  const lower = lastUser.content.toLowerCase();

  // Layer 3 exclusion first: pure regulation question → no search needed
  if (REGULATION_ONLY.some(k => lower.includes(k))) return false;

  // Layer 1: explicit intent
  if (INTENT_PHRASES.some(k => lower.includes(k))) return true;

  // Layer 2: food noun present
  if (FOOD_NOUNS.some(k => lower.includes(k))) return true;

  return false;
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
    const results = (full as unknown as ListingResult[]).map(l => ({ ...l, similarity: simMap[l.id] }));
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

  if (isListingQuery(messages)) {
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

  const raw = data.choices?.[0]?.message?.content ?? '';

  // Extract follow-up suggestions embedded by the model
  const sugMatch = raw.match(/<!--sug:(\[[\s\S]*?\])-->/);
  let suggestions: string[] = [];
  if (sugMatch) {
    try { suggestions = JSON.parse(sugMatch[1]); } catch { /* ignore */ }
  }
  const text = raw.replace(/\n?<!--sug:[\s\S]*?-->/, '').trimEnd();

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

  return Response.json({ text, listings: listingCards, suggestions });
}
