import { describe, it, expect } from 'vitest';
import { manageEstrogenSensitivity } from './tool-066-estrogen-sensitivity-manager';

describe('Tool #066 — Estrogen Sensitivity Manager Engine', () => {
  it('identifies asymptomatic baseline with normal sensitivity', () => {
    const res = manageEstrogenSensitivity({
      e2_level_pg_ml: 28,
      water_retention_score: 0,
      nipple_sensitivity: false,
      mood_lability_score: 0,
      libido_impact: 'none',
    });
    expect(res.total_symptom_score).toBe(0);
    expect(res.sensitivity_pattern).toBe('normal-sensitivity');
    expect(res.contextual_band).toBe('asymptomatic');
    expect(res.warnings).toContain('educational_sensitivity_assessment');
  });

  it('detects high-sensitivity when heavy symptoms occur at normal E2 levels', () => {
    const res = manageEstrogenSensitivity({
      e2_level_pg_ml: 30,
      water_retention_score: 2,
      nipple_sensitivity: true,
      mood_lability_score: 1,
      libido_impact: 'reduced',
    });
    // score: 2 + 1 + 3 (nipple) + 1 (libido) = 7
    expect(res.total_symptom_score).toBe(7);
    expect(res.sensitivity_pattern).toBe('high-sensitivity');
    expect(res.contextual_band).toBe('significant-estrogenic-burden');
    expect(res.warnings).toContain('symptomatic_at_normal_e2_levels');
    expect(res.warnings).toContain('nipple_sensitivity_monitor_closely');
  });

  it('detects low-sensitivity when minimal symptoms persist despite elevated E2', () => {
    const res = manageEstrogenSensitivity({
      e2_level_pg_ml: 65,
      water_retention_score: 1,
      nipple_sensitivity: false,
      mood_lability_score: 0,
      libido_impact: 'none',
    });
    expect(res.total_symptom_score).toBe(1);
    expect(res.sensitivity_pattern).toBe('low-sensitivity');
    expect(res.contextual_band).toBe('mild-estrogenic-burden');
  });
});
