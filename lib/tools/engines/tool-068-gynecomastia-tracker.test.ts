import { describe, it, expect } from 'vitest';
import {
  assessGynecomastia,
  linearSlope,
  type GynecomastiaInput,
} from './tool-068-gynecomastia-tracker';

const stable: GynecomastiaInput = {
  entries: [
    { month: 0, stage: 2, size_mm: 25, tender: false },
    { month: 2, stage: 2, size_mm: 25, tender: false },
    { month: 4, stage: 2, size_mm: 26, tender: false },
  ],
  unilateral: false,
  nipple_discharge: false,
  androgen_exposure: false,
};

describe('tool-068 Gynecomastia Tracker', () => {
  it('reports a flat trend for stable measurements', () => {
    expect(linearSlope([{ x: 0, y: 5 }, { x: 1, y: 5 }])).toBe(0);
    const r = assessGynecomastia(stable);
    expect(r.trend).toBe('stable');
    expect(r.urgent_review_advised).toBe(false);
    expect(r.current_stage).toBe(2);
  });

  it('escalates rapid growth to urgent review', () => {
    const r = assessGynecomastia({
      ...stable,
      entries: [
        { month: 0, stage: 1, size_mm: 15, tender: false },
        { month: 2, stage: 2, size_mm: 35, tender: false },
        { month: 4, stage: 3, size_mm: 60, tender: false },
      ],
    });
    expect(r.trend).toBe('rapid-progression');
    expect(r.urgent_review_advised).toBe(true);
    expect(r.safety_flags).toContain('rapid_growth');
    expect(r.safety_flags).toContain('advanced_stage');
  });

  it('escalates new tenderness and nipple discharge', () => {
    const tender = assessGynecomastia({
      ...stable,
      entries: [
        { month: 0, stage: 2, size_mm: 25, tender: false },
        { month: 2, stage: 2, size_mm: 26, tender: true },
      ],
    });
    expect(tender.safety_flags).toContain('new_tenderness');
    expect(tender.safety_flags).toContain('tender_tissue');
    expect(tender.urgent_review_advised).toBe(true);
    const discharge = assessGynecomastia({ ...stable, nipple_discharge: true });
    expect(discharge.safety_flags).toContain('nipple_discharge');
    expect(discharge.urgent_review_advised).toBe(true);
  });

  it('detects regression', () => {
    const r = assessGynecomastia({
      ...stable,
      entries: [
        { month: 0, stage: 3, size_mm: 50, tender: false },
        { month: 4, stage: 2, size_mm: 30, tender: false },
      ],
    });
    expect(r.trend).toBe('regressing');
    expect(r.size_slope_mm_per_month).toBeLessThan(0);
    expect(r.urgent_review_advised).toBe(false);
  });

  it('flags androgen exposure and never recommends a SERM or dose', () => {
    const r = assessGynecomastia({ ...stable, androgen_exposure: true });
    expect(r.safety_flags).toContain('androgen_exposure');
    expect(r.education.join(' ')).toMatch(/never recommends a SERM/i);
    expect(r.education.join(' ')).not.toMatch(/\b\d+\s?(mg|iu|mcg)\b/i);
  });
});
