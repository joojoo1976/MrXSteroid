/**
 * Tool #038 — Stack Compatibility Checker: engine + schema verification.
 */
import { describe, it, expect } from 'vitest';
import { checkStackCompatibility } from './tool-038-stack-compatibility';
import { StackCompatibilityInputSchema, StackCompatibilityResultSchema } from '../schemas/tool-038-stack-compatibility';

describe('tool-038 compatibility engine', () => {
  it('approves a clean test-only stack', () => {
    const input = {
      items: [{ name_en: 'Test E', family: 'testosterone' as const, weekly_dose_mg: 500, hepatotoxic: false }],
    };
    expect(StackCompatibilityInputSchema.safeParse(input).success).toBe(true);
    const r = checkStackCompatibility(input);
    expect(StackCompatibilityResultSchema.safeParse(r).success).toBe(true);
    expect(r.score_0_100).toBe(100);
    expect(r.verdict).toBe('compatible');
  });

  it('flags dual 19-nors as incompatible drivers', () => {
    const r = checkStackCompatibility({
      items: [
        { name_en: 'NPP', family: 'nandrolone', weekly_dose_mg: 400, hepatotoxic: false },
        { name_en: 'Tren A', family: 'trenbolone', weekly_dose_mg: 300, hepatotoxic: false },
        { name_en: 'Test P', family: 'testosterone', weekly_dose_mg: 300, hepatotoxic: false },
      ],
    });
    expect(r.flags.some((f) => f.code === 'DUAL_19NOR')).toBe(true);
    expect(r.score_0_100).toBeLessThan(75);
  });

  it('flags dual orals and high burden', () => {
    const r = checkStackCompatibility({
      items: [
        { name_en: 'Dbol', family: 'oral', weekly_dose_mg: 210, hepatotoxic: true },
        { name_en: 'Winny', family: 'oral', weekly_dose_mg: 350, hepatotoxic: true },
        { name_en: 'Test E', family: 'testosterone', weekly_dose_mg: 1000, hepatotoxic: false },
      ],
    });
    expect(r.flags.some((f) => f.code === 'DUAL_ORAL')).toBe(true);
    expect(r.androgen_burden_mg_per_week).toBe(1560);
    expect(r.verdict).toBe('caution');
  });
});
