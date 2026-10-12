import { describe, it, expect } from 'vitest';
import { optimizeSkinHealth, type SkinHealthOptimizerInput } from './tool-095-skin-health-optimizer';

describe('Tool #095 — Skin Health Optimizer Engine', () => {
  it('recognizes healthy skin baseline with proper hygiene and topicals', () => {
    const input: SkinHealthOptimizerInput = {
      sebum_production_level: 'normal_balanced',
      acne_lesion_distribution: 'none_or_mild_comedones',
      barrier_dryness_or_flaking: false,
      sweat_hygiene_post_workout: 'immediate_shower',
      using_topical_dht_blockers_or_salicylic: true,
    };

    const res = optimizeSkinHealth(input);
    expect(res.skin_clarity_score).toBeGreaterThanOrEqual(80);
    expect(res.dermatological_risk_tier).toBe('calm-healthy');
    expect(res.skincare_protocol_priority).toBe('maintenance-hydration');
  });

  it('flags severe cystic acne for clinical dermatological escalation', () => {
    const input: SkinHealthOptimizerInput = {
      sebum_production_level: 'excessive_hyperseborrhea',
      acne_lesion_distribution: 'deep_cystic_nodular_lesions',
      barrier_dryness_or_flaking: true,
      sweat_hygiene_post_workout: 'delayed_over_1hr',
      using_topical_dht_blockers_or_salicylic: false,
    };

    const res = optimizeSkinHealth(input);
    expect(res.skin_clarity_score).toBeLessThanOrEqual(30);
    expect(res.dermatological_risk_tier).toBe('severe-cystic-inflammatory-flare');
    expect(res.skincare_protocol_priority).toBe('clinical-dermatology-escalation');
    expect(res.warnings.some(w => w.includes('scarring'))).toBe(true);
  });
});
