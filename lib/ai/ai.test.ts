import { describe, it, expect } from 'vitest';
import { normalizeText, tokenize, classifyIntent, expandQuery } from './nlp';
import { evaluateSafety, guardResponseText } from './guard';
import { getProvider, isProviderConfigured } from './provider';
import { runAssistant, fallbackText } from './service';
import { recommendTools, relatedToolsFor } from './recommend';
import type { AiRequest } from './types';

describe('ai/nlp', () => {
  it('normalises Arabic diacritics, alef variants and digits', () => {
    expect(normalizeText('الماكْرُوز')).toBe('الماكروز');
    expect(normalizeText('أحمد')).toBe('احمد');
    expect(normalizeText('١٢٣')).toBe('123');
    expect(normalizeText('HALF-LIFE')).toBe('half-life');
  });

  it('tokenises to words of length >= 2', () => {
    expect(tokenize('find macro calculator')).toEqual(['find', 'macro', 'calculator']);
  });

  it('classifies emergency, dosing and find-tool intents', () => {
    expect(classifyIntent('I have chest pain right now')).toBe('emergency');
    expect(classifyIntent('ألم في الصدر')).toBe('emergency');
    expect(classifyIntent('what dose of test should i take')).toBe('dosing-request');
    expect(classifyIntent('ما هي الجرعة المناسبة')).toBe('dosing-request');
    expect(classifyIntent('find the macro calculator')).toBe('find-tool');
  });

  it('expands bilingual synonyms for the same concept', () => {
    const en = expandQuery('macro');
    const ar = expandQuery('ماكرو');
    expect(en).toContain('nutrition');
    expect(ar).toContain('nutrition');
  });
});

describe('ai/guard', () => {
  it('blocks emergencies with an escalation message', () => {
    const d = evaluateSafety('emergency', 'en');
    expect(d.blocked).toBe(true);
    expect(d.escalate).toBe(true);
    expect(guardResponseText(d, 'en')).toMatch(/emergency/i);
  });

  it('blocks personalised dosing requests', () => {
    const d = evaluateSafety('dosing-request', 'ar');
    expect(d.blocked).toBe(true);
    expect(guardResponseText(d, 'ar')).toMatch(/جرع/);
  });

  it('allows benign intents', () => {
    const d = evaluateSafety('find-tool', 'en');
    expect(d.blocked).toBe(false);
    expect(guardResponseText(d, 'en')).toBeNull();
  });
});

describe('ai/provider', () => {
  it('reports unconfigured in the test environment and returns null', async () => {
    expect(isProviderConfigured()).toBe(false);
    const p = getProvider();
    expect(p.configured).toBe(false);
    const out = await p.complete({ messages: [], context: { locale: 'en' } }, 'sys');
    expect(out).toBeNull();
  });
});

describe('ai/recommend', () => {
  it('returns catalogue tools (grounded) for an English query', () => {
    const r = recommendTools('macro calculator', 5);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((x) => typeof x.slug === 'string' && x.slug.length > 0)).toBe(true);
  });

  it('returns catalogue tools for an Arabic query via synonym expansion', () => {
    const r = recommendTools('حاسبة السعرات', 5);
    expect(r.length).toBeGreaterThan(0);
  });

  it('never returns the tool itself as its own related tool', () => {
    const r = relatedToolsFor('tool-013-macro-optimizer', 4);
    expect(r.some((x) => x.slug === 'tool-013-macro-optimizer')).toBe(false);
  });
});

describe('ai/service — deterministic fallback (no provider configured)', () => {
  const req = (content: string, locale: 'ar' | 'en' = 'en'): AiRequest => ({
    messages: [{ role: 'user', content }],
    context: { locale },
  });

  it('degrades gracefully and still answers with grounded suggestions', async () => {
    const res = await runAssistant(req('find the macro calculator'));
    expect(res.ok).toBe(true);
    expect(res.degraded).toBe(true);
    expect(res.source).toBe('fallback');
    expect(res.suggestions.length).toBeGreaterThan(0);
    expect(res.intent).toBe('find-tool');
  });

  it('refuses personalised dosing without calling a provider', async () => {
    const res = await runAssistant(req('what dose should i take'));
    expect(res.intent).toBe('dosing-request');
    expect(res.safety.blocked).toBe(true);
    expect(res.suggestions).toEqual([]);
    expect(res.text).toMatch(/clinician/i);
  });

  it('escalates emergencies', async () => {
    const res = await runAssistant(req('chest pain and cannot breathe'));
    expect(res.intent).toBe('emergency');
    expect(res.safety.escalate).toBe(true);
    expect(res.text).toMatch(/emergency/i);
  });

  it('answers in Arabic when the locale is ar', async () => {
    const res = await runAssistant(req('ابحث عن حاسبة', 'ar'));
    expect(res.text.length).toBeGreaterThan(0);
  });

  it('fallbackText handles the empty-suggestion case', () => {
    const t = fallbackText(req('zzzzz nonsense'), []);
    expect(t).toMatch(/could not find/i);
  });
});
