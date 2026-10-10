/**
 * server/ai/provider.ts — credential isolation boundary (mirrors
 * server/translation/googleProvider.ts).
 *
 * The provider is resolved ONLY from environment variables here, never from
 * request data. No key/token is ever logged or echoed. When no provider is
 * configured this returns null and the runtime uses the deterministic
 * fallback — the platform's calculators never depend on the model.
 */
export interface AiProvider {
  readonly id: string;
  /** One-shot completion; throws typed errors on any failure. */
  complete(system: string, user: string, timeoutMs?: number): Promise<string>;
}

export class AiProviderError extends Error {
  constructor(readonly code: string, message?: string) {
    super(message ?? code);
    this.name = 'AiProviderError';
  }
}

const DEFAULT_TIMEOUT_MS = 12_000;

/** Minimal OpenAI-compatible chat adapter (env: OPENAI_API_KEY, optional
 * OPENAI_BASE_URL / OPENAI_MODEL). The key is read only in this module. */
class OpenAiCompatibleProvider implements AiProvider {
  readonly id = 'openai-compatible';

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
    private readonly model: string,
  ) {}

  async complete(system: string, user: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.2,
          max_tokens: 700,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });
      if (!res.ok) throw new AiProviderError('PROVIDER_HTTP_' + res.status);
      const json: unknown = await res.json();
      const content = (json as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]?.message?.content;
      if (typeof content !== 'string' || content.trim().length === 0) throw new AiProviderError('PROVIDER_MALFORMED');
      return content.trim();
    } catch (e) {
      if (e instanceof AiProviderError) throw e;
      if (e instanceof Error && e.name === 'AbortError') throw new AiProviderError('PROVIDER_TIMEOUT');
      throw new AiProviderError('PROVIDER_FAILED');
    } finally {
      clearTimeout(timer);
    }
  }
}

/** Server-only credential resolution. null = AI explanations fall back to the
 * deterministic path (the platform stays fully functional — directive §11). */
export function createAiProviderFromEnv(): AiProvider | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.trim() === '') return null;
  const baseUrl = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  return new OpenAiCompatibleProvider(key, baseUrl, model);
}
