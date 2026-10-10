import { describe, it, expect } from 'vitest';
import { projectTrtLifetime } from './tool-046-trt-lifetime';

describe('tool-046 TRT lifetime engine', () => {
  it('projects 10/20/30-year costs and cadence for a mid-life injection patient', () => {
    const r = projectTrtLifetime({
      age: 42,
      method: 'injection',
      weekly_testosterone_mg: 150,
      years_on_trt: 3.5,
      monthly_med_cost_usd: 40,
      monitoring_annual_cost_usd: 300,
    });
    expect(r.injection_interval_days).toBe(3.5);
    expect(r.annual_bloodwork_panels).toBe(1); // >=3 years on TRT
    expect(r.age_band).toBe('40-55');
    expect(r.cost_projection.horizon10.total_cost_usd).toBe(7800); // 40*12*10 + 300*10
    expect(r.cost_projection.horizon20.total_cost_usd).toBe(15600);
    expect(r.cost_projection.horizon30.total_cost_usd).toBe(23400);
    expect(r.lifetime_bloodwork_panels_10y).toBe(10);
    expect(r.warnings).toContain('age_40_plus_cardio_monitoring');
    // years_on_trt 3.5 < 5: long-term full-panel warning not yet active
  });

  it('new patient on gel gets intensified first-year monitoring and daily dosing', () => {
    const r = projectTrtLifetime({
      age: 30,
      method: 'gel',
      weekly_testosterone_mg: 100,
      years_on_trt: 0.5,
      monthly_med_cost_usd: 90,
      monitoring_annual_cost_usd: 400,
    });
    expect(r.injection_interval_days).toBe(1);
    expect(r.annual_bloodwork_panels).toBe(3);
    expect(r.age_band).toBe('under-40');
    expect(r.cost_projection.horizon10.total_cost_usd).toBe(14800); // 90*12*10 + 400*10
    expect(r.warnings).not.toContain('age_40_plus_cardio_monitoring');
  });

  it('flags high weekly doses as outside physiological TRT ranges', () => {
    const r = projectTrtLifetime({
      age: 29,
      method: 'injection',
      weekly_testosterone_mg: 250,
      years_on_trt: 1,
      monthly_med_cost_usd: 30,
      monitoring_annual_cost_usd: 0,
    });
    expect(r.warnings).toContain('high_dose_not_trt_range');
    expect(r.annual_bloodwork_panels).toBe(2); // 1 <= years < 3
  });
});
