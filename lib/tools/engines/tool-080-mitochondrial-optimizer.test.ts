import { describe, it, expect } from 'vitest';
import {
  assessMitochondrialHealth,
  type MitochondrialInput,
} from './tool-080-mitochondrial-optimizer';

const base: MitochondrialInput = {
  age: 35,
  exercise_days: 4,
  sleep_hours: 8,
  diet_diversity: 4,
  cold_exposure_days: 2,
  heat_exposure_days: 2,
  stress_level: 3,
  smoker: false,
  cardiovascular_disease: false,
};

describe('tool-080 Mitochondrial Optimizer', () => {
  it('a supportive profile scores in the high band', () => {
    const r = assessMitochondrialHealth(base);
    expect(r.band).toBe('high');
  });

  it('poor lifestyle lowers the index', () => {
    const r = assessMitochondrialHealth({
      ...base,
      age: 65,
      exercise_days: 0,
      sleep_hours: 5,
      diet_diversity: 1,
      cold_exposure_days: 0,
      heat_exposure_days: 0,
      stress_level: 9,
      smoker: true,
    });
    expect(r.mitochondrial_health_index).toBeLessThan(assessMitochondrialHealth(base).mitochondrial_health_index);
    expect(r.safety_flags).toContain('smoker');
  });

  it('flags thermal-exposure caution with cardiovascular disease', () => {
    const r = assessMitochondrialHealth({ ...base, cardiovascular_disease: true });
    expect(r.safety_flags).toContain('thermal_caution_cvd');
  });

  it('index stays within 0–100 and never recommends a supplement dose', () => {
    const r = assessMitochondrialHealth(base);
    expect(r.mitochondrial_health_index).toBeGreaterThanOrEqual(0);
    expect(r.mitochondrial_health_index).toBeLessThanOrEqual(100);
    expect(r.recommendations.join(' ')).not.toMatch(/\b\d+\s?(mg|mcg|iu)\b/i);
  });
});
