/**
 * POST /api/compliance
 *
 * Agentic compliance check pipeline:
 *   1. Policy Retrieval  — embed(ingredients) → pgvector search policy_chunks
 *   2. Ingredient Parsing — Claude identifies allergens + restricted items
 *   3. Compliance Validation — Claude judges compliance given policy + parsed ingredients
 *
 * Request body:  { ingredients: string }
 * Response:      { compliant: boolean, issues: Issue[], citations: Citation[], summary: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

async function callLLM(system: string, user: string, retries = 2): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'nvidia/nemotron-3-nano-30b-a3b:free',
      max_tokens: 800,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
    signal: AbortSignal.timeout(20000), // 20s 超时，不再无限等
  });
  const data = await res.json() as { choices?: { message: { content: string } }[] };
  const content = (data.choices?.[0]?.message?.content ?? '').trim();
  if (!content || content === '{}') {
    if (retries > 0) return callLLM(system, user, retries - 1);
    return '{}';
  }
  return content;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type ComplianceIssue = {
  ingredient: string;
  problem: string;
  severity: 'error' | 'warning';
};

export type PolicyCitation = {
  source: string;
  title: string;
  excerpt: string;
};

export type ComplianceResult = {
  compliant: boolean;
  issues: ComplianceIssue[];
  citations: PolicyCitation[];
  summary: string;
  parsed_allergens: string[];
};

type PolicyChunk = {
  id: string;
  source: string;
  title: string;
  chunk_text: string;
  similarity: number;
};

// ── Step 1: Policy Retrieval ──────────────────────────────────────────────────

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: [text], model: 'voyage-3' }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Voyage error: ${await res.text()}`);
  const json = await res.json() as { data: { embedding: number[] }[] };
  return json.data[0].embedding;
}

async function retrievePolicies(ingredients: string): Promise<PolicyChunk[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  let embedding: number[];
  try {
    embedding = await getEmbedding(ingredients);
  } catch (err) {
    console.error('[compliance] embedding failed, proceeding without policy context:', err);
    return [];
  }

  const { data, error } = await supabase.rpc('search_policies', {
    query_embedding: embedding,
    match_threshold: 0.25,
    match_count: 3,
  });

  if (error) {
    console.error('[compliance] policy retrieval error:', error);
    return [];
  }

  return (data ?? []) as PolicyChunk[];
}

// ── Step 2+3: Parse ingredients AND validate compliance in one LLM call ────────

async function analyzeCompliance(
  ingredients: string,
  policies: PolicyChunk[],
): Promise<{ compliant: boolean; issues: ComplianceIssue[]; summary: string; parsed_allergens: string[] }> {
  const policyContext = policies
    .map(p => `[${p.source}] ${p.title}:\n${p.chunk_text.slice(0, 300)}`)
    .join('\n---\n');

  const text = await callLLM(
    `You are a CA Cottage Food compliance checker. Output ONLY valid JSON, no markdown, no explanation.`,
    `Ingredients: ${ingredients}

Policy context:
${policyContext}

Output this JSON:
{"parsed_allergens":["milk","eggs",...],"compliant":true,"issues":[{"ingredient":"x","problem":"y","severity":"error"}],"summary":"verdict"}

Rules: compliant=false if product needs refrigeration or contains meat/hot food. severity "error"=cannot sell, "warning"=needs label disclosure. FDA allergens: milk,eggs,fish,shellfish,tree nuts,peanuts,wheat,soy,sesame.`,
  );

  try {
    // Strip markdown code fences that some LLMs add (```json ... ```)
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
const parsed = JSON.parse(cleaned) as Partial<{
      parsed_allergens: string[];
      compliant: boolean;
      issues: ComplianceIssue[];
      summary: string;
    }>;
    return {
      parsed_allergens: parsed.parsed_allergens ?? [],
      compliant: parsed.compliant ?? false,
      issues: parsed.issues ?? [],
      summary: parsed.summary ?? 'Unable to complete compliance check.',
    };
  } catch {
    return { parsed_allergens: [], compliant: false, issues: [], summary: 'Unable to complete compliance check.' };
  }
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json() as { ingredients?: string };
  const ingredients = (body.ingredients ?? '').trim();

  if (!ingredients) {
    return NextResponse.json({ error: 'ingredients required' }, { status: 400 });
  }

  try {
    // Retrieve policies first (needed as context for the single LLM call)
    const policies = await retrievePolicies(ingredients);

    // Parse + validate in one LLM call
    const analysis = await analyzeCompliance(ingredients, policies);

    const citations: PolicyCitation[] = policies.slice(0, 3).map(p => ({
      source: p.source,
      title: p.title,
      excerpt: p.chunk_text.slice(0, 200) + (p.chunk_text.length > 200 ? '…' : ''),
    }));

    const result: ComplianceResult = {
      compliant: analysis.compliant,
      issues: analysis.issues,
      citations,
      summary: analysis.summary,
      parsed_allergens: analysis.parsed_allergens,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/compliance] error:', err);
    return NextResponse.json({ error: 'Compliance check failed' }, { status: 500 });
  }
}
