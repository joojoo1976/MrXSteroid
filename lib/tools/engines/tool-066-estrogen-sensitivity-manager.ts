/**
 * Tool #066 — Estrogen Sensitivity Manager
 * Assesses an individual's symptomatic sensitivity to circulating estradiol (E2).
 * Symptoms at normal or high E2 levels are scored to categorize response pattern:
 * 'low-sensitivity', 'normal-sensitivity', or 'high-sensitivity'.
 * Deterministic educational evaluation; not a prescription or clinical diagnosis.
 */

export interface EstrogenSensitivityInput {
  e2_level_pg_ml: number; // 5..200
  water_retention_score: number; // 0..3 (0=none, 1=mild, 2=moderate, 3=severe)
  nipple_sensitivity: boolean;
  mood_lability_score: number; // 0..3
  libido_impact: 'none' | 'reduced' | 'crashed';
}

export interface EstrogenSensitivityResult {
  total_symptom_score: number;
  sensitivity_pattern: 'low-sensitivity' | 'normal-sensitivity' | 'high-sensitivity';
  contextual_band: 'asymptomatic' | 'mild-estrogenic-burden' | 'significant-estrogenic-burden';
  warnings: string[];
}

export function manageEstrogenSensitivity(input: EstrogenSensitivityInput): EstrogenSensitivityResult {
  const { e2_level_pg_ml, water_retention_score, nipple_sensitivity, mood_lability_score, libido_impact } = input;
  const warnings: string[] = ['educational_sensitivity_assessment'];

  let score = water_retention_score + mood_lability_score;
  if (nipple_sensitivity) score += 3;
  if (libido_impact === 'reduced') score += 1;
  if (libido_impact === 'crashed') score += 2;

  if (nipple_sensitivity) {
    warnings.push('nipple_sensitivity_monitor_closely');
  }

  // Determine sensitivity pattern based on score relative to circulating E2
  // High symptoms despite moderate/low E2 (<35 pg/ml) indicates high sensitivity
  let sensitivity_pattern: EstrogenSensitivityResult['sensitivity_pattern'];
  if (score >= 4 && e2_level_pg_ml <= 35) {
    sensitivity_pattern = 'high-sensitivity';
    warnings.push('symptomatic_at_normal_e2_levels');
  } else if (score <= 1 && e2_level_pg_ml > 50) {
    sensitivity_pattern = 'low-sensitivity';
  } else {
    sensitivity_pattern = 'normal-sensitivity';
  }

  let contextual_band: EstrogenSensitivityResult['contextual_band'];
  if (score === 0) {
    contextual_band = 'asymptomatic';
  } else if (score <= 3) {
    contextual_band = 'mild-estrogenic-burden';
  } else {
    contextual_band = 'significant-estrogenic-burden';
  }

  return {
    total_symptom_score: score,
    sensitivity_pattern,
    contextual_band,
    warnings: [...new Set(warnings)],
  };
}
