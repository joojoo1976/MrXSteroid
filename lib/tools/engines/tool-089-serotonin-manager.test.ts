import { describe, it, expect } from 'vitest';
import { manageSerotonin } from './tool-089-serotonin-manager';

describe('Tool #089 — Serotonin Manager Engine', () => {
  it('identifies optimal harmonized serotonin state with good gut health and light', () => {
    const res = manageSerotonin({
      tryptophan_rich_food_intake: 'optimal',
      gut_health_status: 'healthy_regular',
      daily_sunlight_lux_exposure_mins: 45,
      nighttime_melatonin_transition_calm: true,
      chronic_irritability_or_carb_craving: false,
    });

    expect(res.serotonin_balance_tier).toBe('optimal-harmonized');
    expect(res.serotonin_somatic_score).toBeGreaterThanOrEqual(75);
  });

  it('detects suboptimal depleted state with GI distress and carb cravings', () => {
    const res = manageSerotonin({
      tryptophan_rich_food_intake: 'low',
      gut_health_status: 'frequent_gi_distress',
      daily_sunlight_lux_exposure_mins: 5,
      nighttime_melatonin_transition_calm: false,
      chronic_irritability_or_carb_craving: true,
    });

    expect(res.serotonin_balance_tier).toBe('suboptimal-depleted');
    expect(res.serotonin_somatic_score).toBeLessThanOrEqual(40);
    expect(res.warnings).toContain('impaired_gut_microbiome_compromises_enterochromaffin_serotonin_production');
  });
});
