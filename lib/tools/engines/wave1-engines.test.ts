import { describe, it, expect } from 'vitest';
import { calculateBmrTdeeV6 } from './bmr-tdee.v6';
import { calculateWaterIntakeV6 } from './water-intake.v6';
import { calculateProteinNeedsV6 } from './protein-needs.v6';

describe('bmr-tdee.v6', () => {
  it('computes male bmr/tdee', () => {
    const r = calculateBmrTdeeV6({ weightKg: 85, heightCm: 180, age: 28, sex: 'male', activityLevel: 1.55 });
    expect(r.bmrKcal).toBe(1840);
    expect(r.tdeeKcal).toBe(2852);
  });
  it('rejects invalid', () => {
    expect(() => calculateBmrTdeeV6({ weightKg: NaN as any, heightCm: 180, age: 28, sex: 'male', activityLevel: 1.55 })).toThrow();
    expect(() => calculateBmrTdeeV6({ weightKg: -1, heightCm: 180, age: 28, sex: 'male', activityLevel: 1.55 })).toThrow();
  });
});

describe('water-intake.v6', () => {
  it('computes liters', () => {
    const r = calculateWaterIntakeV6({ weightKg: 80, activityLevel: 1.4 });
    expect(r.dailyWaterLiters).toBeGreaterThan(2);
  });
  it('rejects invalid', () => {
    expect(() => calculateWaterIntakeV6({ weightKg: 0, activityLevel: 1.4 })).toThrow();
  });
});

describe('protein-needs.v6', () => {
  it('computes grams', () => {
    const r = calculateProteinNeedsV6({ weightKg: 80, goal: 'maintain', activityLevel: 1.4 });
    expect(r.dailyProteinGrams).toBeGreaterThan(100);
  });
  it('rejects invalid', () => {
    expect(() => calculateProteinNeedsV6({ weightKg: Infinity as any, goal: 'maintain', activityLevel: 1.4 })).toThrow();
  });
});
