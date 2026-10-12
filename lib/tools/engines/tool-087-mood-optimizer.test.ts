import { describe, it, expect } from 'vitest';
import { optimizeMood } from './tool-087-mood-optimizer';

describe('Tool #087 — Mood Optimizer Engine', () => {
  it('identifies robust flourishing state with strong habits', () => {
    const res = optimizeMood({
      sunlight_outdoor_minutes_daily: 60,
      social_connection_satisfaction: 'strong',
      physical_activity_days_weekly: 5,
      omega3_and_micronutrient_sufficiency: true,
      chronic_work_overload_burnout: false,
      subjective_anhedonia_present: false,
    });

    expect(res.affective_balance_tier).toBe('robust-flourishing');
    expect(res.affective_resilience_score).toBeGreaterThanOrEqual(75);
  });

  it('detects depleted vulnerable state with burnout, isolation, and anhedonia', () => {
    const res = optimizeMood({
      sunlight_outdoor_minutes_daily: 10,
      social_connection_satisfaction: 'isolated',
      physical_activity_days_weekly: 0,
      omega3_and_micronutrient_sufficiency: false,
      chronic_work_overload_burnout: true,
      subjective_anhedonia_present: true,
    });

    expect(res.affective_balance_tier).toBe('depleted-vulnerable');
    expect(res.affective_resilience_score).toBeLessThanOrEqual(40);
    expect(res.warnings).toContain('persistent_anhedonia_warrants_evaluation_by_a_licensed_mental_health_professional');
  });
});
