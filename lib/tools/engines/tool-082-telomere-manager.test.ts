import { describe, it, expect } from 'vitest';
import { manageTelomeres } from './tool-082-telomere-manager';

describe('Tool #082 — Telomere Manager Engine', () => {
  it('identifies optimal telomere protection protocol', () => {
    const res = manageTelomeres({
      perceived_chronic_stress_level: 'low',
      aerobic_exercise_hours_weekly: 4,
      mediterranean_diet_adherence: 'high',
      omega3_supplementation_or_fatty_fish: true,
      bmi: 23,
    });

    expect(res.telomere_status_band).toBe('optimal-telomere-support');
    expect(res.telomere_protection_score).toBeGreaterThanOrEqual(80);
  });

  it('detects severe attrition risk with chronic stress and sedentary habit', () => {
    const res = manageTelomeres({
      perceived_chronic_stress_level: 'severe',
      aerobic_exercise_hours_weekly: 0,
      mediterranean_diet_adherence: 'low',
      omega3_supplementation_or_fatty_fish: false,
      bmi: 34,
    });

    expect(res.telomere_status_band).toBe('depleted-attrition-risk');
    expect(res.warnings).toContain('severe_chronic_stress_significantly_blunts_telomerase_activity');
    expect(res.warnings).toContain('marked_adiposity_induces_oxidative_stress_accelerating_telomeric_loss');
  });
});
