import { describe, it, expect } from 'vitest';
import { manageEndothelialHealth } from './tool-078-endothelial-health-manager';

describe('Tool #078 — Endothelial Health Manager Engine', () => {
  it('correctly scores resilient and intact vascular endothelium', () => {
    const res = manageEndothelialHealth({
      systolic_bp: 115,
      fasting_glucose_mg_dl: 88,
      high_sensitivity_crp_mg_l: 0.5,
      smoker_or_vaper: false,
      androgen_therapy_active: false,
      daily_aerobic_movement_mins: 45,
    });

    expect(res.endothelial_status_band).toBe('resilient-intact');
    expect(res.endothelial_dysfunction_risk_score).toBeLessThanOrEqual(25);
  });

  it('detects combined vascular stress and inflammation', () => {
    const res = manageEndothelialHealth({
      systolic_bp: 145,
      fasting_glucose_mg_dl: 130,
      high_sensitivity_crp_mg_l: 3.5,
      smoker_or_vaper: true,
      androgen_therapy_active: true,
      daily_aerobic_movement_mins: 0,
    });

    expect(res.endothelial_status_band).toBe('pronounced-endothelial-impairment');
    expect(res.endothelial_dysfunction_risk_score).toBeGreaterThan(70);
    expect(res.warnings).toContain('hypertensive_pressure_damages_endothelial_glycocalyx');
    expect(res.warnings).toContain('systemic_vascular_inflammation_indicated_by_elevated_crp');
  });
});
