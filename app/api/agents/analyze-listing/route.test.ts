/**
 * Sample test for the multi-agent listing analyzer.
 *
 * Run with:
 *   node --experimental-strip-types --test app/api/agents/analyze-listing/route.test.ts
 *
 * No Jest / extra config needed — uses Node's built-in test runner (Node ≥ 20).
 *
 * Strategy: mock global `fetch` so the LLM is never called in tests.
 * Each test controls exactly what the "LLM" returns and asserts
 * that the orchestrator correctly routes, parses, and merges results.
 */

import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: Record<string, string>) {
  return new NextRequest('http://localhost/api/agents/analyze-listing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Build the JSON string that a fake LLM response contains. */
function llmReply(json: unknown) {
  return JSON.stringify({
    choices: [{ message: { content: JSON.stringify(json) } }],
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Orchestrator — agent routing', () => {
  // We capture which agent names were dispatched by inspecting agents_run.

  it('runs only compliance agent when only ingredients are provided', async () => {
    // Mock fetch: compliance agent gets a valid response
    globalThis.fetch = async () =>
      new Response(
        llmReply({
          parsed_allergens: ['eggs', 'milk'],
          compliant: true,
          issues: [],
          summary: 'All good.',
        }),
        { status: 200 },
      );

    const { POST } = await import('./route.ts');
    const res = await POST(makeRequest({ ingredients: 'eggs, butter, flour' }));
    const body = await res.json();

    assert.deepEqual(body.agents_run, ['compliance']);
    assert.ok(body.compliance !== null);
    assert.equal(body.description, null);
  });

  it('runs only description agent when only title/description are provided', async () => {
    globalThis.fetch = async () =>
      new Response(
        llmReply({
          title_suggestion: 'Fluffy Matcha Pound Cake',
          description_suggestion: null,
          improvements: ['Add bake date for freshness context'],
        }),
        { status: 200 },
      );

    const { POST } = await import('./route.ts');
    const res = await POST(makeRequest({ title: 'matcha cake', description: 'yummy' }));
    const body = await res.json();

    assert.deepEqual(body.agents_run, ['description']);
    assert.equal(body.compliance, null);
    assert.ok(body.description !== null);
  });

  it('runs both agents when all fields are provided', async () => {
    // fetch is called twice (once per agent); return a generic valid response each time
    let callCount = 0;
    globalThis.fetch = async () => {
      callCount++;
      const payload =
        callCount === 1
          ? { parsed_allergens: ['wheat'], compliant: true, issues: [], summary: 'OK' }
          : { title_suggestion: null, description_suggestion: null, improvements: [] };
      return new Response(llmReply(payload), { status: 200 });
    };

    const { POST } = await import('./route.ts');
    const res = await POST(
      makeRequest({ title: 'Sourdough', description: 'rustic', ingredients: 'flour, water, salt' }),
    );
    const body = await res.json();

    assert.equal(body.agents_run.length, 2);
    assert.ok(body.compliance !== null);
    assert.ok(body.description !== null);
  });
});

describe('Compliance agent — output parsing', () => {
  it('returns compliant=false with issues when LLM flags problems', async () => {
    globalThis.fetch = async () =>
      new Response(
        llmReply({
          parsed_allergens: ['milk'],
          compliant: false,
          issues: [{ ingredient: 'cream cheese', problem: 'requires refrigeration', severity: 'error' }],
          summary: 'Cannot sell — product needs refrigeration.',
        }),
        { status: 200 },
      );

    const { POST } = await import('./route.ts');
    const res = await POST(makeRequest({ ingredients: 'cream cheese, sugar' }));
    const body = await res.json();

    assert.equal(body.compliance.compliant, false);
    assert.equal(body.compliance.issues[0].severity, 'error');
    assert.equal(body.compliance.issues[0].ingredient, 'cream cheese');
  });

  it('handles malformed LLM JSON gracefully without throwing', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ choices: [{ message: { content: 'not valid json {{' } }] }),
        { status: 200 },
      );

    const { POST } = await import('./route.ts');
    const res = await POST(makeRequest({ ingredients: 'flour, eggs' }));
    const body = await res.json();

    // Orchestrator should not crash — returns a default compliance shape
    assert.ok('compliance' in body);
    assert.ok(Array.isArray(body.compliance?.issues));
  });
});

describe('Orchestrator — error resilience', () => {
  it('returns 400 when no fields are provided', async () => {
    const { POST } = await import('./route.ts');
    const res = await POST(makeRequest({}));
    assert.equal(res.status, 400);
  });

  it('still returns partial results if one agent fetch throws', async () => {
    let callCount = 0;
    globalThis.fetch = async () => {
      callCount++;
      if (callCount === 1) throw new Error('network failure');
      return new Response(
        llmReply({ title_suggestion: 'Better title', description_suggestion: null, improvements: [] }),
        { status: 200 },
      );
    };

    const { POST } = await import('./route.ts');
    const res = await POST(
      makeRequest({ title: 'cake', description: 'good', ingredients: 'flour' }),
    );
    const body = await res.json();

    // Description agent succeeded; compliance failed silently
    assert.ok(body.description !== null);
    assert.equal(res.status, 200); // orchestrator itself did not crash
  });
});
