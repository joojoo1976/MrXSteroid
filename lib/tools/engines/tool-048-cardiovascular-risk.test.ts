import { describe, it, expect } from 'vitest';
import { assessCardiovascularRisk, type CardioInput } from './tool-048-cardiovascular-risk';

const base: CardioInput = {
  age: 30,
  sex: 'male',
  systolic_bp: 115,
  total_cholesterol_mg_dl: 170,
  hdl_mg_dl: 60,
  smoker: false,
  diabetic: false,
  on_antihypertensive: false,
  hematocrit_pct: 45,
  androgen_exposure: false,
  red_flags: {
    chest_pain: false,
    breathlessness_at_rest: false,
    syncope: false,
    unilateral_leg_swelling: false,
  },
};

describe('tool-048 Cardiovascular Risk', () => {
  it('low-risk profile lands in the low category', () => {
    const r = assessCardiovascularRisk(base);
    expect(r.risk_category).toBe('low');
    expect(r.emergency).toBe(false);
  });

  it('cumulative risk factors increase points and risk', () => {
    const high = assessCardiovascularRisk({
      ...base,
      age: 60,
      systolic_bp: 165,
      total_cholesterol_mg_dl: 300,
      hdl_mg_dl: 35,
      smoker: true,
      diabetic: true,
      hematocrit_pct: 55,
      androgen_exposure: true,
    });
    expect(high.risk_points).toBeGreaterThan(assessCardiovascularRisk(base).risk_points);
    expect(['high', 'very-high']).toContain(high.risk_category);
  });

  it('any red-flag symptom triggers emergency guidance', () => {
    const r = assessCardiovascularRisk({ ...base, red_flags: { ...base.red_flags, chest_pain: true } });
    expect(r.emergency).toBe(true);
    expect(r.emergency_message).toMatch(/emergency/i);
  });

  it('high hematocrit is surfaced as an androgen-related modifier', () => {
    const r = assessCardiovascularRisk({ ...base, hematocrit_pct: 55, androgen_exposure: true });
    expect(r.modifiers.join(' ')).toMatch(/hematocrit/i);
  });

  it('10-year risk is bounded', () => {
    const r = assessCardiovascularRisk(base);
    expect(r.ten_year_risk_pct).toBeGreaterThan(0);
    expect(r.ten_year_risk_pct).toBeLessThanOrEqual(60);
  });
});
