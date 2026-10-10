import { describe, it, expect } from 'vitest';
import { manageEstrogen } from './tool-042-estrogen-management';

describe('tool-042 estrogen management engine', () => {
  it('high E2 on existing AI suggests +0.5 mg/wk with prescriber guard', () => {
    const r = manageEstrogen({
      e2_pg_ml: 65, weekly_testosterone_mg: 500, taking_ai: true, weekly_ai_dose_mg: 1,
      symptoms: [], body_fat_pct: 18,
    });
    expect(r.band).toBe('high');
    expect(r.ai_delta_mg).toBe(0.5);
    expect(r.action).toBe('adjust_ai');
  });

  it('high E2 WITHOUT an AI never starts one — flags the prescriber boundary', () => {
    const r = manageEstrogen({
      e2_pg_ml: 65, weekly_testosterone_mg: 500, taking_ai: false, weekly_ai_dose_mg: 0,
      symptoms: [], body_fat_pct: 20,
    });
    expect(r.band).toBe('high');
    expect(r.ai_delta_mg).toBe(0);
    expect(r.action).toBe('reduce_test');
    expect(r.warnings).toContain('elevated_e2_without_ai_discuss_with_prescriber');
  });

  it('low E2 on an AI suggests tapering the dose by one step', () => {
    const r = manageEstrogen({
      e2_pg_ml: 8, weekly_testosterone_mg: 300, taking_ai: true, weekly_ai_dose_mg: 0.5,
      symptoms: ['low_libido'], body_fat_pct: 15,
    });
    expect(r.band).toBe('low');
    expect(r.ai_delta_mg).toBe(-0.25);
    expect(r.action).toBe('adjust_ai');
    expect(r.warnings).toContain('ai_may_be_overshooting');
  });

  it('symptom load escalates an in-range lab', () => {
    const r = manageEstrogen({
      e2_pg_ml: 30, weekly_testosterone_mg: 500, taking_ai: false, weekly_ai_dose_mg: 0,
      symptoms: ['nipple_sensitivity', 'water_retention'], body_fat_pct: 20,
    });
    expect(r.band).toBe('elevated');
    expect(r.action).toBe('monitor');
  });
});
