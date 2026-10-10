import { describe, it, expect } from 'vitest';
import { planMiniPct } from './tool-056-mini-pct-calculator';

describe('tool-056 mini PCT engine', () => {
  it('extends the washout for long 19-nor cycles', () => {
    const r = planMiniPct({ compound_class: '19nor', cycle_weeks: 12, last_dose_days_ago: 0 });
    expect(r.washout_days).toBe(28); // 21 base + 7 long-cycle
    expect(r.pct_duration_days).toBe(42); // 28 + 14 for >12 weeks
    expect(r.start_in_days).toBe(28);
    expect(r.warnings).toContain('long_cycle_extended_washout');
    expect(r.warnings).toContain('educational_not_a_prescription');
  });

  it('uses the short aromatizing window and respects the elapsed days', () => {
    const r = planMiniPct({ compound_class: 'aromatizing', cycle_weeks: 8, last_dose_days_ago: 5 });
    expect(r.washout_days).toBe(14);
    expect(r.pct_duration_days).toBe(28);
    expect(r.start_in_days).toBe(9);
    expect(r.warnings).not.toContain('long_cycle_extended_washout');
  });

  it('opens the window immediately once the washout has already elapsed', () => {
    const r = planMiniPct({ compound_class: 'oral', cycle_weeks: 6, last_dose_days_ago: 10 });
    expect(r.washout_days).toBe(7);
    expect(r.start_in_days).toBe(0);
    expect(r.band).toBe('window-open');
  });
});
