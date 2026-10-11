import { describe, it, expect } from 'vitest';
import { assessFatMetabolism, type FatMetabolismInput } from './tool-079-fat-metabolism';

const base: FatMetabolismInput = {
  age: 35,
  cardio_days: 4,
  resistance_days: 3,
  daily_steps: 10000,
  carb_grams: 200,
  protein_adequacy: 4,
  body_fat_pct: 18,
  fasting_hours: 12,
};

describe('tool-079 Fat Metabolism', () => {
  it('a supportive profile scores in the high band', () => {
    const r = assessFatMetabolism(base);
    expect(r.band).toBe('high');
  });

  it('a sedentary high-carb profile scores lower', () => {
    const r = assessFatMetabolism({
      ...base,
      age: 62,
      cardio_days: 0,
      resistance_days: 0,
      daily_steps: 2000,
      carb_grams: 600,
      protein_adequacy: 1,
      body_fat_pct: 36,
      fasting_hours: 22,
    });
    expect(r.fat_oxidation_index).toBeLessThan(assessFatMetabolism(base).fat_oxidation_index);
    expect(r.safety_flags).toContain('prolonged_fasting');
  });

  it('flags very low body fat', () => {
    const r = assessFatMetabolism({ ...base, body_fat_pct: 5 });
    expect(r.safety_flags).toContain('very_low_body_fat');
  });

  it('index stays within 0–100 and never recommends a supplement dose', () => {
    const r = assessFatMetabolism(base);
    expect(r.fat_oxidation_index).toBeGreaterThanOrEqual(0);
    expect(r.fat_oxidation_index).toBeLessThanOrEqual(100);
    expect(r.recommendations.join(' ')).not.toMatch(/\b\d+\s?(mg|mcg|iu)\b/i);
  });
});
