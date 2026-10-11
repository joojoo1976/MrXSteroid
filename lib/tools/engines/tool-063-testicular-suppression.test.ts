import { describe, it, expect } from 'vitest';
import {
  assessTesticularSuppression,
  suppressionFraction,
  EXPOSURE_POTENCY,
  type TesticularSuppressionInput,
} from './tool-063-testicular-suppression';

const base: TesticularSuppressionInput = {
  baseline_volume_ml: 20,
  exposure_weeks: 12,
  exposure: 'exogenous_androgen',
  fertility_intent: false,
  testicular_pain: false,
  age: 30,
};

describe('tool-063 Testicular Suppression', () => {
  it('suppression rises monotonically with exposure duration and saturates', () => {
    const a = suppressionFraction(4, 0.95);
    const b = suppressionFraction(12, 0.95);
    const c = suppressionFraction(52, 0.95);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
    expect(c).toBeLessThanOrEqual(1);
    expect(c).toBeGreaterThan(0.9);
  });

  it('no exposure means no suppression', () => {
    expect(EXPOSURE_POTENCY.none).toBe(0);
    const r = assessTesticularSuppression({ ...base, exposure: 'none' });
    expect(r.suppression_index).toBe(0);
    expect(r.band).toBe('minimal');
    expect(r.estimated_volume_ml).toBeCloseTo(20, 1);
  });

  it('long exogenous androgen exposure yields severe suppression', () => {
    const r = assessTesticularSuppression({ ...base, exposure_weeks: 40 });
    expect(r.band).toBe('severe');
    expect(r.safety_flags).toContain('severe_suppression');
    expect(r.clinical_referral_advised).toBe(true);
    expect(r.estimated_volume_ml).toBeLessThan(base.baseline_volume_ml);
  });

  it('escalates fertility intent during suppression and testicular pain', () => {
    const fertile = assessTesticularSuppression({ ...base, fertility_intent: true });
    expect(fertile.safety_flags).toContain('fertility_intent_with_suppression');
    expect(fertile.clinical_referral_advised).toBe(true);
    const pain = assessTesticularSuppression({ ...base, testicular_pain: true });
    expect(pain.safety_flags).toContain('testicular_pain');
    expect(pain.clinical_referral_advised).toBe(true);
  });

  it('never recommends hCG, SERMs or a dose', () => {
    const r = assessTesticularSuppression(base);
    expect(r.education.join(' ')).not.toMatch(/\b\d+\s?(mg|iu|mcg)\b/i);
    expect(r.education.join(' ')).toMatch(/never recommends hCG/i);
  });
});
