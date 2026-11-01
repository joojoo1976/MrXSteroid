/**
 * server/ai/explain.test.ts
 * Locks the AI explain runtime contract:
 *  - deterministic fallback is the DEFAULT (no provider configured)
 *  - the model path is used only when a provider succeeds
 *  - any provider failure falls back (calculations never depend on the model)
 *  - only PUBLISHED tools are explainable (anything outside the published
 *    catalog — unknown or planned — 404s)
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
    const complete = vi.fn(() => Promise.resolve('شرح من النموذج.'));
    const provider = noopProvider(complete);
    const res = await explainRequest(BASE, { provider });
    expect(res.source).toBe('model');
    expect(res.explanation).toBe('شرح من النموذج.');
    expect(complete.mock.calls[0][0]).toContain('بيانات غير موثوقة');
    expect(complete.mock.calls[0][0]).toContain('لا تقدّم تشخيصًا');
    expect(complete.mock.calls[0][1]).toContain('وصف الأداة: قياس مخاطر الأعراض الجانبية');
  });

  it('tells the model that no personal result context was provided', async () => {
    const complete = vi.fn(() => Promise.resolve('This tool estimates a score.'));
    const res = await explainRequest({ ...BASE, locale: 'en', context: undefined, question: 'What does my score mean?' }, { provider: noopProvider(complete) });

    expect(res.source).toBe('model');
    expect(complete.mock.calls[0][0]).toContain('No results were provided for this tool');
    expect(complete.mock.calls[0][1]).toContain('No findings were supplied');
    expect(complete.mock.calls[0][1]).toContain('What does my score mean?');
  });

  it('adds Tool 149-specific limits for fitness, nutrition, health and medication requests in English', async () => {
    const complete = vi.fn(() => Promise.resolve('This simulator only provides arithmetic scenarios.'));
    await explainRequest({
      ...BASE,
      toolSlug: 'tool-149-physique-trajectory-simulator',
      locale: 'en',
      context: undefined,
      question: 'Give me the best diet and training plan to reach this target safely.',
    }, { provider: noopProvider(complete) });

    const systemPrompt = complete.mock.calls[0][0];
    expect(systemPrompt).toContain('Tool-specific boundary');
    expect(systemPrompt).toContain('Do not provide or imply training, nutrition, or medication recommendations');
    expect(systemPrompt).toContain('does not assess health or predict real-world outcomes');
    expect(complete.mock.calls[0][1]).toContain('Give me the best diet and training plan');
  });

  it('adds Tool 149-specific limits for fitness, nutrition, health and medication requests in Arabic', async () => {
    const complete = vi.fn(() => Promise.resolve('هذه الأداة تقدم سيناريوهات حسابية فقط.'));
    await explainRequest({
      ...BASE,
      toolSlug: 'tool-149-physique-trajectory-simulator',
      locale: 'ar',
      context: undefined,
      question: 'اقترح أفضل خطة تدريب وتغذية للوصول إلى هذا الهدف بأمان.',
    }, { provider: noopProvider(complete) });

    const systemPrompt = complete.mock.calls[0][0];
    expect(systemPrompt).toContain('قيد خاص بهذه الأداة');
    expect(systemPrompt).toContain('لا تقدّم أو توحِ بتوصية تدريب أو تغذية أو دواء');
    expect(systemPrompt).toContain('لا يقيّم الصحة ولا يتنبأ بالنتائج الواقعية');
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

  it('rejects slugs absent from the published catalog (unknown or planned)', async () => {
    // #046-trt-lifetime was the planned fixture until it shipped; a slug that
    // is not in the catalog exercises the same published-only gate (planned
    // entries never appear in getPublishedCatalogTools).
    await expect(explainRequest({ ...BASE, toolSlug: 'tool-999-not-in-catalog' }, { provider: null })).rejects.toBeInstanceOf(AiExplainError);
  });

  it('deterministic explanation does not invent numbers absent from context', async () => {
    const res = await explainRequest({ ...BASE, context: { findings: [] } }, { provider: null });
    const digits = res.explanation.match(/\d+(\.\d+)?/g) ?? [];
    // only allowed numeric mentions are generic (e.g. lists) — forbid the leaked engine value 42
    expect(res.explanation).not.toContain('42%');
    expect(digits.length).toBeLessThanOrEqual(2);
  });
});
