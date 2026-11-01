import { describe, expect, it } from 'vitest';
import { calculateGeneticPotential } from './tool-020-genetic-potential';

const input = {
  age: 30,
  trainingYears: 4,
  priorCycles: 0,
  familyHistory: 'none' as const,
  bodyType: 'mixed' as const,
  goal: 'strength' as const,
  currentWeight: 85,
  height: 180,
};

describe('tool 020 arithmetic indicator', () => {
  it('is deterministic, bounded, and does not emit drug, cycle, or dose recommendations', () => {
    const result = calculateGeneticPotential(input);
    expect(result).toEqual(calculateGeneticPotential(input));
    expect(result.potential_score).toBeGreaterThanOrEqual(0);
    expect(result.potential_score).toBeLessThanOrEqual(100);
    expect(result).not.toHaveProperty('recommended_compounds');
    expect(result).not.toHaveProperty('avoided_compounds');
    expect(result).not.toHaveProperty('recommended_cycle_length');
    expect(result).not.toHaveProperty('recommended_dosage_multiplier');
    expect(result).not.toHaveProperty('personalized_tips');
  });
});
