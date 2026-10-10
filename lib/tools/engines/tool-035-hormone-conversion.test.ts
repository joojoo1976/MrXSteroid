/**
 * Tool #035 — Hormone Conversion Calculator: engine + schema verification.
 * Proves the aromatization heuristic, status bands and AI guidance.
 */
import { describe, it, expect } from 'vitest';
import { calculateHormoneConversion } from './tool-035-hormone-conversion';
import { ConversionInputSchema, ConversionResultSchema } from '../schemas/tool-035-hormone-conversion';

describe('tool-035 conversion engine', () => {
  it('estimates optimal E2 for a lean moderate cycle', () => {
    const input = { weekly_test_mg: 500, body_fat_pct: 15, age: 30, ai_dose_mg_per_week: 0 };
    expect(ConversionInputSchema.safeParse(input).success).toBe(true);
    const r = calculateHormoneConversion(input);
    expect(ConversionResultSchema.safeParse(r).success).toBe(true);
    // T = 500*4.5+250 = 2500; E2 = 12+500*0.045*1 = 34.5
    expect(r.estimated_total_t_ng_dl).toBe(2500);
    expect(r.estimated_e2_pg_ml).toBe(34.5);
    expect(r.e2_status).toBe('optimal');
    expect(r.ai_suggestion_mg_per_week).toBe(0);
  });

  it('escalates AI suggestion for high adiposity + high dose', () => {
    const r = calculateHormoneConversion({ weekly_test_mg: 750, body_fat_pct: 28, age: 35 });
    // bfFactor = 1+13*0.03 = 1.39; E2 = 12+750*0.045*1.39 = 58.9 -> high
    expect(r.e2_status).toBe('high');
    expect(r.ai_suggestion_mg_per_week).toBeGreaterThan(0);
    expect(r.warnings.some((w) => w.includes('Body fat'))).toBe(true);
  });

  it('warns on crashed E2 while on AI', () => {
    const r = calculateHormoneConversion({ weekly_test_mg: 150, body_fat_pct: 12, age: 28, ai_dose_mg_per_week: 3.5 });
    expect(r.estimated_e2_pg_ml).toBeLessThan(20);
    expect(r.e2_status).toBe('low');
    expect(r.warnings.some((w) => w.includes('reducing AI'))).toBe(true);
  });

  it('rejects invalid input through the schema', () => {
    expect(
      ConversionInputSchema.safeParse({ weekly_test_mg: -5, body_fat_pct: 15, age: 30 }).success,
    ).toBe(false);
  });
});
