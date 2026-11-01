import { describe, expect, it } from 'vitest';
import { CalorieInputSchema } from '../schemas/tool-012-calorie-adjuster';
import { buildCalorieAdjusterOutput } from '../adapters/tool-012-calorie-adjuster';
import { calculateTDEE, type CalorieInput } from './tool-012-calorie-adjuster';

const maleInput: CalorieInput = {
  age: 25,
  gender: 'male',
  height_cm: 180,
  current_weight_kg: 85,
  activity_level: 'moderate',
  goal: 'bulk',
  weeks_per_phase: 8,
};

describe('Tool 012 calorie estimate engine', () => {
  it('preserves the existing Mifflin-St Jeor, activity and fixed goal-offset arithmetic', () => {
    const result = calculateTDEE(maleInput);
    expect(result.tdee).toBe(2875);
    expect(result.tdee_range).toEqual([2775, 2975]);
    expect(result.maintenance_calories).toBe(2875);
    expect(result.target_calories).toBe(3375);
    expect(result.weekly_adjustment).toBe(500);
    expect(result.phase_duration_weeks).toBe(8);
  });

  it('uses the female constant and cut offset without changing the equation', () => {
    const result = calculateTDEE({ ...maleInput, age: 30, gender: 'female', height_cm: 165, current_weight_kg: 60, goal: 'cut' });
    expect(result.tdee).toBe(2046);
    expect(result.target_calories).toBe(1546);
    expect(result.weekly_adjustment).toBe(-500);
  });

  it('keeps maintenance at the calculated TDEE', () => {
    const result = calculateTDEE({ ...maleInput, goal: 'maintain' });
    expect(result.target_calories).toBe(result.tdee);
    expect(result.weekly_adjustment).toBe(0);
  });

  it.each([
    ['NaN age', { ...maleInput, age: Number.NaN }],
    ['age below studied adult range', { ...maleInput, age: 18 }],
    ['age above studied adult range', { ...maleInput, age: 79 }],
    ['infinite weight', { ...maleInput, current_weight_kg: Number.POSITIVE_INFINITY }],
    ['weight below supported range', { ...maleInput, current_weight_kg: 0 }],
    ['height above supported range', { ...maleInput, height_cm: 251 }],
    ['fractional age', { ...maleInput, age: 25.5 }],
    ['duration outside supported range', { ...maleInput, weeks_per_phase: 53 }],
  ])('rejects %s', (_case, input) => {
    expect(CalorieInputSchema.safeParse(input).success).toBe(false);
    expect(() => calculateTDEE(input as CalorieInput)).toThrow();
  });

  it('publishes result values and model assumptions without exposing recommendation strings', () => {
    const result = calculateTDEE(maleInput);
    const output = buildCalorieAdjusterOutput(maleInput, result, {
      locale: 'en', unitSystem: 'metric', snapshotType: 'draft',
      calculatedAt: '2026-10-25T12:00:00.000Z', recordedAt: '2026-10-25T12:00:00.000Z', timezone: 'UTC',
    });

    expect(output.toolSlug).toBe('tool-012-calorie-adjuster');
    expect(output.provenance.confidence).toBeNull();
    expect(output.provenance.measurementMethod).toContain('fixed goal offset');
    expect(output.keyFindings.map((finding) => finding.code)).toContain('FIXED_GOAL_OFFSET');
    expect(JSON.stringify(output.keyFindings)).not.toContain(result.recommendations[0]);
  });
});
