import { describe, it, expect } from 'vitest';
import { assessDetoxSupport, type DetoxInput } from './tool-069-detox-optimizer';

const base: DetoxInput = {
  age: 35,
  sex: 'male',
  water_liters: 2.5,
  fiber_g: 30,
  alcohol_units_week: 0,
  sleep_hours: 8,
  exercise_days: 4,
  diet_quality: 4,
  produce_servings: 5,
  smoker: false,
  liver_condition: false,
  kidney_condition: false,
};

describe('tool-069 Detoxification Optimizer', () => {
  it('a supportive lifestyle profile scores in the high band', () => {
    const r = assessDetoxSupport(base);
    expect(r.band).toBe('high');
    expect(r.clinical_review_advised).toBe(false);
    expect(r.clearance_support_index).toBeGreaterThanOrEqual(70);
  });

  it('poor lifestyle lowers the index into a lower band', () => {
    const r = assessDetoxSupport({
      ...base,
      water_liters: 0.5,
      fiber_g: 5,
      alcohol_units_week: 30,
      sleep_hours: 5,
      exercise_days: 0,
      diet_quality: 1,
      produce_servings: 1,
      smoker: true,
    });
    expect(r.clearance_support_index).toBeLessThan(assessDetoxSupport(base).clearance_support_index);
    expect(r.safety_flags).toContain('high_alcohol_intake');
    expect(r.safety_flags).toContain('smoker');
  });

  it('flags known liver/kidney disease and advises clinical review', () => {
    const r = assessDetoxSupport({ ...base, liver_condition: true });
    expect(r.clinical_review_advised).toBe(true);
    expect(r.safety_flags).toContain('liver_condition');
  });

  it('index stays within 0–100 and always carries notices', () => {
    const r = assessDetoxSupport(base);
    expect(r.clearance_support_index).toBeGreaterThanOrEqual(0);
    expect(r.clearance_support_index).toBeLessThanOrEqual(100);
    expect(r.educational_notice.length).toBeGreaterThan(0);
    expect(Array.isArray(r.safety_flags)).toBe(true);
  });

  it('never recommends a chelation, flush or drug dose', () => {
    const text = assessDetoxSupport(base).recommendations.join(' ');
    expect(text).not.toMatch(/\b\d+\s?(mg|mcg|iu|ml)\b/i);
    expect(text.toLowerCase()).not.toContain('chelation therapy');
  });
});
