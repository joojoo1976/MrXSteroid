import { describe, expect, it } from 'vitest';
import { calculateSHBG } from './tool-015-shbg-modulator';

describe('tool 015 Vermeulen calculation', () => {
  it('calculates free and bioavailable testosterone from all three lab inputs', () => {
    const result = calculateSHBG({
      total_testosterone_ng_dL: 500,
      shbg_nmol_L: 30,
      albumin_g_dL: 4.3,
    });

    expect(result.status).toBe('CALCULATED');
    expect(result.formula).toBe('VERMEULEN_MASS_ACTION');
    expect(result.free_testosterone_nmol_L).toBeCloseTo(0.3766, 4);
    expect(result.free_testosterone_ng_dL).toBeCloseTo(10.85, 1);
    expect(result.bioavailable_testosterone_nmol_L).toBeGreaterThan(result.free_testosterone_nmol_L);
    expect(result).not.toHaveProperty('interpretation');
    expect(result).not.toHaveProperty('recommendations');
  });

  it('rejects missing, nonfinite, or nonpositive lab values', () => {
    expect(() => calculateSHBG({ total_testosterone_ng_dL: 500, shbg_nmol_L: 30, albumin_g_dL: 0 })).toThrow();
    expect(() => calculateSHBG({ total_testosterone_ng_dL: Number.NaN, shbg_nmol_L: 30, albumin_g_dL: 4.3 })).toThrow();
    expect(() => calculateSHBG({ total_testosterone_ng_dL: 500, shbg_nmol_L: 30 } as never)).toThrow();
    expect(() => calculateSHBG({ total_testosterone_ng_dL: 500, shbg_nmol_L: 30, albumin_g_dL: 4.3, sex: 'male' } as never)).toThrow();
    expect(() => calculateSHBG({ total_testosterone_ng_dL: Number.MAX_VALUE, shbg_nmol_L: 30, albumin_g_dL: 4.3 })).toThrow();
  });
});
