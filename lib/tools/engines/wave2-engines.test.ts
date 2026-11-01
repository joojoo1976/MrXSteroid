import { describe, it, expect } from 'vitest';
import { calculateBmi } from './bmi.v6';
import { calculateOneRepMax } from './one-rep-max.v6';
import { calculateStrengthStandards } from './strength-standards.v6';
import { calculateRestTimer } from './rest-timer.v6';

describe('bmi.v6', () => {
  it('normal', () => { expect(calculateBmi({ weightKg: 70, heightCm: 175 }).category).toBe('normal'); });
  it('rejects invalid', () => { expect(() => calculateBmi({ weightKg: 0, heightCm: 175 })).toThrow(); });
});

describe('one-rep-max.v6', () => {
  it('computes', () => { expect(calculateOneRepMax({ weightKg: 100, reps: 5 }).oneRepMaxKg).toBeGreaterThan(100); });
  it('rejects invalid', () => { expect(() => calculateOneRepMax({ weightKg: -1, reps: 5 })).toThrow(); });
});

describe('strength-standards.v6', () => {
  it('level', () => { expect(calculateStrengthStandards({ liftKg: 100, bodyWeightKg: 80, sex: 'male' }).level).toBeDefined(); });
  it('rejects invalid', () => { expect(() => calculateStrengthStandards({ liftKg: 0, bodyWeightKg: 80, sex: 'male' })).toThrow(); });
});

describe('rest-timer.v6', () => {
  it('computes', () => { expect(calculateRestTimer({ sets: 3, intensity: 'high' }).restSeconds).toBe(180); });
  it('rejects invalid', () => { expect(() => calculateRestTimer({ sets: 0, intensity: 'high' })).toThrow(); });
});
