import { describe, expect, it } from 'vitest';
import { calculatePregnancyRisk, type PregnancyRiskCalculatorInput } from './tool-094-pregnancy-risk-calculator';

const recentExposure: PregnancyRiskCalculatorInput = {
  compound_class: 'retinoid_isotretinoin',
  weeks_since_last_exposure: 2,
  currently_pregnant_or_attempting_conception: true,
  unprotected_intercourse_during_exposure: true,
};

describe('Tool #094 — pregnancy assessment availability', () => {
  it('fails closed instead of reporting a class-based risk or a safe waiting period', () => {
    const result = calculatePregnancyRisk(recentExposure);
    expect(result.status).toBe('NOT_AVAILABLE');
    expect(result.reason).toBe('NO_PRODUCT_SPECIFIC_PREGNANCY_GUIDANCE');
    expect(result).not.toHaveProperty('fetal_teratogenicity_risk');
    expect(result).not.toHaveProperty('recommended_safe_conception_wait_weeks');
    expect(result.message).toContain('No individualized pregnancy-risk');
  });

  it('does not infer clearance or low risk from a longer elapsed interval', () => {
    const recent = calculatePregnancyRisk(recentExposure);
    const later = calculatePregnancyRisk({ ...recentExposure, weeks_since_last_exposure: 52, currently_pregnant_or_attempting_conception: false, unprotected_intercourse_during_exposure: false });
    expect(later).toEqual(recent);
    expect(later.status).toBe('NOT_AVAILABLE');
  });
});
