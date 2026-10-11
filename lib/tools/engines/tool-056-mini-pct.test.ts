import { describe, it, expect } from 'vitest';
import { planMiniPct } from './tool-056-mini-pct';

describe('tool-056 Mini PCT timing', () => {
  it('washout is 5 half-lives', () => {
    const r = planMiniPct({
      last_injection_iso: '2026-01-01T00:00:00Z', longest_half_life_days: 5,
      cycle_weeks: 8, age: 30, used_hcg: true,
    });
    expect(r.washout_days).toBe(25);
  });

  it('computes a start window after washout', () => {
    const r = planMiniPct({
      last_injection_iso: '2026-01-01T00:00:00Z', longest_half_life_days: 5,
      cycle_weeks: 8, age: 30, used_hcg: true,
    });
    expect(r.pct_start_earliest_iso).toBe('2026-01-26');
    expect(r.pct_start_latest_iso).toBe('2026-02-02');
  });

  it('flags long cycles and age', () => {
    const r = planMiniPct({
      last_injection_iso: '2026-01-01T00:00:00Z', longest_half_life_days: 7,
      cycle_weeks: 16, age: 45, used_hcg: false,
    });
    expect(r.safety_flags.join(' ')).toMatch(/12 weeks|Age/i);
  });

  it('never prescribes SERM doses', () => {
    const r = planMiniPct({
      last_injection_iso: '2026-01-01T00:00:00Z', longest_half_life_days: 5,
      cycle_weeks: 8, age: 30, used_hcg: true,
    });
    expect(r.educational_notice).toMatch(/does not prescribe/i);
    expect(r.monitoring.join(' ')).not.toMatch(/\d+\s?mg/i);
  });
});
