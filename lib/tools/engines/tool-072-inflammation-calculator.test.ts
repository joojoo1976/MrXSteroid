import { describe, it, expect } from 'vitest';
import {
  assessInflammation,
  hsCrpBand,
  type InflammationInput,
} from './tool-072-inflammation-calculator';

const base: InflammationInput = {
  hs_crp_mg_l: null,
  esr_mm_hr: null,
  age: 35,
  bmi: 23,
  sleep_hours: 8,
  exercise_days: 4,
  alcohol_units_week: 2,
  produce_servings: 6,
  oily_fish_servings: 2,
  sugar_servings: 1,
  stress_level: 3,
  smoker: false,
};

describe('tool-072 Systemic Inflammation Calculator', () => {
  it('a healthy profile scores in the low band with unknown hs-CRP', () => {
    const r = assessInflammation(base);
    expect(r.band).toBe('low');
    expect(r.hs_crp_band).toBe('unknown');
    expect(r.urgent_review_advised).toBe(false);
  });

  it('classifies hs-CRP bands correctly', () => {
    expect(hsCrpBand(0.5)).toBe('normal');
    expect(hsCrpBand(2)).toBe('moderate');
    expect(hsCrpBand(5)).toBe('high');
    expect(hsCrpBand(15)).toBe('very-high');
    expect(hsCrpBand(null)).toBe('unknown');
  });

  it('flags very high hs-CRP for urgent review', () => {
    const r = assessInflammation({ ...base, hs_crp_mg_l: 18 });
    expect(r.hs_crp_band).toBe('very-high');
    expect(r.urgent_review_advised).toBe(true);
    expect(r.safety_flags).toContain('very_high_hs_crp');
  });

  it('unhealthy lifestyle raises the index', () => {
    const r = assessInflammation({
      ...base,
      bmi: 34,
      sleep_hours: 5,
      exercise_days: 0,
      produce_servings: 0,
      oily_fish_servings: 0,
      sugar_servings: 8,
      alcohol_units_week: 30,
      stress_level: 9,
      smoker: true,
      hs_crp_mg_l: 6,
      esr_mm_hr: 45,
    });
    expect(r.inflammation_index).toBeGreaterThan(assessInflammation(base).inflammation_index);
    expect(r.band).toBe('high');
    expect(r.safety_flags).toContain('high_esr');
  });

  it('index stays within 0–100 and never recommends a drug dose', () => {
    const r = assessInflammation(base);
    expect(r.inflammation_index).toBeGreaterThanOrEqual(0);
    expect(r.inflammation_index).toBeLessThanOrEqual(100);
    expect(r.recommendations.join(' ')).not.toMatch(/\b\d+\s?(mg|mcg|iu)\b/i);
  });
});
