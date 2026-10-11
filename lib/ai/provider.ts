/**
 * lib/ai/provider.ts — pluggable AI provider (SPEC §15.1, §16, §19, §37).
 * ═══════════════════════════════════════════════════════════════════════════
 *  The platform is provider-agnostic. A real provider is used ONLY when its
 *  credentials are configured server-side (never exposed to the client). When
 *  unconfigured or failing, a deterministic fallback keeps the feature working.
 *
 *  No provider SDK is bundled; we speak a minimal OpenAI-compatible HTTP shape.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import type { AiProvider, AiRequest } from './types';

export const AI_PROVIDER_URL = process.env.AI_PROVIDER_URL ?? process.env.OPENAI_BASE_URL ?? '';
export const AI_PROVIDER_KEY = process.env.AI_PROVIDER_API_KEY ?? process.env.OPENAI_API_KEY ?? '';
export const AI_PROVIDER_MODEL = process.env.AI_PROVIDER_MODEL ?? 'gpt-4o-mini';

/** True when a real provider is configured (used to distinguish test modes). */
export function isProviderConfigured(): boolean {
  return Boolean(AI_PROVIDER_URL && AI_PROVIDER_KEY);
}

/** A no-op provider used when nothing is configured. */
const nullProvider: AiProvider = {
  name: 'none',
  configured: false,
  async complete() {
    return null;
  },
};

class HttpAiProvider implements AiProvider {
  readonly name = 'http-openai-compatible';
  readonly configured = true;

  async complete(req: AiRequest, systemPrompt: string): Promise<string | null> {
    try {
      const res = await fetch(`${AI_PROVIDER_URL.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_PROVIDER_KEY}`,
        },
        body: JSON.stringify({
          model: AI_PROVIDER_MODEL,
          messages: [{ role: 'system', content: systemPrompt }, ...req.messages],
          temperature: 0.2,
        }),
        // Hard timeout — never hang a request on a slow provider.
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = data.choices?.[0]?.message?.content;
      return typeof text === 'string' && text.trim() ? text.trim() : null;
    } catch {
      return null;
    }
  }
}

/** Resolve the active provider (real when configured, otherwise a no-op). */
export function getProvider(): AiProvider {
  return isProviderConfigured() ? new HttpAiProvider() : nullProvider;
}
