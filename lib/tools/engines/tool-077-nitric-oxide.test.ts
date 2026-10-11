import { describe, it, expect } from 'vitest';
import {
  assessNitricOxide,
  EMERGENCY_MESSAGE,
  type NitricOxideInput,
} from './tool-077-nitric-oxide';

const base: NitricOxideInput = {
  age: 35,
  leafy_green_servings: 3,
  beetroot_servings: 3,
  nitrate_rich_veg: true,
  exercise_days: 5,
  sleep_hours: 8,
  arginine_rich_foods: true,
  mouthwash_use: false,
  smoker: false,
  chest_pain: false,
  breathing_difficulty: false,
};

describe('tool-077 Nitric Oxide Optimizer', () => {
  it('a supportive profile scores in the high band', () => {
    const r = assessNitricOxide(base);
    expect(r.band).toBe('high');
    expect(r.emergency).toBe(false);
    expect(r.emergency_message).toBeNull();
  });

  it('poor inputs lower the index', () => {
    const r = assessNitricOxide({
      ...base,
      leafy_green_servings: 0,
      beetroot_servings: 0,
      nitrate_rich_veg: false,
      exercise_days: 0,
      sleep_hours: 5,
      arginine_rich_foods: false,
      mouthwash_use: true,
      smoker: true,
      age: 65,
    });
    expect(r.no_support_index).toBeLessThan(assessNitricOxide(base).no_support_index);
    expect(r.safety_flags).toContain('smoker');
  });

  it('escalates chest pain and breathing difficulty', () => {
    const r = assessNitricOxide({ ...base, chest_pain: true });
    expect(r.emergency).toBe(true);
    expect(r.emergency_message).toBe(EMERGENCY_MESSAGE);
    expect(r.safety_flags).toContain('cardiac_red_flag');
  });

  it('index stays within 0–100 and never recommends a supplement dose', () => {
    const r = assessNitricOxide(base);
    expect(r.no_support_index).toBeGreaterThanOrEqual(0);
    expect(r.no_support_index).toBeLessThanOrEqual(100);
    expect(r.recommendations.join(' ')).not.toMatch(/\b\d+\s?(g|mg|mcg|iu)\b/i);
  });
});
