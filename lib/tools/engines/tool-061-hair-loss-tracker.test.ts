import { describe, it, expect } from 'vitest';
import { trackHairLoss } from './tool-061-hair-loss-tracker';

describe('tool-061 hair loss tracker engine', () => {
  it('classifies a stable shed inside the documented band', () => {
    const r = trackHairLoss({ norwood_stage: 2, weekly_shed_counts: [30, 40, 50], on_5ari: false, weeks_since_start: 8 });
    expect(r.avg_weekly_shed).toBe(40);
    expect(r.trend_band).toBe('stable');
    expect(r.stage_band).toBe('minimal');
    expect(r.warnings).toEqual(['educational_tracking_not_diagnosis']);
  });

  it('notes transient shedding while on a 5-ARI at monitor level', () => {
    const r = trackHairLoss({ norwood_stage: 4, weekly_shed_counts: [80, 90, 100], on_5ari: true, weeks_since_start: 10 });
    expect(r.avg_weekly_shed).toBe(90);
    expect(r.trend_band).toBe('monitor');
    expect(r.stage_band).toBe('moderate');
    expect(r.warnings).toContain('5ari_shedding_can_be_transient');
  });

  it('flags accelerated shedding above 100 with a dermatology referral', () => {
    const r = trackHairLoss({ norwood_stage: 6, weekly_shed_counts: [150, 160, 170], on_5ari: false, weeks_since_start: 4 });
    expect(r.avg_weekly_shed).toBe(160);
    expect(r.trend_band).toBe('accelerated');
    expect(r.stage_band).toBe('advanced');
    expect(r.warnings).toContain('accelerated_shedding_see_dermatologist');
    expect(r.warnings).toContain('advanced_stage_dermatology_referral');
  });
});
