/**
 * Tool #034 — Compound Clearance Calculator: engine + schema verification.
 * Proves exponential-decay math, clearance dates and the residual curve.
 */
import { describe, it, expect } from 'vitest';
import { calculateCompoundClearance } from './tool-034-compound-clearance';
import { ClearanceInputSchema, ClearanceResultSchema } from '../schemas/tool-034-compound-clearance';

describe('tool-034 clearance engine', () => {
  it('clears a past dose and reports the residual curve', () => {
    const input = {
      compound_name: 'Testosterone Enanthate',
      half_life_days: 4.5,
      last_dose_mg: 250,
      last_dose_date: '2020-01-01',
    };
    expect(ClearanceInputSchema.safeParse(input).success).toBe(true);
    const r = calculateCompoundClearance(input);
    expect(ClearanceResultSchema.safeParse(r).success).toBe(true);
    // 4.5 * log2(100) = 4.5*6.6439 = 29.9 -> 30 days
    expect(r.days_to_clear).toBe(30);
    expect(r.already_clear).toBe(true);
    expect(r.current_remaining_percent).toBeLessThan(1);
    expect(r.curve.length).toBeGreaterThan(0);
    expect(r.curve[0].days_after_last_dose).toBe(0);
    expect(r.curve[0].remaining_mg).toBe(250);
    expect(r.note).toContain('Testosterone Enanthate');
  });

  it('tracks a recent dose as not yet cleared', () => {
    const today = new Date().toISOString().slice(0, 10);
    const r = calculateCompoundClearance({
      compound_name: 'Nandrolone Decanoate',
      half_life_days: 7.5,
      last_dose_mg: 400,
      last_dose_date: today,
    });
    expect(r.already_clear).toBe(false);
    expect(r.days_to_clear).toBe(Math.ceil(7.5 * (Math.log(100) / Math.log(2))));
    expect(r.clearance_date.length).toBe(10);
  });

  it('rejects invalid input through the schema', () => {
    expect(
      ClearanceInputSchema.safeParse({
        compound_name: 'X',
        half_life_days: 0,
        last_dose_mg: 250,
        last_dose_date: '2026-01-01',
      }).success,
    ).toBe(false);
  });
});
