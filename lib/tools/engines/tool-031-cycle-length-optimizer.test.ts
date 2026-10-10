/**
 * Tool #031 — Cycle Length Optimizer: engine + schema verification.
 * Proves the suppression-load math, ester-bottleneck adjustment and caps.
 */
import { describe, it, expect } from 'vitest';
import { calculateCycleLength } from './tool-031-cycle-length-optimizer';
import { CycleLengthInputSchema, CycleLengthResultSchema } from '../schemas/tool-031-cycle-length-optimizer';

const BASE_COMPOUND = {
  name_en: 'Testosterone Enanthate',
  suppression_factor: 1,
  half_life_days: 4.5,
  weekly_dose_mg: 500,
};

describe('tool-031 cycle-length engine', () => {
  it('computes a 12-week optimal window for a moderate bulk cycle', () => {
    const input = {
      goal: 'bulk' as const,
      experience: 'intermediate' as const,
      previous_cycles: 2,
      compounds: [BASE_COMPOUND],
    };
    expect(CycleLengthInputSchema.safeParse(input).success).toBe(true);
    const r = calculateCycleLength(input);
    expect(CycleLengthResultSchema.safeParse(r).success).toBe(true);
    expect(r.suppression_load).toBe(1);
    expect(r.ester_bottleneck_days).toBe(4.5);
    expect(r.optimal_weeks).toBe(12);
    expect(r.min_weeks).toBe(6);
    expect(r.max_weeks).toBe(16);
  });

  it('caps harsh stacks at 8 weeks and extends long-ester bases', () => {
    const r = calculateCycleLength({
      goal: 'bulk',
      experience: 'advanced',
      previous_cycles: 4,
      compounds: [
        { name_en: 'Trenbolone', suppression_factor: 3.5, half_life_days: 3, weekly_dose_mg: 400 },
        { name_en: 'Nandrolone Decanoate', suppression_factor: 3, half_life_days: 7.5, weekly_dose_mg: 400 },
      ],
    });
    // load = 3.5*0.8 + 3*0.8 = 5.2 -> cap 10; bottleneck 7.5 < 10 so no +2
    expect(r.suppression_load).toBeCloseTo(5.2, 5);
    expect(r.max_weeks).toBe(10);
    expect(r.optimal_weeks).toBeLessThanOrEqual(10);
  });

  it('adds 2 steady-state weeks for very long esters', () => {
    const r = calculateCycleLength({
      goal: 'recomp',
      experience: 'intermediate',
      previous_cycles: 2,
      compounds: [
        { name_en: 'Testosterone Undecanoate', suppression_factor: 1, half_life_days: 20.9, weekly_dose_mg: 250 },
      ],
    });
    // base 10 + 2 = 12; load 0.5 -> no cap
    expect(r.optimal_weeks).toBe(12);
    expect(r.ester_bottleneck_days).toBe(20.9);
  });

  it('constrains beginners to a 8-10 week safety window', () => {
    const r = calculateCycleLength({
      goal: 'bulk',
      experience: 'beginner',
      previous_cycles: 0,
      compounds: [BASE_COMPOUND],
    });
    expect(r.min_weeks).toBe(8);
    expect(r.max_weeks).toBe(10);
    expect(r.optimal_weeks).toBeGreaterThanOrEqual(8);
    expect(r.optimal_weeks).toBeLessThanOrEqual(10);
  });

  it('rejects invalid input through the schema', () => {
    expect(CycleLengthInputSchema.safeParse({ ...{ goal: 'bulk' }, compounds: [] }).success).toBe(false);
    expect(
      CycleLengthInputSchema.safeParse({
        goal: 'bulk',
        experience: 'intermediate',
        previous_cycles: 0,
        compounds: [{ ...BASE_COMPOUND, suppression_factor: 99 }],
      }).success,
    ).toBe(false);
  });
});
