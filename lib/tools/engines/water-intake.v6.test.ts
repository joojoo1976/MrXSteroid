import { describe, expect, it } from 'vitest';
import { calculateWaterIntakeV6 } from './water-intake.v6';

describe('water-intake.v6', () => {
  it('calculates the baseline estimate and activity adjustment', () => {
    expect(calculateWaterIntakeV6({ weightKg: 70, activityLevel: 1.2 })).toEqual({ dailyWaterLiters: 2.5 });
  });

  it('accepts the activity factor endpoints', () => {
    expect(calculateWaterIntakeV6({ weightKg: 70, activityLevel: 1 }).dailyWaterLiters).toBe(2.45);
    expect(calculateWaterIntakeV6({ weightKg: 70, activityLevel: 1.4 }).dailyWaterLiters).toBe(2.55);
  });

  it.each([
    { weightKg: Number.NaN, activityLevel: 1.2 },
    { weightKg: Number.POSITIVE_INFINITY, activityLevel: 1.2 },
    { weightKg: 0, activityLevel: 1.2 },
    { weightKg: 70, activityLevel: 0.99 },
    { weightKg: 70, activityLevel: 1.41 },
  ])('rejects invalid input %#', (input) => {
    expect(() => calculateWaterIntakeV6(input)).toThrow();
  });
});
