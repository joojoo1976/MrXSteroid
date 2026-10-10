/**
 * app/api/smarttools/ai/explain/route.ts — thin HTTP shell for the SmartTools
 * AI explain runtime (mirrors app/api/translate/route.ts architecture).
 *
 *  POST /api/smarttools/ai/explain
 *    body: AiExplainRequestSchema (server/ai/contracts.ts)
 *    → 200 { ok, source: 'model'|'deterministic', explanation, disclaimer }
 *    → 400 invalid payload · 404 unknown/planned tool · 429 rate-limited
 *
 *  GET → capability probe: { ok, configured } — never exposes credentials.
 *
 *  Fail-open to the deterministic explainer on ANY provider failure: the
 *  calculators and this endpoint never depend on the model being up (§11).
 *  No request content is persisted or logged (health-data privacy, §39).
 */
import { NextResponse } from 'next/server';
import { clientIp, enforceRateLimit } from '../../../../../lib/ratelimit';
import { AiExplainRequestSchema } from '../../../../../server/ai/contracts';
import { explainRequest, AiExplainError } from '../../../../../server/ai/explain';
import { createAiProviderFromEnv } from '../../../../../server/ai/provider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' } as const;

export async function POST(req: Request): Promise<NextResponse> {
  const rate = await enforceRateLimit('mrx:ai-explain:' + clientIp(req));
  if (!rate.success) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429, headers: NO_STORE });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400, headers: NO_STORE });
  }

  const parsed = AiExplainRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400, headers: NO_STORE });
  }

  try {
    const result = await explainRequest(parsed.data);
    return NextResponse.json(result, { status: 200, headers: NO_STORE });
  } catch (e) {
    if (e instanceof AiExplainError && e.code === 'TOOL_NOT_FOUND') {
      return NextResponse.json({ ok: false, error: 'tool_not_found' }, { status: 404, headers: NO_STORE });
    }
    return NextResponse.json({ ok: false, error: 'explain_failed' }, { status: 500, headers: NO_STORE });
  }
}

export async function GET(): Promise<NextResponse> {
  // Capability probe: whether a live model provider is configured. The answer
  // is the same information the client already infers from response.source.
  return NextResponse.json({ ok: true, configured: createAiProviderFromEnv() !== null }, { headers: NO_STORE });
}
