/**
 * Tool #076 — Blood Viscosity Calculator
 * Deterministic estimator of relative whole-blood and plasma viscosity risk
 * based on hematocrit (HCT), total protein, hydration status, and androgen exposure.
 *
 * Core clinical science:
 * - Hematocrit is the primary determinant of whole-blood viscosity (exponential rise above 50%).
 * - Elevated total protein / globulins increase plasma viscosity.
 * - Dehydration elevates viscosity dynamically.
 * - This tool is purely educational and screens for hyperviscosity risk markers.
 */

export interface BloodViscosityInput {
  hematocrit_pct: number; // 30..65 %
  total_protein_g_dl?: number; // 4.5..10.0 g/dL (normal ~6.0-8.3)
  hydration_status: 'dehydrated' | 'adequate' | 'well_hydrated';
  androgen_use: boolean;
}

export interface BloodViscosityResult {
  relative_viscosity_score: number; // 0..100 index
  viscosity_band: 'normal' | 'borderline-elevated' | 'significantly-elevated' | 'critical-hyperviscosity-risk';
  estimated_viscosity_cp: number; // approximate centipoise (cP), standard whole blood is ~3.5-4.5 cP
  warnings: string[];
}

export function calculateBloodViscosity(input: BloodViscosityInput): BloodViscosityResult {
  const {
    hematocrit_pct,
    total_protein_g_dl,
    hydration_status,
    androgen_use,
  } = input;

  const warnings: string[] = ['educational_blood_viscosity_screen'];

  // Base viscosity estimation in centipoise (cP)
  // Standard empirical linear-exponential model: cP ~ 1.5 * exp(0.023 * HCT)
  let baseCp = 1.45 * Math.exp(0.0225 * hematocrit_pct);

  // Protein correction (normal ~7.0 g/dL)
  if (total_protein_g_dl !== undefined) {
    if (total_protein_g_dl > 7.5) {
      baseCp += (total_protein_g_dl - 7.5) * 0.4;
      warnings.push('elevated_total_protein_increases_plasma_viscosity');
    }
  }

  // Hydration impact
  if (hydration_status === 'dehydrated') {
    baseCp += 0.5;
    warnings.push('dehydration_significantly_exacerbates_hemoconcentration');
  } else if (hydration_status === 'well_hydrated') {
    baseCp = Math.max(3.0, baseCp - 0.2);
  }

  // Androgen context
  if (androgen_use && hematocrit_pct >= 50) {
    warnings.push('androgen_induced_erythrocytosis_compounds_thrombotic_strain');
  }

  const estimated_viscosity_cp = Number(baseCp.toFixed(2));

  // Relative viscosity score (0 to 100)
  // 3.5 cP -> ~20 score, 4.5 cP -> ~45 score, 5.5 cP -> ~75 score, >6.5 cP -> 95+ score
  let score = Math.round(((estimated_viscosity_cp - 2.8) / (7.0 - 2.8)) * 100);
  score = Math.max(5, Math.min(100, score));

  let viscosity_band: BloodViscosityResult['viscosity_band'] = 'normal';
  if (hematocrit_pct >= 54 || estimated_viscosity_cp >= 6.0) {
    viscosity_band = 'critical-hyperviscosity-risk';
    warnings.push('critical_hematocrit_threshold_requires_medical_evaluation');
  } else if (hematocrit_pct >= 50 || estimated_viscosity_cp >= 5.0) {
    viscosity_band = 'significantly-elevated';
    warnings.push('elevated_blood_viscosity_increases_microvascular_resistance');
  } else if (hematocrit_pct >= 47 || estimated_viscosity_cp >= 4.5) {
    viscosity_band = 'borderline-elevated';
  }

  return {
    relative_viscosity_score: score,
    viscosity_band,
    estimated_viscosity_cp,
    warnings,
  };
}
