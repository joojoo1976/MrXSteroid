import { describe, it, expect } from 'vitest';
import { calculateGeneticPotentialV6 } from './genetic-potential.v6';

describe('genetic-potential.v6', () => {
  const base = { age: 30, trainingYears: 5, priorCycles: 1, familyHistory: 'none' as const, bodyType: 'mesomorph' as const, goal: 'bulk' as const, currentWeightKg: 80, heightCm: 180 };

  it('returns score in range', () => {
    const r = calculateGeneticPotentialV6(base);
    expect(r.potentialScore).toBeGreaterThanOrEqual(0);
    expect(r.potentialScore).toBeLessThanOrEqual(100);
  });

  it('rejects invalid weight', () => {
    expect(() => calculateGeneticPotentialV6({ ...base, currentWeightKg: 0 })).toThrow();
    expect(() => calculateGeneticPotentialV6({ ...base, currentWeightKg: NaN })).toThrow();
    expect(() => calculateGeneticPotentialV6({ ...base, currentWeightKg: Infinity })).toThrow();
  });

  it('rejects invalid height', () => {
    expect(() => calculateGeneticPotentialV6({ ...base, heightCm: -1 })).toThrow();
  });

  it('rejects negative trainingYears', () => {
    expect(() => calculateGeneticPotentialV6({ ...base, trainingYears: -1 })).toThrow();
  });

  it('bmi computed', () => {
    const r = calculateGeneticPotentialV6(base);
    expect(r.bmi).toBeCloseTo(24.7, 1);
  });
});