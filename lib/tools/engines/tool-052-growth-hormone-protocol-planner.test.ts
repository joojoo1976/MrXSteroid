import { describe, it, expect } from 'vitest';
import { planGrowthHormone } from './tool-052-growth-hormone-protocol-planner';

describe('tool-052 growth hormone protocol planner engine', () => {
  it('splits a weekly dose over the 5-on/2-off pattern with cost projection', () => {
    const r = planGrowthHormone({
      bodyweight_kg: 85,
      weekly_iu_total: 14,
      protocol_pattern: '5on2off',
      months: 6,
      cost_per_iu_usd: 8,
    });
    expect(r.daily_iu_on_days).toBe(2.8); // 14/5
    expect(r.rest_days_per_week).toBe(2);
    expect(r.monthly_iu).toBe(61); // round(14*52/12)
    expect(r.cost_projection_3m_usd).toBe(1464); // 61*8*3
    expect(r.cost_projection_6m_usd).toBe(2928);
    expect(r.warnings).not.toContain('high_daily_dose_monitor_glucose');
  });

  it('flags daily protocols above the documented conservative ceiling', () => {
    const r = planGrowthHormone({
      bodyweight_kg: 70,
      weekly_iu_total: 42, // 6 IU/day daily
      protocol_pattern: 'daily',
      months: 3,
      cost_per_iu_usd: 5,
    });
    expect(r.daily_iu_on_days).toBe(6);
    expect(r.rest_days_per_week).toBe(0);
    expect(r.warnings).toContain('high_daily_dose_monitor_glucose');
    expect(r.warnings).toContain('educational_not_a_prescription');
  });

  it('long use adds IGF-1 monitoring guidance', () => {
    const r = planGrowthHormone({
      bodyweight_kg: 80,
      weekly_iu_total: 10,
      protocol_pattern: 'daily',
      months: 8,
      cost_per_iu_usd: 10,
    });
    expect(r.warnings).toContain('long_use_igf1_glucose_monitoring');
  });
});
