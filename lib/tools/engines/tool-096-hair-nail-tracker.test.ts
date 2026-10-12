import { describe, it, expect } from 'vitest';
import { trackHairNailStatus } from './tool-096-hair-nail-tracker';

describe('Tool #096 — Hair & Nail Tracker Engine', () => {
  it('computes robust vitality when shedding is low and no thinning is present', () => {
    const result = trackHairNailStatus({
      daily_shedding_rate: 'normal_under_50',
      temporal_vertex_thinning: false,
      scalp_sebum_inflammation: 'none',
      nail_brittleness_or_ridging: false,
      using_5ar_inhibitor_or_minoxidil: false,
    });
    expect(result.hair_follicle_vitality_score).toBeGreaterThanOrEqual(75);
    expect(result.androgenic_alopecia_risk_tier).toBe('minimal');
    expect(result.keratin_matrix_health_tier).toBe('robust');
  });

  it('detects accelerated miniaturization when shedding is high and thinning is present', () => {
    const result = trackHairNailStatus({
      daily_shedding_rate: 'excessive_over_100',
      temporal_vertex_thinning: true,
      scalp_sebum_inflammation: 'severe_seborrheic_dermatitis',
      nail_brittleness_or_ridging: true,
      using_5ar_inhibitor_or_minoxidil: false,
    });
    expect(result.hair_follicle_vitality_score).toBeLessThan(45);
    expect(result.androgenic_alopecia_risk_tier).toBe('accelerated-miniaturization');
    expect(result.keratin_matrix_health_tier).toBe('compromised-brittle');
  });
});
