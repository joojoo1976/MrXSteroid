import { describe, it, expect } from 'vitest';
import { assessArterialHealth, type ArterialInput } from './tool-075-arterial-health';

const base: ArterialInput = {
  age: 35,
  systolic: 118,
  diastolic: 76,
  ldl_mg_dl: 100,
  hdl_mg_dl: 60,
  triglycerides_mg_dl: 110,
  exercise_days: 4,
  smoker: false,
  diabetes: false,
  family_history_cvd: false,
};

describe('tool-075 Arterial Health Manager', () => {
  it('a healthy profile scores in the high band', () => {
    const r = assessArterialHealth(base);
    expect(r.band).toBe('high');
    expect(r.urgent_review_advised).toBe(false);
  });

  it('risk factors lower the index', () => {
    const r = assessArterialHealth({
      ...base,
      age: 65,
      systolic: 145,
      diastolic: 92,
      ldl_mg_dl: 180,
      hdl_mg_dl: 35,
      triglycerides_mg_dl: 260,
      exercise_days: 0,
      smoker: true,
      diabetes: true,
      family_history_cvd: true,
    });
    expect(r.arterial_health_index).toBeLessThan(assessArterialHealth(base).arterial_health_index);
    expect(r.band).toBe('low');
    expect(r.safety_flags).toContain('smoker');
  });

  it('escalates a hypertensive-crisis reading', () => {
    const r = assessArterialHealth({ ...base, systolic: 190, diastolic: 125 });
    expect(r.urgent_review_advised).toBe(true);
    expect(r.safety_flags).toContain('hypertensive_crisis');
  });

  it('index stays within 0–100 and never recommends a drug dose', () => {
    const r = assessArterialHealth(base);
    expect(r.arterial_health_index).toBeGreaterThanOrEqual(0);
    expect(r.arterial_health_index).toBeLessThanOrEqual(100);
    expect(r.recommendations.join(' ')).not.toMatch(/\b\d+\s?(mg|mcg|iu)\b/i);
  });
});
