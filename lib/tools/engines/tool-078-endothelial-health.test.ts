import { describe, it, expect } from 'vitest';
import { assessEndothelialHealth, type EndothelialInput } from './tool-078-endothelial-health';

const base: EndothelialInput = {
  age: 35,
  systolic: 118,
  diastolic: 76,
  ldl_mg_dl: 100,
  hdl_mg_dl: 60,
  fasting_glucose_mg_dl: 90,
  hba1c_pct: 5.2,
  exercise_days: 4,
  sleep_hours: 8,
  smoker: false,
};

describe('tool-078 Endothelial Health Manager', () => {
  it('a healthy profile scores in the high band', () => {
    const r = assessEndothelialHealth(base);
    expect(r.band).toBe('high');
    expect(r.urgent_review_advised).toBe(false);
  });

  it('metabolic risk factors lower the index', () => {
    const r = assessEndothelialHealth({
      ...base,
      age: 62,
      systolic: 148,
      diastolic: 94,
      ldl_mg_dl: 175,
      hdl_mg_dl: 35,
      fasting_glucose_mg_dl: 150,
      hba1c_pct: 7.2,
      exercise_days: 0,
      sleep_hours: 5,
      smoker: true,
    });
    expect(r.endothelial_function_index).toBeLessThan(assessEndothelialHealth(base).endothelial_function_index);
    expect(r.band).toBe('low');
    expect(r.safety_flags).toContain('high_glucose');
  });

  it('escalates a hypertensive-crisis reading', () => {
    const r = assessEndothelialHealth({ ...base, systolic: 185, diastolic: 122 });
    expect(r.urgent_review_advised).toBe(true);
    expect(r.safety_flags).toContain('hypertensive_crisis');
  });

  it('index stays within 0–100 and never recommends a drug dose', () => {
    const r = assessEndothelialHealth(base);
    expect(r.endothelial_function_index).toBeGreaterThanOrEqual(0);
    expect(r.endothelial_function_index).toBeLessThanOrEqual(100);
    expect(r.recommendations.join(' ')).not.toMatch(/\b\d+\s?(mg|mcg|iu)\b/i);
  });
});
