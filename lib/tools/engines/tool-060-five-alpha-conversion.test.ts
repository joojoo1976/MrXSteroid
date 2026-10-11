import { describe, it, expect } from 'vitest';
import { assessFiveAlphaConversion, type FiveAlphaInput } from './tool-060-five-alpha-conversion';

const base: FiveAlphaInput = {
  total_testosterone_ng_dl: 600,
  age: 30,
  body_fat_pct: 15,
  scalp_sensitivity: 5,
  mpb_family_history: false,
  sebum_activity: 0,
};

describe('tool-060 5-Alpha Conversion', () => {
  it('produces a bounded activity index and a plausible DHT estimate', () => {
    const r = assessFiveAlphaConversion(base);
    expect(r.five_ar_activity_index).toBeGreaterThanOrEqual(0);
    expect(r.five_ar_activity_index).toBeLessThanOrEqual(100);
    expect(r.estimated_dht_ng_dl).toBeGreaterThan(0);
    expect(r.estimated_dht_ng_dl).toBeLessThan(80);
    expect(['low', 'moderate', 'high']).toContain(r.band);
  });

  it('DHT estimate scales monotonically with total testosterone', () => {
    const low = assessFiveAlphaConversion({ ...base, total_testosterone_ng_dl: 300 });
    const high = assessFiveAlphaConversion({ ...base, total_testosterone_ng_dl: 900 });
    expect(high.estimated_dht_ng_dl).toBeGreaterThan(low.estimated_dht_ng_dl);
  });

  it('higher sebum activity and body fat raise the activity index', () => {
    const calm = assessFiveAlphaConversion(base);
    const active = assessFiveAlphaConversion({ ...base, sebum_activity: 3, body_fat_pct: 35 });
    expect(active.five_ar_activity_index).toBeGreaterThan(calm.five_ar_activity_index);
  });

  it('flags high scalp sensitivity plus family history for clinical review', () => {
    const r = assessFiveAlphaConversion({ ...base, scalp_sensitivity: 10, mpb_family_history: true });
    expect(r.safety_flags).toContain('clinical_review_suggested');
    expect(r.band).not.toBe('low');
  });

  it('never recommends a 5-AR inhibitor or dose', () => {
    const r = assessFiveAlphaConversion(base);
    expect(r.education.join(' ')).not.toMatch(/\b\d+\s?(mg|iu|mcg)\b/i);
    expect(r.education.join(' ')).toMatch(/no 5-AR inhibitor/i);
  });
});
