import { describe, it, expect } from 'vitest';
import { manageArterialHealth } from './tool-075-arterial-health-manager';

describe('Tool #075 — Arterial Health Manager Engine', () => {
  it('identifies low stiffness risk for young non-smoker with optimal BP and lipids', () => {
    const res = manageArterialHealth({
      age: 28,
      systolic_mmhg: 118,
      diastolic_mmhg: 76,
      total_cholesterol_mg_dl: 170,
      hdl_mg_dl: 55,
      triglycerides_mg_dl: 80,
      smoker: false,
    });
    // PP = 42 (<50), TC:HDL = 3.1, TG:HDL = 1.5 -> Score = 10
    expect(res.arterial_risk_score).toBe(10);
    expect(res.stiffness_risk_band).toBe('low-stiffness-risk');
    expect(res.tc_to_hdl_ratio).toBe(3.1);
    expect(res.tg_to_hdl_ratio).toBe(1.5);
  });

  it('detects elevated stiffness risk when wide PP, smoking, and dyslipidemia coexist', () => {
    const res = manageArterialHealth({
      age: 52,
      systolic_mmhg: 155,
      diastolic_mmhg: 85, // PP = 70
      total_cholesterol_mg_dl: 260,
      hdl_mg_dl: 35, // TC:HDL = 7.4
      triglycerides_mg_dl: 210, // TG:HDL = 6.0
      smoker: true,
    });
    // 10 + 30 (PP) + 10 (age 52) + 25 (smoker) + 20 (TC:HDL) + 20 (TG:HDL) = 115 -> clamped 100
    expect(res.arterial_risk_score).toBe(100);
    expect(res.stiffness_risk_band).toBe('elevated-stiffness-risk');
    expect(res.warnings).toContain('wide_pulse_pressure_correlates_with_central_aortic_stiffness');
    expect(res.warnings).toContain('smoking_impairs_endothelial_nitric_oxide_and_stiffens_vessels');
    expect(res.warnings).toContain('vascular_stiffness_and_atherogenic_markers_warrant_cardiology_review');
  });

  it('handles missing lipids gracefully based on blood pressure and lifestyle', () => {
    const res = manageArterialHealth({
      age: 35,
      systolic_mmhg: 125,
      diastolic_mmhg: 80,
      smoker: false,
    });
    expect(res.tc_to_hdl_ratio).toBeNull();
    expect(res.tg_to_hdl_ratio).toBeNull();
    expect(res.arterial_risk_score).toBe(10);
    expect(res.stiffness_risk_band).toBe('low-stiffness-risk');
  });
});
