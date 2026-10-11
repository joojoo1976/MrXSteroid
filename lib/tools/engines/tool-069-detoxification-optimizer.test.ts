import { describe, it, expect } from 'vitest';
import { optimizeDetoxification } from './tool-069-detoxification-optimizer';

describe('Tool #069 — Detoxification Optimizer Engine', () => {
  it('calculates optimal score for high compliance without liver stressors', () => {
    const res = optimizeDetoxification({
      daily_water_liters: 3.5,
      daily_fiber_grams: 35,
      cruciferous_servings_week: 6,
      alcohol_drinks_week: 0,
      takes_nac_or_glutathione_support: true,
      oral_compounds_present: false,
    });
    // 20 + 20 + 20 + 15 + 15 = 90
    expect(res.hepatic_support_score).toBe(90);
    expect(res.support_tier).toBe('optimal-support');
    expect(res.key_recommendations.length).toBe(0);
    expect(res.warnings).toEqual(['evidence_based_physiological_support_only']);
  });

  it('generates recommendations when support factors are low', () => {
    const res = optimizeDetoxification({
      daily_water_liters: 1.5,
      daily_fiber_grams: 12,
      cruciferous_servings_week: 1,
      alcohol_drinks_week: 4,
      takes_nac_or_glutathione_support: false,
      oral_compounds_present: false,
    });
    // 20 + 0 + 0 + 0 + 0 - 10 = 10
    expect(res.hepatic_support_score).toBe(10);
    expect(res.support_tier).toBe('suboptimal-support');
    expect(res.key_recommendations).toContain('increase_hydration_3l');
    expect(res.key_recommendations).toContain('increase_dietary_fiber_30g');
    expect(res.key_recommendations).toContain('consume_cruciferous_veg_5x_week');
  });

  it('triggers strict warnings when alcohol and oral compounds collide', () => {
    const res = optimizeDetoxification({
      daily_water_liters: 2.5,
      daily_fiber_grams: 25,
      cruciferous_servings_week: 4,
      alcohol_drinks_week: 8,
      takes_nac_or_glutathione_support: false,
      oral_compounds_present: true,
    });
    expect(res.warnings).toContain('c17aa_orals_require_active_liver_enzyme_monitoring');
    expect(res.warnings).toContain('zero_alcohol_mandate_during_oral_use');
    expect(res.warnings).toContain('alcohol_compounds_hepatic_burden');
    expect(res.key_recommendations).toContain('consider_nac_or_tudca_with_physician');
  });
});
