import { describe, it, expect } from 'vitest';
import { analyzeGlucose, estimatedA1c } from './tool-054-glucose-tracker';

const mk = (...values: number[]) => values.map((v, i) => ({ value: v, at: `2026-01-0${i + 1}T08:00:00Z` }));

describe('tool-054 Glucose Tracker', () => {
  it('computes mean/min/max/std and time-in-range', () => {
    const r = analyzeGlucose({ readings: mk(100, 120, 200) });
    expect(r.count).toBe(3);
    expect(r.mean_mg_dl).toBeCloseTo(140, 0);
    expect(r.min_mg_dl).toBe(100);
    expect(r.max_mg_dl).toBe(200);
    expect(r.time_in_range_pct).toBeCloseTo(66.7, 0);
  });

  it('estimated A1c follows the ADAG-derived formula', () => {
    expect(estimatedA1c(154)).toBeCloseTo(7.0, 1);
    expect(estimatedA1c(100)).toBeCloseTo(5.1, 1);
  });

  it('escalates severe hypoglycaemia', () => {
    const r = analyzeGlucose({ readings: mk(50, 100) });
    expect(r.emergency).toBe(true);
    expect(r.emergency_message).toMatch(/hypoglycaemic/i);
  });

  it('handles empty readings without throwing', () => {
    const r = analyzeGlucose({ readings: [] });
    expect(r.count).toBe(0);
    expect(r.emergency).toBe(false);
  });
});
