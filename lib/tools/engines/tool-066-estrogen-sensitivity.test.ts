import { describe, it, expect } from 'vitest';
import {
  assessEstrogenSensitivity,
  type EstrogenSensitivityInput,
} from './tool-066-estrogen-sensitivity';

const calm: EstrogenSensitivityInput = {
  water_retention: 0,
  nipple_sensitivity: 0,
  mood_swings: 0,
  libido_change: 0,
  bloating: 0,
  joint_aches: 0,
  estradiol_pg_ml: 25,
  body_fat_pct: 15,
  painful_breast_changes: false,
};

describe('tool-066 Estrogen Sensitivity Manager', () => {
  it('a symptom-free profile scores in the low band', () => {
    const r = assessEstrogenSensitivity(calm);
    expect(r.symptom_burden).toBe(0);
    expect(r.band).toBe('low');
    expect(r.clinical_review_advised).toBe(false);
  });

  it('the index rises monotonically with symptom burden', () => {
    const mid = assessEstrogenSensitivity({ ...calm, water_retention: 3, mood_swings: 3, bloating: 3 });
    const full = assessEstrogenSensitivity({
      ...calm,
      water_retention: 3, nipple_sensitivity: 3, mood_swings: 3, libido_change: 3, bloating: 3, joint_aches: 3,
    });
    expect(full.estrogen_sensitivity_index).toBeGreaterThan(mid.estrogen_sensitivity_index);
    expect(full.symptom_burden).toBe(18);
    expect(full.band).toBe('high');
  });

  it('escalates painful breast changes to clinical review', () => {
    const r = assessEstrogenSensitivity({ ...calm, painful_breast_changes: true });
    expect(r.safety_flags).toContain('painful_breast_changes');
    expect(r.clinical_review_advised).toBe(true);
  });

  it('keeps the index within 0–100 and clamps symptoms', () => {
    const r = assessEstrogenSensitivity({ ...calm, water_retention: 99, nipple_sensitivity: 3 });
    expect(r.estrogen_sensitivity_index).toBeGreaterThanOrEqual(0);
    expect(r.estrogen_sensitivity_index).toBeLessThanOrEqual(100);
    expect(r.symptom_burden).toBeLessThanOrEqual(18);
  });

  it('never recommends an aromatase inhibitor or SERM', () => {
    const r = assessEstrogenSensitivity(calm);
    expect(r.education.join(' ')).toMatch(/never recommends an aromatase inhibitor/i);
    expect(r.education.join(' ')).not.toMatch(/\b\d+\s?(mg|iu|mcg)\b/i);
  });
});
