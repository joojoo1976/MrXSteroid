import { describe, expect, it } from 'vitest';
import { calculateMacros } from './tool-013-macro-optimizer';

describe('calculateMacros', () => {
  const standardInput = {
    weight_kg: 85,
    goal: 'bulk' as const,
    protein_per_kg: 2,
    fats_per_kg: 0.8,
    meals_per_day: 4,
  };

  it('calculates deterministic scenario targets and consistent macro calories', () => {
    const result = calculateMacros(standardInput);

    expect(result).toMatchObject({
      protein_g: 170,
      fats_g: 68,
      carbs_g: 238,
      total_calories: 2244,
      protein_per_meal: 43,
    });
    expect(result.meal_breakdown).toHaveLength(4);
    expect(result.meal_breakdown[0]).toMatchObject({
      protein_g: 43,
      fats_g: 17,
      carbs_g: 60,
      calories: 565,
    });
    expect(result.protein_g * 4 + result.fats_g * 9 + result.carbs_g * 4).toBe(result.total_calories);
  });

  it('uses the fixed selected goal scenario multipliers', () => {
    expect(calculateMacros({ ...standardInput, goal: 'maintain' }).total_calories).toBe(2040);
    expect(calculateMacros({ ...standardInput, goal: 'cut' }).total_calories).toBe(1734);
  });

  it.each([
    { weight_kg: Number.NaN },
    { weight_kg: Number.POSITIVE_INFINITY },
    { weight_kg: 29.9 },
    { protein_per_kg: 0 },
    { fats_per_kg: 2.1 },
    { meals_per_day: 0 },
    { goal: 'unknown' },
  ])('rejects invalid input: %o', (override) => {
    expect(() => calculateMacros({ ...standardInput, ...override } as never)).toThrow();
  });

  it('does not fabricate carbohydrates when protein and fat exceed scenario calories', () => {
    expect(() => calculateMacros({
      ...standardInput,
      weight_kg: 30,
      goal: 'cut',
      protein_per_kg: 5,
      fats_per_kg: 2,
    })).toThrowError(new RangeError('MACROS_EXCEED_CALORIE_TARGET'));
  });
});
