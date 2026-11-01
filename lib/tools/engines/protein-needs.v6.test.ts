import { describe, expect, it } from 'vitest';
import { calculateProteinNeedsV6 } from './protein-needs.v6';

describe('protein-needs.v6', () => {
  it.each([
    ['maintain', 113],
    ['bulk', 141],
    ['cut', 156],
  ] as const)('calculates the %s target', (goal, dailyProteinGrams) => {
    expect(calculateProteinNeedsV6({ weightKg: 70, goal, activityLevel: 1.2 })).toEqual({ dailyProteinGrams });
  });

  it('accepts activity factor endpoints', () => {
    expect(calculateProteinNeedsV6({ weightKg: 70, goal: 'maintain', activityLevel: 1 }).dailyProteinGrams).toBe(112);
    expect(calculateProteinNeedsV6({ weightKg: 70, goal: 'maintain', activityLevel: 1.4 }).dailyProteinGrams).toBe(114);
  });

  it.each([
    { weightKg: Number.NaN, goal: 'maintain' as const, activityLevel: 1.2 },
    { weightKg: Number.POSITIVE_INFINITY, goal: 'maintain' as const, activityLevel: 1.2 },
    { weightKg: 0, goal: 'maintain' as const, activityLevel: 1.2 },
    { weightKg: 70, goal: 'maintain' as const, activityLevel: 0.99 },
    { weightKg: 70, goal: 'maintain' as const, activityLevel: 1.41 },
  ])('rejects invalid input %#', (input) => {
    expect(() => calculateProteinNeedsV6(input)).toThrow();
  });
});
