/** Tool #034 — deterministic single-exponential fraction arithmetic tests. */
import { describe, it, expect } from 'vitest';
import { calculateCompoundClearance } from './tool-034-compound-clearance';
import { ClearanceInputSchema, ClearanceResultSchema } from '../schemas/tool-034-compound-clearance';

const base = {
  compound_name: 'User scenario',
  half_life_days: 4.5,
  half_life_source: 'User-entered source title / URL',
  last_dose_date: '2026-01-01',
  as_of_date: '2026-01-31',
  threshold_fraction: 0.01,
};

describe('tool-034 single-dose fractional-decay engine', () => {
  it('computes the model threshold time, modeled fraction, and dates deterministically', () => {
    expect(ClearanceInputSchema.safeParse(base).success).toBe(true);
    const result = calculateCompoundClearance(base);
    expect(ClearanceResultSchema.safeParse(result).success).toBe(true);
    expect(result.days_to_threshold).toBe(30);
    expect(result.threshold_date).toBe('2026-01-31');
    expect(result.days_elapsed).toBe(30);
    expect(result.modeled_remaining_percent).toBe(0.98);
    expect(result.threshold_reached).toBe(true);
    expect(result.curve[0]).toEqual({ days_after_last_dose: 0, date: '2026-01-01', remaining_percent: 100 });
    expect(result.model_note).toContain('not a medical clearance');
    expect(result).toEqual(calculateCompoundClearance(base));
  });

  it('keeps the date status false before the selected model threshold', () => {
    const result = calculateCompoundClearance({ ...base, as_of_date: '2026-01-10' });
    expect(result.days_elapsed).toBe(9);
    expect(result.modeled_remaining_percent).toBeGreaterThan(1);
    expect(result.threshold_reached).toBe(false);
  });

  it('uses the explicit user-selected threshold, not a hidden medical cutoff', () => {
    const result = calculateCompoundClearance({ ...base, threshold_fraction: 0.2 });
    expect(result.threshold_fraction).toBe(0.2);
    expect(result.days_to_threshold).toBe(Math.ceil(4.5 * Math.log2(5)));
    expect(result.days_to_threshold).toBeLessThan(30);
  });

  it('handles long supported half-lives and produces a bounded curve', () => {
    const input = { ...base, half_life_days: 365, threshold_fraction: 0.001, as_of_date: '2026-01-01' };
    expect(ClearanceInputSchema.safeParse(input).success).toBe(true);
    const result = calculateCompoundClearance(input);
    expect(result.days_to_threshold).toBeGreaterThan(3000);
    expect(result.curve.length).toBeLessThanOrEqual(8);
    expect(ClearanceResultSchema.safeParse(result).success).toBe(true);
  });

  it('rejects invalid, missing, or malformed inputs instead of substituting values', () => {
    expect(ClearanceInputSchema.safeParse({ ...base, half_life_source: '' }).success).toBe(false);
    expect(ClearanceInputSchema.safeParse({ ...base, half_life_days: Number.NaN }).success).toBe(false);
    expect(ClearanceInputSchema.safeParse({ ...base, half_life_days: 0 }).success).toBe(false);
    expect(ClearanceInputSchema.safeParse({ ...base, threshold_fraction: 0.9 }).success).toBe(false);
    expect(ClearanceInputSchema.safeParse({ ...base, as_of_date: '2026-02-30' }).success).toBe(false);
    expect(ClearanceInputSchema.safeParse({ ...base, last_dose_date: '9999-12-31' }).success).toBe(false);
    expect(ClearanceInputSchema.safeParse({ ...base, half_life_days: 365, threshold_fraction: 0.2, last_dose_date: '9997-01-01', as_of_date: '9997-01-01' }).success).toBe(false);
    expect(ClearanceInputSchema.safeParse({ ...base, as_of_date: '2025-12-31' }).success).toBe(false);
    expect(() => calculateCompoundClearance({ ...base, half_life_source: '  ' })).toThrow(/half_life_source/);
  });
});
