import { describe, it, expect } from 'vitest';
import {
  assessFreeTestosterone,
  solveFreeTestosteroneNmol,
  NMOL_L_TO_NG_DL,
  type FreeTestosteroneInput,
} from './tool-057-free-testosterone';

const base: FreeTestosteroneInput = {
  total_testosterone_ng_dl: 600,
  shbg_nmol_l: 30,
  albumin_g_l: 43,
  age: 35,
  sex: 'male',
};

describe('tool-057 Free Testosterone', () => {
  it('returns a plausible free fraction for a typical adult male', () => {
    const r = assessFreeTestosterone(base);
    expect(r.free_testosterone_ng_dl).toBeGreaterThan(6);
    expect(r.free_testosterone_ng_dl).toBeLessThan(30);
    expect(r.free_fraction_pct).toBeGreaterThan(1);
    expect(r.free_fraction_pct).toBeLessThan(4);
    expect(r.band).toBe('normal');
  });

  it('low SHBG raises and high SHBG lowers the free fraction', () => {
    const low = assessFreeTestosterone({ ...base, shbg_nmol_l: 12 });
    const mid = assessFreeTestosterone(base);
    const high = assessFreeTestosterone({ ...base, shbg_nmol_l: 80 });
    expect(low.free_testosterone_ng_dl).toBeGreaterThan(mid.free_testosterone_ng_dl);
    expect(high.free_testosterone_ng_dl).toBeLessThan(mid.free_testosterone_ng_dl);
  });

  it('free testosterone rises monotonically with total testosterone', () => {
    const a = solveFreeTestosteroneNmol(10, 30, 43);
    const b = solveFreeTestosteroneNmol(20, 30, 43);
    const c = solveFreeTestosteroneNmol(40, 30, 43);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });

  it('escalates to clinical review in the severe hypogonadism range', () => {
    const r = assessFreeTestosterone({ ...base, total_testosterone_ng_dl: 80 });
    expect(r.clinical_review_advised).toBe(true);
    expect(r.safety_flags).toContain('severe_hypogonadism_range');
    expect(r.band).toBe('low');
  });

  it('never recommends a hormone dose', () => {
    const r = assessFreeTestosterone(base);
    expect(r.recommendations.join(' ')).not.toMatch(/\b\d+\s?(mg|iu|mcg|ml)\b/i);
    expect(r.educational_notice.length).toBeGreaterThan(0);
    expect(NMOL_L_TO_NG_DL).toBeCloseTo(28.84, 1);
  });
});
