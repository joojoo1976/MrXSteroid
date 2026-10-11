import { describe, it, expect } from 'vitest';
import { optimizeMitochondria } from './tool-080-mitochondrial-optimizer';

describe('Tool #080 — Mitochondrial Optimizer Engine', () => {
  it('correctly scores high mitochondrial capacity protocol', () => {
    const res = optimizeMitochondria({
      zone2_weekly_hours: 4.5,
      hiit_sessions_per_week: 2,
      coq10_or_nad_support: true,
      cold_heat_exposure: true,
      sleep_quality_score: 9,
      statin_use: false,
    });

    expect(res.mitochondrial_status_band).toBe('peak-mitochondrial-capacity');
    expect(res.mitochondrial_efficiency_score).toBeGreaterThanOrEqual(80);
  });

  it('detects statin coq10 depletion and lack of aerobic stimulus', () => {
    const res = optimizeMitochondria({
      zone2_weekly_hours: 0,
      hiit_sessions_per_week: 0,
      coq10_or_nad_support: false,
      cold_heat_exposure: false,
      sleep_quality_score: 3,
      statin_use: true,
    });

    expect(res.mitochondrial_status_band).toBe('impaired-biogenesis');
    expect(res.warnings).toContain('statin_therapy_depletes_endogenous_coenzyme_q10_impairing_complex_ii_electron_transport');
    expect(res.warnings).toContain('insufficient_low_intensity_aerobic_base_limits_mitochondrial_biogenesis');
  });
});
