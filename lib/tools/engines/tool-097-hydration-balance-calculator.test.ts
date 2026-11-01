import { describe, expect, it } from 'vitest';
import { calculateHydrationBalance, type HydrationBalanceCalculatorInput } from './tool-097-hydration-balance-calculator';

const MEASUREMENTS: HydrationBalanceCalculatorInput = {
  pre_exercise_body_weight_kg: 75,
  post_exercise_body_weight_kg: 74.2,
  fluid_consumed_liters: 0.5,
  urine_output_liters: 0.1,
  exercise_duration_minutes: 60,
};

describe('Tool #097 — measured exercise sweat-rate arithmetic', () => {
  it('calculates sweat loss and rate from the documented field equation', () => {
    expect(calculateHydrationBalance(MEASUREMENTS)).toEqual({
      status: 'CALCULATED',
      resultType: 'CALCULATED',
      sweat_loss_liters: 1.2,
      sweat_rate_liters_per_hour: 1.2,
      exercise_duration_hours: 1,
    });
  });

  it('normalizes the result by a half-hour exercise duration', () => {
    expect(calculateHydrationBalance({ ...MEASUREMENTS, exercise_duration_minutes: 30 })).toMatchObject({
      sweat_loss_liters: 1.2,
      sweat_rate_liters_per_hour: 2.4,
      exercise_duration_hours: 0.5,
    });
  });

  it('accepts explicit zero fluid and urine values', () => {
    expect(calculateHydrationBalance({
      ...MEASUREMENTS,
      post_exercise_body_weight_kg: 74,
      fluid_consumed_liters: 0,
      urine_output_liters: 0,
    })).toMatchObject({ status: 'CALCULATED', sweat_loss_liters: 1, sweat_rate_liters_per_hour: 1 });
  });

  it('returns a mathematical zero when the entered measurements yield zero loss', () => {
    expect(calculateHydrationBalance({
      ...MEASUREMENTS,
      post_exercise_body_weight_kg: 75.4,
      fluid_consumed_liters: 0.5,
      urine_output_liters: 0.1,
    })).toMatchObject({ status: 'CALCULATED', sweat_loss_liters: 0, sweat_rate_liters_per_hour: 0 });
  });

  it('does not produce a negative sweat rate for inconsistent measurements', () => {
    expect(calculateHydrationBalance({
      ...MEASUREMENTS,
      post_exercise_body_weight_kg: 76,
      fluid_consumed_liters: 0,
      urine_output_liters: 0.2,
    })).toEqual({ status: 'NOT_AVAILABLE', reason: 'NEGATIVE_SWEAT_LOSS' });
  });

  it.each([
    ['zero pre-exercise mass', { pre_exercise_body_weight_kg: 0 }],
    ['negative post-exercise mass', { post_exercise_body_weight_kg: -1 }],
    ['NaN fluid volume', { fluid_consumed_liters: Number.NaN }],
    ['infinite urine volume', { urine_output_liters: Number.POSITIVE_INFINITY }],
    ['zero duration', { exercise_duration_minutes: 0 }],
    ['fractional minute duration', { exercise_duration_minutes: 1.5 }],
    ['unrecognized input field', { unrecognized: true }],
  ] as const)('rejects %s', (_name, overrides) => {
    expect(() => calculateHydrationBalance({ ...MEASUREMENTS, ...overrides } as HydrationBalanceCalculatorInput)).toThrow();
  });

  it('applies the same deterministic result to repeated calls', () => {
    expect(calculateHydrationBalance(MEASUREMENTS)).toEqual(calculateHydrationBalance(MEASUREMENTS));
  });
});
