import { describe, it, expect } from 'vitest';
import { calculateSystemicInflammation } from './tool-072-systemic-inflammation-calculator';

describe('Tool #072 — Systemic Inflammation Calculator Engine', () => {
  it('evaluates low inflammatory burden for optimal crp and waist', () => {
    const res = calculateSystemicInflammation({
      hs_crp_mg_l: 0.5,
      waist_circumference_cm: 82,
      sleep_hours_per_night: 8,
      smoker_or_heavy_alcohol: false,
      chronic_joint_pain: false,
    });
    expect(res.inflammation_risk_score).toBe(10);
    expect(res.risk_band).toBe('low-inflammatory-burden');
    expect(res.crp_context).toBe('optimal');
  });

  it('detects high burden when hs-CRP is high and visceral fat is elevated', () => {
    const res = calculateSystemicInflammation({
      hs_crp_mg_l: 4.5,
      waist_circumference_cm: 106,
      sleep_hours_per_night: 5,
      smoker_or_heavy_alcohol: true,
      chronic_joint_pain: true,
    });
    // 10 + 45 + 25 + 15 + 20 + 10 = 125 -> clamped 100
    expect(res.inflammation_risk_score).toBe(100);
    expect(res.risk_band).toBe('high-inflammatory-burden');
    expect(res.crp_context).toBe('high-systemic-risk');
    expect(res.warnings).toContain('hs_crp_over_3_high_systemic_inflammatory_state');
    expect(res.warnings).toContain('visceral_adiposity_significant_inflammatory_cytokine_source');
  });

  it('handles optional crp value gracefully when untested', () => {
    const res = calculateSystemicInflammation({
      waist_circumference_cm: 90,
      sleep_hours_per_night: 7,
      smoker_or_heavy_alcohol: false,
      chronic_joint_pain: false,
    });
    expect(res.crp_context).toBe('not-tested');
    expect(res.inflammation_risk_score).toBe(10);
    expect(res.risk_band).toBe('low-inflammatory-burden');
  });
});
