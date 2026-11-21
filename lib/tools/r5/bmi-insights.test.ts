import { describe, expect, it } from 'vitest';
import {
  bmiBoundaryGap,
  bmiCategoryAdviceKey,
  buildBmiScenarios,
} from './bmi-insights';

describe('BMI engine-derived insights', () => {
  it('builds current and ±5 kg scenarios from the real BMI engine', () => {
    const scenarios = buildBmiScenarios(70, 175);
    expect(scenarios).toEqual([
      { weightKg: 65, bmi: 21.2, category: 'normal' },
      { weightKg: 70, bmi: 22.9, category: 'normal' },
      { weightKg: 75, bmi: 24.5, category: 'normal' },
    ]);
  });

  it('clamps scenarios to the legal weight bounds and removes duplicates', () => {
    const scenarios = buildBmiScenarios(30, 175);
    expect(scenarios.map((scenario) => scenario.weightKg)).toEqual([30, 35]);
  });

  it('returns the adjacent adult category boundaries for the current BMI', () => {
    expect(bmiBoundaryGap(17)).toEqual({ lower: null, upper: 18.5 });
    expect(bmiBoundaryGap(22.9)).toEqual({ lower: 18.5, upper: 25 });
    expect(bmiBoundaryGap(27)).toEqual({ lower: 25, upper: 30 });
    expect(bmiBoundaryGap(31)).toEqual({ lower: 30, upper: null });
  });

  it('rejects non-positive or non-finite BMI values', () => {
    expect(() => bmiBoundaryGap(0)).toThrow();
    expect(() => bmiBoundaryGap(Number.NaN)).toThrow();
  });

  it('maps every category to its own advice key', () => {
    expect(bmiCategoryAdviceKey('underweight')).toBe('underweight');
    expect(bmiCategoryAdviceKey('normal')).toBe('normal');
    expect(bmiCategoryAdviceKey('overweight')).toBe('overweight');
    expect(bmiCategoryAdviceKey('obese')).toBe('obese');
  });
});
