/**
 * Tool #040 — Lipid Profile Optimizer: engine + schema verification.
 */
import { describe, it, expect } from 'vitest';
import { optimizeLipidProfile } from './tool-040-lipid-profile-optimizer';
import { LipidOptimizerInputSchema, LipidOptimizerResultSchema } from '../schemas/tool-040-lipid-profile-optimizer';

describe('tool-040 lipid engine', () => {
  it('rates an optimal panel as optimal', () => {
    const input = {
      panel: { ldl_mg_dl: 90, hdl_mg_dl: 65, triglycerides_mg_dl: 100 },
      age: 30, smoker: false, systolic_bp: 118, on_cycle: false, weeks_remaining: 0,
    };
    expect(LipidOptimizerInputSchema.safeParse(input).success).toBe(true);
    const r = optimizeLipidProfile(input);
    expect(LipidOptimizerResultSchema.safeParse(r).success).toBe(true);
    expect(r.overall_band).toBe('optimal');
    expect(r.non_hdl).toBe(110);
  });

  it('flags very-high LDL with physician escalation', () => {
    const r = optimizeLipidProfile({
      panel: { ldl_mg_dl: 190, hdl_mg_dl: 35, triglycerides_mg_dl: 250 },
      age: 46, smoker: true, systolic_bp: 145, on_cycle: true, weeks_remaining: 8,
    });
    expect(r.ldl_status).toBe('very-high');
    expect(r.overall_band).toBe('very-high');
    expect(r.interventions.some((x) => x.includes('physician'))).toBe(true);
  });

  it('escalates optimal on-cycle baseline to borderline', () => {
    const r = optimizeLipidProfile({
      panel: { ldl_mg_dl: 90, hdl_mg_dl: 65, triglycerides_mg_dl: 100 },
      age: 30, smoker: false, systolic_bp: 118, on_cycle: true, weeks_remaining: 10,
    });
    expect(r.overall_band).toBe('borderline');
  });
});
