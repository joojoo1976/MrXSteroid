import { describe, it, expect } from 'vitest';
import { estimateDhtConversion } from './tool-060-5-alpha-conversion-calculator';

describe('tool-060 5-alpha conversion engine', () => {
  it('estimates DHT at the baseline 10% conversion without an inhibitor', () => {
    const r = estimateDhtConversion({ testosterone_ng_dl: 800, inhibitor: 'none' });
    expect(r.dht_estimate_ng_dl).toBe(80);
    expect(r.est_conversion_pct).toBe(10);
    expect(r.suppression_pct).toBe(0);
    expect(r.band).toBe('normal-range');
    expect(r.warnings).toEqual(['educational_population_estimate']);
  });

  it('models finasteride 5mg suppression and flags the suppressed band', () => {
    const r = estimateDhtConversion({ testosterone_ng_dl: 800, inhibitor: 'finasteride_5mg' });
    expect(r.dht_estimate_ng_dl).toBe(24); // 800 × 0.03
    expect(r.suppression_pct).toBe(70); // (0.10−0.03)/0.10
    expect(r.band).toBe('suppressed-dht');
    expect(r.warnings).toContain('dht_suppression_context');
  });

  it('models dutasteride near-complete suppression', () => {
    const r = estimateDhtConversion({ testosterone_ng_dl: 1000, inhibitor: 'dutasteride_0.5mg' });
    expect(r.dht_estimate_ng_dl).toBe(10); // 1000 × 0.01
    expect(r.suppression_pct).toBe(90);
    expect(r.band).toBe('suppressed-dht');
  });
});
