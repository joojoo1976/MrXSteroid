import { describe, it, expect } from 'vitest';
import { optimizeDigestiveHealth } from './tool-099-digestive-health-optimizer';

describe('Tool #099 — Digestive Health Optimizer Engine', () => {
  it('computes intact gut barrier when digestion is smooth and bristol score is optimal', () => {
    const result = optimizeDigestiveHealth({
      daily_protein_intake_grams: 150,
      bloating_or_reflux_frequency: 'rare',
      bowel_regularity_bristol_score: 4,
      using_oral_17aa_or_nsaids: false,
      fermented_food_or_probiotic_intake: true,
    });
    expect(result.digestive_efficiency_score).toBeGreaterThanOrEqual(75);
    expect(result.gi_barrier_strain_tier).toBe('healthy-intact');
  });

  it('detects mucosal strain under severe reflux, high protein, and oral 17aa androgens', () => {
    const result = optimizeDigestiveHealth({
      daily_protein_intake_grams: 280,
      bloating_or_reflux_frequency: 'severe_daily',
      bowel_regularity_bristol_score: 1,
      using_oral_17aa_or_nsaids: true,
      fermented_food_or_probiotic_intake: false,
    });
    expect(result.digestive_efficiency_score).toBeLessThan(45);
    expect(result.gi_barrier_strain_tier).toBe('compromised-mucosal-strain');
  });
});
