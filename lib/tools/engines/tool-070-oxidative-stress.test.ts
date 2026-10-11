import { describe, it, expect } from 'vitest';
import { assessOxidativeStress, type OxidativeStressInput } from './tool-070-oxidative-stress';

const base: OxidativeStressInput = {
  age: 35,
  cigarettes_per_day: 0,
  alcohol_units_week: 2,
  exercise_days: 4,
  sleep_hours: 8,
  produce_servings: 6,
  processed_food_servings: 1,
  stress_level: 3,
  pollution_exposure: false,
  excessive_uv: false,
};

describe('tool-070 Oxidative Stress', () => {
  it('a healthy lifestyle profile scores in the low band', () => {
    const r = assessOxidativeStress(base);
    expect(r.band).toBe('low');
    expect(r.clinical_review_advised).toBe(false);
  });

  it('a high-load profile scores higher and in the high band', () => {
    const r = assessOxidativeStress({
      ...base,
      age: 65,
      cigarettes_per_day: 25,
      alcohol_units_week: 35,
      exercise_days: 0,
      sleep_hours: 5,
      produce_servings: 0,
      processed_food_servings: 8,
      stress_level: 9,
      pollution_exposure: true,
      excessive_uv: true,
    });
    expect(r.oxidative_stress_index).toBeGreaterThan(assessOxidativeStress(base).oxidative_stress_index);
    expect(r.band).toBe('high');
    expect(r.clinical_review_advised).toBe(true);
    expect(r.safety_flags).toContain('smoker');
  });

  it('index stays within 0–100 and carries notices', () => {
    const r = assessOxidativeStress(base);
    expect(r.oxidative_stress_index).toBeGreaterThanOrEqual(0);
    expect(r.oxidative_stress_index).toBeLessThanOrEqual(100);
    expect(r.educational_notice.length).toBeGreaterThan(0);
  });

  it('never recommends an antioxidant dose', () => {
    const text = assessOxidativeStress(base).recommendations.join(' ');
    expect(text).not.toMatch(/\b\d+\s?(iu|mg|mcg)\b/i);
  });
});
