import { describe, it, expect } from 'vitest';
import { calculateCortisolStress } from './tool-086-cortisol-stress-calculator';

describe('Tool #086 — Cortisol Stress Calculator Engine', () => {
  it('correctly scores balanced adaptive HPA axis state', () => {
    const res = calculateCortisolStress({
      morning_exhaustion_rating: 2,
      evening_tired_but_wired: false,
      daily_caffeine_cups: 1,
      resting_heart_rate_variability_trend: 'normal_high',
      intense_training_sessions_weekly: 3,
      life_stressors_level: 'low',
    });

    expect(res.hpa_axis_status_tier).toBe('adaptive-balanced');
    expect(res.catabolic_risk_tier).toBe('low');
    expect(res.cortisol_stress_load_score).toBeLessThanOrEqual(35);
  });

  it('detects dysregulated exhaustion with high stress, low HRV and caffeine', () => {
    const res = calculateCortisolStress({
      morning_exhaustion_rating: 9,
      evening_tired_but_wired: true,
      daily_caffeine_cups: 6,
      resting_heart_rate_variability_trend: 'chronically_low',
      intense_training_sessions_weekly: 8,
      life_stressors_level: 'extreme',
    });

    expect(res.hpa_axis_status_tier).toBe('dysregulated-exhaustion');
    expect(res.catabolic_risk_tier).toBe('high');
    expect(res.cortisol_stress_load_score).toBeGreaterThanOrEqual(70);
    expect(res.warnings).toContain('severe_morning_exhaustion_correlates_with_blunted_cortisol_awakening_response');
  });
});
