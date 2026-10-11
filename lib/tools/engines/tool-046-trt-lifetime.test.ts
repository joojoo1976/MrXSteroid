import { describe, it, expect } from 'vitest';
import {
  calculateTrtLifetime,
  TRT_ESTER_PROFILES,
  type TrtLifetimeInput,
} from './tool-046-trt-lifetime';

const base: TrtLifetimeInput = {
  weekly_dose_mg: 100,
  ester: 'cypionate',
  injection_interval_days: 7,
  planned_years: 5,
  age: 45,
  baseline_hematocrit_pct: 45,
  cardiovascular_risk_factors: 0,
};

describe('tool-046 TRT Lifetime', () => {
  it('computes a deterministic accumulation ratio consistent with the half-life', () => {
    const r = calculateTrtLifetime(base);
    const hl = TRT_ESTER_PROFILES.cypionate.halfLifeDays;
    const expectedAcc = 1 / (1 - Math.pow(2, -7 / hl));
    expect(r.accumulation_ratio).toBeCloseTo(expectedAcc, 2);
    expect(r.trough_fraction).toBeCloseTo(Math.pow(2, -7 / hl), 3);
  });

  it('weekly active mg applies the ester active fraction', () => {
    const r = calculateTrtLifetime(base);
    expect(r.weekly_active_mg).toBeCloseTo(100 * TRT_ESTER_PROFILES.cypionate.activeFraction, 1);
  });

  it('higher dose increases cumulative exposure and projected hematocrit', () => {
    const low = calculateTrtLifetime({ ...base, weekly_dose_mg: 70 });
    const high = calculateTrtLifetime({ ...base, weekly_dose_mg: 200 });
    expect(high.cumulative_active_g).toBeGreaterThan(low.cumulative_active_g);
    expect(high.projected_hematocrit_pct).toBeGreaterThan(low.projected_hematocrit_pct);
  });

  it('flags erythrocytosis risk when projected hematocrit >= 54%', () => {
    const r = calculateTrtLifetime({ ...base, weekly_dose_mg: 300, planned_years: 10, baseline_hematocrit_pct: 50 });
    expect(r.projected_hematocrit_pct).toBeGreaterThanOrEqual(54);
    expect(r.safety_flags.join(' ')).toMatch(/erythrocytosis/i);
  });

  it('never returns a dose prescription and always carries the educational notice', () => {
    const r = calculateTrtLifetime(base);
    expect(r.educational_notice).toMatch(/educational/i);
    expect(r.safety_flags.join(' ')).not.toMatch(/inject \d|take \d+ ?mg/i);
  });

  it('is monotonic in duration for cumulative exposure', () => {
    const y1 = calculateTrtLifetime({ ...base, planned_years: 1 });
    const y10 = calculateTrtLifetime({ ...base, planned_years: 10 });
    expect(y10.cumulative_active_g).toBeGreaterThan(y1.cumulative_active_g);
  });
});
