/**
 * lib/ai/service.ts — contextual assistant orchestration (SPEC §11, §19, §37).
 * ═══════════════════════════════════════════════════════════════════════════
 *  Order of operations:
 *   1. classify intent + evaluate safety (deterministic, always runs);
 *   2. ground suggestions in the registry (never invented tools);
 *   3. only then consult the provider, if configured;
 *   4. degrade to a deterministic fallback answer when the provider is absent
 *      or fails, so the feature is never a hard dependency on an external AI.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { classifyIntent, extractQuery } from './nlp';
import { evaluateSafety, guardResponseText } from './guard';
import { recommendTools } from './recommend';
import { getProvider, isProviderConfigured } from './provider';
import type { AiRequest, AiResponse } from './types';

const SYSTEM_PROMPT = [
  'You are the Mr. X-Steroid SmartTools assistant.',
  'You are educational only and never provide personalised medication or hormone doses.',
  'You only reference tools that exist in the provided list; never invent a tool.',
  'If symptoms suggest an emergency, tell the user to seek emergency care immediately.',
  'Answer in the same language as the user (Arabic or English).',
].join(' ');

/** Build the deterministic fallback answer grounded in the catalogue. */
export function fallbackText(req: AiRequest, suggestions: ReturnType<typeof recommendTools>): string {
  const ar = req.context.locale === 'ar';
  if (suggestions.length === 0) {
    return ar
      ? 'لم أعثر على أداة مطابقة. جرّب كلمات مختلفة، أو تصفّح فئات SmartTools.'
      : 'I could not find a matching tool. Try different words, or browse the SmartTools categories.';
  }
  const names = suggestions.slice(0, 3).map((s) => (ar ? s.titleAr : s.titleEn)).join(ar ? '، ' : ', ');
  return ar
    ? `أدوات مقترحة قد تفيدك: ${names}. هذه الأدوات تعليمية وليست تشخيصًا.`
    : `Suggested tools that may help: ${names}. These tools are educational and not a diagnosis.`;
}

/** Run the assistant. Never throws. */
export async function runAssistant(req: AiRequest): Promise<AiResponse> {
  const query = extractQuery(req.messages);
  const intent = classifyIntent(query || (req.messages.at(-1)?.content ?? ''));
  const safety = evaluateSafety(intent, req.context.locale);

  const citations = [
    { label: 'SmartTools registry', source: 'lib/tools/smartToolRegistry' },
  ];

  if (safety.blocked) {
    return {
      ok: true,
      source: 'fallback',
      degraded: false,
      text: guardResponseText(safety, req.context.locale) ?? '',
      suggestions: [],
      intent,
      citations,
      safety,
    };
  }

  const suggestions = recommendTools(query, 5);

  let text: string | null = null;
  if (isProviderConfigured()) {
    const provider = getProvider();
    text = await provider.complete(req, SYSTEM_PROMPT);
  }
  const degraded = !isProviderConfigured() || text === null;

  return {
    ok: true,
    source: text ? 'provider' : 'fallback',
    degraded,
    text: text ?? fallbackText(req, suggestions),
    suggestions,
    intent,
    citations,
    safety,
  };
}
