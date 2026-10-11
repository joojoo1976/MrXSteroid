import { describe, it, expect } from 'vitest';
import { calculateEstrogenBalance } from './tool-067-estrogen-balance-calculator';

describe('Tool #067 — Estrogen Balance Calculator Engine', () => {
  it('correctly calculates optimal balanced T:E2 ratio', () => {
    // 600 ng/dL / 30 pg/mL = 20.0 (within 14-30)
    const res = calculateEstrogenBalance({
      total_testosterone_ng_dl: 600,
      estradiol_pg_ml: 30,
    });
    expect(res.t_to_e2_ratio).toBe(20);
    expect(res.balance_band).toBe('balanced-optimal');
    expect(res.warnings).toEqual(['educational_hormonal_balance_screen']);
  });

  it('detects estrogen dominance when ratio is below 14', () => {
    // 500 ng/dL / 50 pg/mL = 10.0
    const res = calculateEstrogenBalance({
      total_testosterone_ng_dl: 500,
      estradiol_pg_ml: 50,
    });
    expect(res.t_to_e2_ratio).toBe(10);
    expect(res.balance_band).toBe('estrogen-dominant');
    expect(res.warnings).toContain('relative_estrogen_dominance');
  });

  it('detects crushed E2 and androgen dominance when ratio exceeds 30', () => {
    // 800 ng/dL / 12 pg/mL = 66.7
    const res = calculateEstrogenBalance({
      total_testosterone_ng_dl: 800,
      estradiol_pg_ml: 12,
    });
    expect(res.t_to_e2_ratio).toBe(66.7);
    expect(res.balance_band).toBe('androgen-dominant-low-e2');
    expect(res.warnings).toContain('low_e2_joint_cardio_risk');
    expect(res.warnings).toContain('relative_androgen_excess_or_crushed_e2');
  });
});
