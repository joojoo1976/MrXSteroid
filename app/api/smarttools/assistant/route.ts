/**
 * app/api/smarttools/assistant/route.ts — contextual AI assistant (SPEC §11, §19, §37).
 * ═══════════════════════════════════════════════════════════════════════════
 *  Security posture:
 *   - Always rate-limited per IP (Upstash when configured, in-memory otherwise).
 *   - When a real (costly) provider is configured, a valid bearer token is
 *     REQUIRED; anonymous callers only ever get the deterministic fallback.
 *   - Input is validated and size-capped; health data is never persisted here.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { clientIp, enforceRateLimit } from '@/lib/ratelimit';
import { getUserFromRequest } from '@/server/affiliate/apiHelpers';
import { runAssistant } from '@/lib/ai/service';
import { isProviderConfigured } from '@/lib/ai/provider';
import type { AiMessage } from '@/lib/ai/types';

export const dynamic = 'force-dynamic';

const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string().min(1).max(MAX_CHARS),
      })
    )
    .min(1)
    .max(MAX_MESSAGES),
  context: z
    .object({
      locale: z.enum(['ar', 'en']).default('en'),
      currentToolSlug: z.string().max(80).optional(),
      facts: z.record(z.string(), z.union([z.string().max(200), z.number(), z.boolean()])).optional(),
    })
    .default({ locale: 'en' }),
});

export async function POST(request: Request) {
  const limit = await enforceRateLimit(`ai-assistant:${clientIp(request)}`);
  if (!limit.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  // Costly provider → authentication required. Fallback path stays public.
  if (isProviderConfigured()) {
    const auth = await getUserFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const result = await runAssistant({
    messages: parsed.data.messages as AiMessage[],
    context: parsed.data.context,
  });

  return NextResponse.json(result);
}
