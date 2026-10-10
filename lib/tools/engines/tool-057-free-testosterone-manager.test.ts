import { describe, it, expect } from 'vitest';
import { estimateFreeTestosterone } from './tool-057-free-testosterone-manager';

describe('tool-057 free testosterone engine', () => {
  it('computes the Vermeulen simplified free fraction at mid SHBG', () => {
    const r = estimateFreeTestosterone({ total_test_ng_dl: 500, shbg_nmol_l: 30, albumin_g_dl: 4.2 });
    expect(r.free_t_pg_ml).toBe(93.1); // T=17.35 nM / (1+30+22.75) × 288.4
    expect(r.free_t_pct).toBe(1.9); // rounded from 1.86
    expect(r.band).toBe('normal-free-fraction');
    expect(r.warnings).toContain('educational_estimate_vermeulen_simplified');
  });

  it('flags low SHBG as a high free fraction and high SHBG as low', () => {
    const lowShbg = estimateFreeTestosterone({ total_test_ng_dl: 500, shbg_nmol_l: 15, albumin_g_dl: 4.2 });
    expect(lowShbg.free_t_pct).toBe(2.6);
    expect(lowShbg.band).toBe('high-free-fraction');
    expect(lowShbg.warnings).toContain('low_shbg_high_free_context');

    const highShbg = estimateFreeTestosterone({ total_test_ng_dl: 500, shbg_nmol_l: 60, albumin_g_dl: 4.2 });
    expect(highShbg.free_t_pct).toBe(1.2);
    expect(highShbg.band).toBe('low-free-fraction');
    expect(highShbg.warnings).toContain('high_shbg_low_free_context');
  });

  it('never returns a negative or non-finite free value at extremes', () => {
    const r = estimateFreeTestosterone({ total_test_ng_dl: 100, shbg_nmol_l: 5, albumin_g_dl: 3 });
    expect(r.free_t_pg_ml).toBe(45);
    expect(r.free_t_pct).toBe(4.5);
    expect(r.band).toBe('high-free-fraction');
  });
});
