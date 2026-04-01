import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: SYSTEM,
    messages,
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return Response.json({ text });
}
