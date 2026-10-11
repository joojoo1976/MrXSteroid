import { describe, it, expect } from 'vitest';
import {
  assessViscosity,
  hematocritUpperLimit,
  type ViscosityInput,
} from './tool-076-blood-viscosity';

const base: ViscosityInput = {
  age: 35,
  sex: 'male',
  hematocrit_pct: 45,
  water_liters: 2.5,
  ldl_mg_dl: 100,
  triglycerides_mg_dl: 110,
  fibrinogen_mg_dl: null,
  smoker: false,
};

describe('tool-076 Blood Viscosity', () => {
  it('a healthy profile scores in the low band', () => {
    const r = assessViscosity(base);
    expect(r.band).toBe('low');
    expect(r.clinical_review_advised).toBe(false);
  });

  it('uses sex-specific hematocrit limits', () => {
    expect(hematocritUpperLimit('male')).toBe(52);
    expect(hematocritUpperLimit('female')).toBe(47);
  });

  it('flags high hematocrit and advises clinical review', () => {
    const r = assessViscosity({ ...base, hematocrit_pct: 56 });
    expect(r.safety_flags).toContain('high_hematocrit');
    expect(r.clinical_review_advised).toBe(true);
  });

  it('risk factors raise the index', () => {
    const r = assessViscosity({
      ...base,
      hematocrit_pct: 54,
      water_liters: 0.5,
      ldl_mg_dl: 190,
      triglycerides_mg_dl: 260,
      fibrinogen_mg_dl: 450,
      smoker: true,
    });
    expect(r.viscosity_index).toBeGreaterThan(assessViscosity(base).viscosity_index);
    expect(r.band).toBe('high');
    expect(r.safety_flags).toContain('smoker');
  });

  it('index stays within 0–100 and never recommends a drug dose', () => {
    const r = assessViscosity(base);
    expect(r.viscosity_index).toBeGreaterThanOrEqual(0);
    expect(r.viscosity_index).toBeLessThanOrEqual(100);
    expect(r.recommendations.join(' ')).not.toMatch(/\b\d+\s?(mg|mcg|iu)\b/i);
  });
});
