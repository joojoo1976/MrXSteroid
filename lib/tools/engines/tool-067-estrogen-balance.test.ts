import { describe, it, expect } from 'vitest';
import { assessEstrogenBalance, type EstrogenBalanceInput } from './tool-067-estrogen-balance';

const base: EstrogenBalanceInput = {
  sex: 'male',
  estradiol_pg_ml: 25,
  total_testosterone_ng_dl: 600,
  shbg_nmol_l: 30,
  high_e2_symptoms: 0,
  low_e2_symptoms: 0,
};

describe('tool-067 Estrogen Balance', () => {
  it('classifies a mid-band ratio as balanced', () => {
    const r = assessEstrogenBalance(base);
    expect(r.classification).toBe('balanced');
    expect(r.e2_t_ratio).toBeCloseTo(25 / 600, 4);
    expect(r.balance_index).toBeGreaterThanOrEqual(0);
    expect(r.balance_index).toBeLessThanOrEqual(100);
  });

  it('classifies a high ratio as estrogen-dominant', () => {
    const r = assessEstrogenBalance({ ...base, estradiol_pg_ml: 90 });
    expect(r.classification).toBe('estrogen-dominant');
    expect(r.balance_index).toBeGreaterThan(50);
    expect(r.safety_flags).toContain('outside_reference_ratio');
  });

  it('classifies a low ratio as estrogen-low', () => {
    const r = assessEstrogenBalance({ ...base, estradiol_pg_ml: 5 });
    expect(r.classification).toBe('estrogen-low');
    expect(r.balance_index).toBeLessThan(50);
  });

  it('detects symptom/lab discordance', () => {
    const r = assessEstrogenBalance({ ...base, estradiol_pg_ml: 90, high_e2_symptoms: 0, low_e2_symptoms: 3 });
    expect(r.symptom_discordance).toBe(true);
    expect(r.safety_flags).toContain('symptom_lab_discordance');
  });

  it('uses sex-specific bands and never recommends a dose', () => {
    const female = assessEstrogenBalance({ ...base, sex: 'female', estradiol_pg_ml: 120, total_testosterone_ng_dl: 40 });
    expect(female.classification).toBe('balanced');
    expect(female.education.join(' ')).toMatch(/never recommends an aromatase inhibitor/i);
  });
});
