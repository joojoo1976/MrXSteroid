import { describe, it, expect } from 'vitest';
import { assessFertility } from './tool-047-fertility-preservation';

describe('tool-047 Fertility Preservation', () => {
  it('young, short exposure, with hCG yields high likelihood', () => {
    const r = assessFertility({ age: 28, suppressive_weeks: 6, used_hcg: true, sperm: null });
    expect(r.likelihood).toBe('high');
    expect(r.urgent_referral).toBe(false);
  });

  it('older, long exposure, no hCG, poor semen analysis yields low likelihood and referral', () => {
    const r = assessFertility({
      age: 44,
      suppressive_weeks: 52,
      used_hcg: false,
      sperm: { concentration_million_ml: 3, motility_pct: 15, morphology_pct: 1 },
    });
    expect(r.likelihood).toBe('low');
    expect(r.urgent_referral).toBe(true);
    expect(r.recommendations.join(' ')).toMatch(/referral|preservation/i);
  });

  it('score is bounded 0–100 and recovery months within 3–24', () => {
    const r = assessFertility({ age: 60, suppressive_weeks: 520, used_hcg: false, sperm: null });
    expect(r.likelihood_score).toBeGreaterThanOrEqual(0);
    expect(r.likelihood_score).toBeLessThanOrEqual(100);
    expect(r.estimated_recovery_months).toBeGreaterThanOrEqual(3);
    expect(r.estimated_recovery_months).toBeLessThanOrEqual(24);
  });

  it('longer suppression never increases the likelihood score', () => {
    const short = assessFertility({ age: 30, suppressive_weeks: 4, used_hcg: false, sperm: null });
    const long = assessFertility({ age: 30, suppressive_weeks: 40, used_hcg: false, sperm: null });
    expect(long.likelihood_score).toBeLessThanOrEqual(short.likelihood_score);
  });

  it('does not recommend drug doses', () => {
    const r = assessFertility({ age: 35, suppressive_weeks: 12, used_hcg: false, sperm: null });
    expect(r.recommendations.join(' ')).not.toMatch(/\b\d+\s?(mg|iu)\b/i);
  });
});
