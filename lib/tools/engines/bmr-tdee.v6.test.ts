import { describe, expect, it } from 'vitest';
import { calculateBmrTdeeV6 } from './bmr-tdee.v6';

describe('bmr-tdee.v6', () => {
  it('calculates the male Mifflin–St Jeor estimate', () => {
    expect(calculateBmrTdeeV6({ weightKg: 70, heightCm: 175, age: 30, sex: 'male', activityLevel: 1.55 }))
      .toEqual({ bmrKcal: 1649, tdeeKcal: 2556 });
  });

  it('uses the female sex constant', () => {
    expect(calculateBmrTdeeV6({ weightKg: 70, heightCm: 175, age: 30, sex: 'female', activityLevel: 1.2 }).bmrKcal).toBe(1483);
  });

  it('accepts the activity factor endpoints', () => {
    expect(calculateBmrTdeeV6({ weightKg: 70, heightCm: 175, age: 30, sex: 'male', activityLevel: 1.2 }).tdeeKcal).toBe(1979);
    expect(calculateBmrTdeeV6({ weightKg: 70, heightCm: 175, age: 30, sex: 'male', activityLevel: 1.9 }).tdeeKcal).toBe(3133);
  });

  it.each([
    { weightKg: Number.NaN, heightCm: 175, age: 30, sex: 'male' as const, activityLevel: 1.55 },
    { weightKg: 70, heightCm: Number.POSITIVE_INFINITY, age: 30, sex: 'male' as const, activityLevel: 1.55 },
    { weightKg: 0, heightCm: 175, age: 30, sex: 'male' as const, activityLevel: 1.55 },
    { weightKg: 70, heightCm: 175, age: -1, sex: 'male' as const, activityLevel: 1.55 },
    { weightKg: 70, heightCm: 175, age: 30, sex: 'male' as const, activityLevel: 1.19 },
    { weightKg: 70, heightCm: 175, age: 30, sex: 'male' as const, activityLevel: 1.91 },
  ])('rejects invalid input %#', (input) => {
    expect(() => calculateBmrTdeeV6(input)).toThrow();
  });
});
