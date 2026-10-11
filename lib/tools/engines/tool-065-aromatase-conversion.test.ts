import { describe, it, expect } from 'vitest';
import { assessAromatase, type AromataseInput } from './tool-065-aromatase-conversion';

const base: AromataseInput = {
  body_fat_pct: 15,
  age: 30,
  total_testosterone_ng_dl: 600,
  estradiol_pg_ml: 25,
};

describe('tool-065 Aromatase Conversion', () => {
  it('higher body fat raises the aromatisation index', () => {
    const lean = assessAromatase({ ...base, body_fat_pct: 10 });
    const heavy = assessAromatase({ ...base, body_fat_pct: 35 });
    expect(heavy.aromatization_index).toBeGreaterThan(lean.aromatization_index);
    expect(lean.aromatization_index).toBeGreaterThanOrEqual(0);
    expect(heavy.aromatization_index).toBeLessThanOrEqual(100);
  });

  it('computes the E2:T ratio and classifies the reference band', () => {
    const r = assessAromatase(base);
    expect(r.e2_t_ratio).toBeCloseTo(25 / 600, 4);
    expect(r.ratio_band).toBe('typical');
  });

  it('classifies a high ratio and raises the index', () => {
    const typical = assessAromatase(base);
    const high = assessAromatase({ ...base, estradiol_pg_ml: 90 });
    expect(high.ratio_band).toBe('high');
    expect(high.aromatization_index).toBeGreaterThan(typical.aromatization_index);
  });

  it('flags supraphysiologic testosterone and high-ratio contexts', () => {
    const r = assessAromatase({ ...base, total_testosterone_ng_dl: 2000, estradiol_pg_ml: 200, body_fat_pct: 32 });
    expect(r.safety_flags).toContain('supraphysiologic_testosterone');
    expect(r.safety_flags).toContain('high_aromatisation_context');
  });

  it('is deterministic and never recommends an aromatase inhibitor', () => {
    expect(assessAromatase(base)).toEqual(assessAromatase(base));
    expect(assessAromatase(base).education.join(' ')).toMatch(/never recommends an aromatase inhibitor/i);
  });
});
