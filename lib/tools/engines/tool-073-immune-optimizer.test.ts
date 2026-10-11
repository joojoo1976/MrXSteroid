import { describe, it, expect } from 'vitest';
import {
  assessImmuneSupport,
  EMERGENCY_MESSAGE,
  type ImmuneInput,
} from './tool-073-immune-optimizer';

const base: ImmuneInput = {
  age: 35,
  sleep_hours: 8,
  protein_adequacy: 4,
  produce_servings: 5,
  exercise_days: 4,
  stress_level: 3,
  alcohol_units_week: 2,
  smoker: false,
  vitamin_d_deficiency: false,
  recurrent_infections: false,
  fever_breathing_difficulty: false,
};

describe('tool-073 Immune System Optimizer', () => {
  it('a supportive profile scores in the high band', () => {
    const r = assessImmuneSupport(base);
    expect(r.band).toBe('high');
    expect(r.emergency).toBe(false);
    expect(r.emergency_message).toBeNull();
  });

  it('poor lifestyle lowers the index', () => {
    const r = assessImmuneSupport({
      ...base,
      sleep_hours: 5,
      protein_adequacy: 1,
      produce_servings: 0,
      exercise_days: 0,
      stress_level: 9,
      alcohol_units_week: 30,
      smoker: true,
      vitamin_d_deficiency: true,
      recurrent_infections: true,
    });
    expect(r.immune_support_index).toBeLessThan(assessImmuneSupport(base).immune_support_index);
    expect(r.band).toBe('low');
    expect(r.safety_flags).toContain('recurrent_infections');
  });

  it('escalates fever with breathing difficulty to emergency care', () => {
    const r = assessImmuneSupport({ ...base, fever_breathing_difficulty: true });
    expect(r.emergency).toBe(true);
    expect(r.emergency_message).toBe(EMERGENCY_MESSAGE);
    expect(r.safety_flags).toContain('immune_red_flag');
  });

  it('index stays within 0–100 and never recommends a supplement dose', () => {
    const r = assessImmuneSupport(base);
    expect(r.immune_support_index).toBeGreaterThanOrEqual(0);
    expect(r.immune_support_index).toBeLessThanOrEqual(100);
    expect(r.recommendations.join(' ')).not.toMatch(/\b\d+\s?(mg|mcg|iu)\b/i);
  });
});
