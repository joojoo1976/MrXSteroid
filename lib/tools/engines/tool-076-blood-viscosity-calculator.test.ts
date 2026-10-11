import { describe, it, expect } from 'vitest';
import { calculateBloodViscosity } from './tool-076-blood-viscosity-calculator';

describe('Tool #076 — Blood Viscosity Calculator Engine', () => {
  it('evaluates normal hematocrit and optimal hydration', () => {
    const res = calculateBloodViscosity({
      hematocrit_pct: 44,
      total_protein_g_dl: 7.0,
      hydration_status: 'adequate',
      androgen_use: false,
    });

    expect(res.viscosity_band).toBe('normal');
    expect(res.estimated_viscosity_cp).toBeGreaterThan(3.5);
    expect(res.estimated_viscosity_cp).toBeLessThan(4.5);
    expect(res.relative_viscosity_score).toBeLessThan(50);
  });

  it('detects borderline and critical elevated viscosity from erythrocytosis', () => {
    const res = calculateBloodViscosity({
      hematocrit_pct: 54,
      total_protein_g_dl: 7.8,
      hydration_status: 'dehydrated',
      androgen_use: true,
    });

    expect(res.viscosity_band).toBe('critical-hyperviscosity-risk');
    expect(res.estimated_viscosity_cp).toBeGreaterThan(5.5);
    expect(res.warnings).toContain('critical_hematocrit_threshold_requires_medical_evaluation');
    expect(res.warnings).toContain('androgen_induced_erythrocytosis_compounds_thrombotic_strain');
  });
});
