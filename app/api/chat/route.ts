const SYSTEM = `You are a friendly assistant on HomeBites, a community marketplace for Asian cottage food makers in California.

Your expertise:
- California Cottage Food Law (AB 1616, SB 1591): Class A (direct sales only) vs Class B (indirect/home delivery allowed)
- Allowed cottage food items: baked goods without cream/custard/meat, jams, jellies, candy, chocolate, dried goods, granola, roasted nuts, honey, tea blends
- NOT allowed: hot food, refrigerated dairy-based products, meat, fresh pasta with eggs, food requiring refrigeration
- Helping sellers write appealing, accurate descriptions of their cottage food
- Asian baking techniques and ingredients (matcha, ube, taro, mochi, red bean, pandan, etc.)
- General food allergy disclosure best practices
- Connecting buyers with great local Asian cottage food

Tone: Warm, knowledgeable, concise. You love food and the Asian food community. Keep responses under 150 words unless a detailed answer is genuinely needed.`;

export async function POST(req: Request) {
  const { messages } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[];
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'nvidia/nemotron-3-nano-30b-a3b:free',
      max_tokens: 400,
      messages: [
        { role: 'system', content: SYSTEM },
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
  return Response.json({ text });
}
