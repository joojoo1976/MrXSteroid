import { describe, it, expect } from 'vitest';
import { monitorHematocrit } from './tool-041-hematocrit-monitor';

describe('tool-041 hematocrit monitor engine', () => {
  it('rises through bands and projects the intervention-line crossing', () => {
    const r = monitorHematocrit({
      readings: [
        { hct_pct: 46, date: '2026-01-01' },
        { hct_pct: 49, date: '2026-02-01' },
        { hct_pct: 52, date: '2026-03-01' },
      ],
      sex: 'male',
      on_cycle: true,
      weeks_remaining: 8,
    });
    expect(r.latest_hct_pct).toBe(52);
    expect(r.baseline_hct_pct).toBe(46);
    expect(r.band).toBe('borderline'); // 52 == upper+2 boundary -> borderline, not high
    expect(r.slope_per_30d).toBeCloseTo(3.05, 1); // least squares over 31/59-day spacing
    expect(r.projected_threshold_date).not.toBeNull();
    expect(r.warnings).toContain('on_cycle_elevated_hct');
  });

  it('flat normal male labs stay normal and non-donation-eligible', () => {
    const r = monitorHematocrit({
      readings: [
        { hct_pct: 45, date: '2026-01-01' },
        { hct_pct: 45.4, date: '2026-03-01' },
      ],
      sex: 'male',
      on_cycle: false,
      weeks_remaining: 0,
    });
    expect(r.band).toBe('normal');
    expect(r.donate_eligible).toBe(false);
    expect(r.projected_threshold_date).toBeNull();
    expect(r.slope_per_30d).toBeCloseTo(0.2, 1);
  });

  it('very-high female reading triggers the physician warning', () => {
    const r = monitorHematocrit({
      readings: [
        { hct_pct: 46, date: '2026-01-01' },
        { hct_pct: 49, date: '2026-03-01' },
      ],
      sex: 'female',
      on_cycle: true,
      weeks_remaining: 4,
    });
    expect(r.band).toBe('very-high');
    expect(r.warnings).toContain('above_intervention_line_seek_physician');
    expect(r.donate_eligible).toBe(true);
  });
});
