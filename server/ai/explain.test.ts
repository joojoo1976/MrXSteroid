/**
 * server/ai/explain.test.ts
 * Locks the AI explain runtime contract:
 *  - deterministic fallback is the DEFAULT (no provider configured)
 *  - the model path is used only when a provider succeeds
 *  - any provider failure falls back (calculations never depend on the model)
 *  - only PUBLISHED tools are explainable (planned roadmap entries 404)
 *  - explanations restate provided engine values only — never invent numbers
 */
import { describe, it, expect, vi } from 'vitest';

import { explainRequest, AiExplainError } from './explain';
import type { AiProvider } from './provider';
import type { AiExplainRequest } from './contracts';

const BASE: AiExplainRequest = {
  toolSlug: 'tool-037-side-effect-probability',
  locale: 'ar',
  context: {
    provenanceLine: 'source: manual · quality: medium · unit: %',
    findings: [
      { code: 'OVERALL_BURDEN', labelAr: 'العبء العام', labelEn: 'Overall Burden', value: '42%', severity: 'info' },
      { code: 'gyno', labelAr: 'gyno', labelEn: 'gyno', value: '12.3%', severity: 'monitor' },
    ],
  },
};

const noopProvider = (impl: (system: string, user: string) => Promise<string>): AiProvider => ({
  id: 'test-provider',
  complete: impl,
});

describe('AI explain runtime', () => {
  it('falls back deterministically when no provider is configured', async () => {
    const res = await explainRequest(BASE, { provider: null });
    expect(res.ok).toBe(true);
    expect(res.source).toBe('deterministic');
    expect(res.locale).toBe('ar');
    expect(res.explanation).toContain('42%'); // restates the engine value
    expect(res.disclaimer.length).toBeGreaterThan(20);
  });

  it('uses the model path when the provider succeeds', async () => {
    const provider = noopProvider(() => Promise.resolve('شرح من النموذج.'));
    const res = await explainRequest(BASE, { provider });
    expect(res.source).toBe('model');
    expect(res.explanation).toBe('شرح من النموذج.');
  });

  it('falls back when the provider throws (calculations never break)', async () => {
    const provider = noopProvider(() => Promise.reject(new Error('provider down')));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const res = await explainRequest(BASE, { provider });
    expect(res.source).toBe('deterministic');
    expect(res.explanation).toContain('42%');
    warn.mockRestore();
  });

  it('rejects unknown tool slugs', async () => {
    await expect(explainRequest({ ...BASE, toolSlug: 'nope' }, { provider: null })).rejects.toBeInstanceOf(AiExplainError);
  });

  it('rejects PLANNED roadmap tools (published-only surface)', async () => {
    await expect(explainRequest({ ...BASE, toolSlug: 'tool-041-hematocrit-monitor' }, { provider: null })).rejects.toBeInstanceOf(AiExplainError);
  });

  it('deterministic explanation does not invent numbers absent from context', async () => {
    const res = await explainRequest({ ...BASE, context: { findings: [] } }, { provider: null });
    const digits = res.explanation.match(/\d+(\.\d+)?/g) ?? [];
    // only allowed numeric mentions are generic (e.g. lists) — forbid the leaked engine value 42
    expect(res.explanation).not.toContain('42%');
    expect(digits.length).toBeLessThanOrEqual(2);
  });
});
