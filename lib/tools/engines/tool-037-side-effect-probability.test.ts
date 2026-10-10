/**
 * Tool #037 — Side Effect Probability Calculator: engine + schema verification.
 */
import { describe, it, expect } from 'vitest';
import { calculateSideEffectProbability } from './tool-037-side-effect-probability';
import { SideEffectRiskInputSchema, SideEffectRiskResultSchema } from '../schemas/tool-037-side-effect-probability';

describe('tool-037 risk engine', () => {
  it('scores a moderate testosterone cycle', () => {
    const input = {
      compounds: [{ name_en: 'Test E', family: 'testosterone' as const, weekly_dose_mg: 500, reference_dose_mg: 500 }],
      age: 30, body_fat_pct: 18, cycle_weeks: 12, uses_ai: true, uses_liver_support: true,
    };
    expect(SideEffectRiskInputSchema.safeParse(input).success).toBe(true);
    const r = calculateSideEffectProbability(input);
    expect(SideEffectRiskResultSchema.safeParse(r).success).toBe(true);
    expect(r.risks).toHaveLength(6);
    const gyno = r.risks.find((x) => x.effect === 'gyno')!;
    // 0.10 * 0.4 (AI) * 1.12 (12wk duration) = 0.0448 -> 4.5%
    expect(gyno.probability_pct).toBeCloseTo(4.5, 1);
    expect(r.overall_burden_pct).toBeGreaterThan(0);
  });

  it('escalates trenbolone mood risk', () => {
    const r = calculateSideEffectProbability({
      compounds: [{ name_en: 'Tren A', family: 'trenbolone', weekly_dose_mg: 350, reference_dose_mg: 350 }],
      age: 32, body_fat_pct: 15, cycle_weeks: 8, uses_ai: false, uses_liver_support: true,
    });
    const mood = r.risks.find((x) => x.effect === 'mood')!;
    expect(mood.level).not.toBe('low');
    expect(r.mitigations.length).toBeGreaterThan(0);
  });

  it('rejects invalid input', () => {
    expect(SideEffectRiskInputSchema.safeParse({ compounds: [], age: 30, body_fat_pct: 18, cycle_weeks: 8, uses_ai: false, uses_liver_support: false }).success).toBe(false);
  });
});
