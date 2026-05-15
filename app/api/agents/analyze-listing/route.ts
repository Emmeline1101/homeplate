/**
 * POST /api/agents/analyze-listing
 *
 * Multi-agent orchestrator for listing analysis.
 * Orchestrator pattern: decide → dispatch in parallel → collect results.
 *
 * Agents:
 *   1. complianceAgent  — CA Cottage Food Law + allergen detection
 *   2. descriptionAgent — listing copy improvement suggestions
 *
 * Both agents call the same free LLM concurrently. The orchestrator
 * waits for all of them with Promise.allSettled so one failure
 * never blocks the others.
 */

import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'nvidia/nemotron-3-nano-30b-a3b:free';

// ── Shared LLM caller ─────────────────────────────────────────────────────────

async function callLLM(system: string, user: string, retries = 2): Promise<string> {
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });
    const data = (await res.json()) as {
      choices?: { message: { content: string } }[];
    };
    const content = (data.choices?.[0]?.message?.content ?? '').trim();
    if (!content || content === '{}') {
      if (retries > 0) return callLLM(system, user, retries - 1);
      return '{}';
    }
    return content;
  } catch {
    if (retries > 0) return callLLM(system, user, retries - 1);
    return '{}';
  }
}

function parseJSON<T>(text: string, fallback: T): T {
  try {
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type ComplianceIssue = {
  ingredient: string;
  problem: string;
  severity: 'error' | 'warning';
};

export type AgentAnalysisResult = {
  compliance: {
    compliant: boolean;
    issues: ComplianceIssue[];
    summary: string;
    parsed_allergens: string[];
  } | null;
  description: {
    title_suggestion: string | null;
    description_suggestion: string | null;
    improvements: string[];
  } | null;
  agents_run: string[];
};

// ── Agent 1: Compliance ───────────────────────────────────────────────────────

async function complianceAgent(
  ingredients: string,
): Promise<AgentAnalysisResult['compliance']> {
  const raw = await callLLM(
    'You are a CA Cottage Food compliance checker. Output ONLY valid JSON, no markdown, no explanation.',
    `Ingredients: ${ingredients}

Output this JSON exactly:
{"parsed_allergens":["milk","eggs"],"compliant":true,"issues":[{"ingredient":"x","problem":"y","severity":"error"}],"summary":"one sentence verdict"}

Rules: compliant=false if product needs refrigeration or contains meat or hot food. severity "error"=cannot sell, "warning"=needs label disclosure. FDA allergens to detect: milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soy, sesame.`,
  );

  type Raw = {
    parsed_allergens?: string[];
    compliant?: boolean;
    issues?: ComplianceIssue[];
    summary?: string;
  };
  const p = parseJSON<Raw>(raw, {});
  return {
    parsed_allergens: p.parsed_allergens ?? [],
    compliant: p.compliant ?? false,
    issues: p.issues ?? [],
    summary: p.summary ?? 'Compliance check incomplete.',
  };
}

// ── Agent 2: Description Enhancer ────────────────────────────────────────────

async function descriptionAgent(
  title: string,
  description: string,
): Promise<AgentAnalysisResult['description']> {
  const raw = await callLLM(
    'You are a food marketplace copywriter. Help sellers write better listings. Output ONLY valid JSON, no markdown.',
    `Title: "${title}"
Description: "${description}"

Output this JSON:
{"title_suggestion":"improved title or null if already good","description_suggestion":"improved description or null if already good","improvements":["specific tip 1","specific tip 2"]}

Be concise and appetizing. Max 2 improvements. If already excellent, set suggestions to null.`,
  );

  type Raw = {
    title_suggestion?: string | null;
    description_suggestion?: string | null;
    improvements?: string[];
  };
  const p = parseJSON<Raw>(raw, {});
  return {
    title_suggestion: p.title_suggestion ?? null,
    description_suggestion: p.description_suggestion ?? null,
    improvements: p.improvements ?? [],
  };
}

// ── Orchestrator ──────────────────────────────────────────────────────────────
//
// Step 1 — Plan: inspect input, decide which agents are needed.
// Step 2 — Dispatch: run chosen agents concurrently (Promise.allSettled).
// Step 3 — Collect: assemble results regardless of individual failures.

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    title?: string;
    description?: string;
    ingredients?: string;
  };

  const title = (body.title ?? '').trim();
  const description = (body.description ?? '').trim();
  const ingredients = (body.ingredients ?? '').trim();

  if (!title && !description && !ingredients) {
    return NextResponse.json({ error: 'At least one field required' }, { status: 400 });
  }

  // Step 1 — Plan
  const agents_run: string[] = [];
  let complianceResult: AgentAnalysisResult['compliance'] = null;
  let descriptionResult: AgentAnalysisResult['description'] = null;

  const tasks: Promise<void>[] = [];

  if (ingredients) {
    agents_run.push('compliance');
    tasks.push(
      complianceAgent(ingredients).then((r) => {
        complianceResult = r;
      }),
    );
  }

  if (title || description) {
    agents_run.push('description');
    tasks.push(
      descriptionAgent(title, description).then((r) => {
        descriptionResult = r;
      }),
    );
  }

  // Step 2 — Dispatch concurrently; one failure won't block the other
  await Promise.allSettled(tasks);

  // Step 3 — Collect
  return NextResponse.json({
    compliance: complianceResult,
    description: descriptionResult,
    agents_run,
  } satisfies AgentAnalysisResult);
}
