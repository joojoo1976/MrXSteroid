import { describe, it, expect } from 'vitest';
import { assessAndrogenicBalance } from './tool-058-androgenic-balance-calculator';

describe('tool-058 androgenic balance engine', () => {
  it('screens a balanced profile without flags', () => {
    const r = assessAndrogenicBalance({ dht_ng_dl: 60, testosterone_ng_dl: 800, estradiol_pg_ml: 35 });
    expect(r.dht_t_ratio_pct).toBe(7.5); // 60/800
    expect(r.e2_t_ratio_pct).toBe(0.4); // 35×10/800
    expect(r.dht_band).toBe('dht-low');
    expect(r.e2_band).toBe('balanced');
    expect(r.warnings).toEqual(['educational_screening_ratio_only']);
  });

  it('flags androgenic dominance above the 25% DHT/T line', () => {
    const r = assessAndrogenicBalance({ dht_ng_dl: 150, testosterone_ng_dl: 500, estradiol_pg_ml: 20 });
    expect(r.dht_t_ratio_pct).toBe(30);
    expect(r.dht_band).toBe('androgenic-dominant');
    expect(r.warnings).toContain('androgenic_dominance_flag');
  });

  it('flags estrogenic skew above the 0.6% E2/T line', () => {
    const r = assessAndrogenicBalance({ dht_ng_dl: 40, testosterone_ng_dl: 500, estradiol_pg_ml: 45 });
    expect(r.e2_t_ratio_pct).toBe(0.9); // 45×10/500
    expect(r.e2_band).toBe('e2-dominant');
    expect(r.warnings).toContain('e2_dominant_context');
  });
});
