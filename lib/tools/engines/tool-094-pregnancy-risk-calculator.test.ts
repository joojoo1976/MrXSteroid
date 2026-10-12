import { describe, it, expect } from 'vitest';
import { calculatePregnancyRisk, type PregnancyRiskCalculatorInput } from './tool-094-pregnancy-risk-calculator';

describe('Tool #094 — Pregnancy Risk Calculator Engine', () => {
  it('triggers absolute contraindication for active exposure during planned pregnancy', () => {
    const input: PregnancyRiskCalculatorInput = {
      compound_class: 'retinoid_isotretinoin',
      weeks_since_last_exposure: 2,
      currently_pregnant_or_attempting_conception: true,
      unprotected_intercourse_during_exposure: true,
    };

    const res = calculatePregnancyRisk(input);
    expect(res.fetal_teratogenicity_risk).toBe('absolute-contraindicated-extreme');
    expect(res.washout_completion_status).toBe('within-active-clearance-window');
    expect(res.recommended_safe_conception_wait_weeks).toBe(22);
    expect(res.critical_safety_alerts.some(a => a.includes('absolute_contraindication'))).toBe(true);
  });

  it('recognizes completed clearance window with post-washout low risk profile', () => {
    const input: PregnancyRiskCalculatorInput = {
      compound_class: 'anabolic_androgenic_steroid',
      weeks_since_last_exposure: 20, // > 16 weeks
      currently_pregnant_or_attempting_conception: false,
      unprotected_intercourse_during_exposure: false,
    };

    const res = calculatePregnancyRisk(input);
    expect(res.fetal_teratogenicity_risk).toBe('low-post-washout-risk');
    expect(res.washout_completion_status).toBe('post-5-halflives-washout-cleared');
    expect(res.recommended_safe_conception_wait_weeks).toBe(0);
  });
});
