import { describe, it, expect } from 'vitest';
import { assessHairLoss, linearSlope, type HairLossInput } from './tool-061-hair-loss-tracker';

const stable: HairLossInput = {
  entries: [
    { month: 0, density_score: 80 },
    { month: 3, density_score: 80 },
    { month: 6, density_score: 79 },
  ],
  norwood_stage: 2,
  daily_shed_strands: 50,
  recent_stressor: false,
  scalp_inflammation: false,
};

describe('tool-061 Hair Loss Tracker', () => {
  it('computes a flat least-squares slope for stable data', () => {
    expect(linearSlope([{ x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 }])).toBe(0);
    const r = assessHairLoss(stable);
    expect(r.trend).toBe('stable');
    expect(r.clinical_review_advised).toBe(false);
  });

  it('detects improving density', () => {
    const r = assessHairLoss({
      ...stable,
      entries: [
        { month: 0, density_score: 60 },
        { month: 3, density_score: 65 },
        { month: 6, density_score: 72 },
      ],
    });
    expect(r.slope_per_month).toBeGreaterThan(0.5);
    expect(r.trend).toBe('improving');
    expect(r.percent_change).toBeGreaterThan(0);
  });

  it('escalates rapid progression to clinical review', () => {
    const r = assessHairLoss({
      ...stable,
      entries: [
        { month: 0, density_score: 90 },
        { month: 2, density_score: 70 },
        { month: 4, density_score: 60 },
      ],
    });
    expect(r.trend).toBe('rapid-progression');
    expect(r.clinical_review_advised).toBe(true);
    expect(r.safety_flags).toContain('rapid_progression');
  });

  it('flags unexplained heavy shedding and scalp inflammation', () => {
    const r = assessHairLoss({ ...stable, daily_shed_strands: 200, scalp_inflammation: true });
    expect(r.safety_flags).toContain('high_unexplained_shedding');
    expect(r.safety_flags).toContain('scalp_inflammation');
    expect(r.clinical_review_advised).toBe(true);
  });

  it('is deterministic and never recommends a treatment dose', () => {
    expect(assessHairLoss(stable)).toEqual(assessHairLoss(stable));
    expect(assessHairLoss(stable).education.join(' ')).not.toMatch(/\b\d+\s?(mg|ml|%)\b/i);
  });
});
