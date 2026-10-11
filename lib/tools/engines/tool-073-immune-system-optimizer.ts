/**
 * Tool #073 — Immune System Optimizer
 * Evaluates physiological baseline factors supporting innate & adaptive immunity.
 * Factors evaluated: Sleep regularity, 25(OH)D status, zinc adequacy, training load / overreaching state,
 * and mucosal immunity support. Educational physiological guidance index.
 */

export interface ImmuneSystemInput {
  vitamin_d_ng_ml?: number; // 10..120 (optimal 40..60)
  sleep_hours_average: number; // 3..12
  training_strain_level: 'light-moderate' | 'hard' | 'extreme-overreaching';
  recurrent_upper_respiratory_infections: boolean;
  takes_zinc_vitamin_c: boolean;
}

export interface ImmuneSystemResult {
  immune_resilience_score: number; // 0..100
  resilience_band: 'compromised-immunity' | 'moderate-resilience' | 'robust-resilience';
  targeted_priorities: string[];
  warnings: string[];
}

export function optimizeImmuneSystem(input: ImmuneSystemInput): ImmuneSystemResult {
  const {
    vitamin_d_ng_ml,
    sleep_hours_average,
    training_strain_level,
    recurrent_upper_respiratory_infections,
    takes_zinc_vitamin_c,
  } = input;

  const warnings: string[] = ['educational_immune_resilience_assessment'];
  const targeted_priorities: string[] = [];

  let score = 20; // baseline

  // Vitamin D endocrine factor (max +30)
  if (typeof vitamin_d_ng_ml === 'number') {
    if (vitamin_d_ng_ml >= 40 && vitamin_d_ng_ml <= 70) {
      score += 30;
    } else if (vitamin_d_ng_ml >= 30) {
      score += 18;
    } else {
      score += 5;
      warnings.push('vitamin_d_deficiency_impairs_innate_t_cell_activation');
      targeted_priorities.push('optimize_serum_vitamin_d_levels');
    }
  } else {
    score += 15; // neutral assumption when untested
    targeted_priorities.push('test_25_oh_vitamin_d_serum_levels');
  }

  // Sleep architecture (max +25)
  if (sleep_hours_average >= 7.5) {
    score += 25;
  } else if (sleep_hours_average >= 6.5) {
    score += 15;
  } else {
    score += 5;
    warnings.push('chronic_sleep_deprivation_blunts_natural_killer_cells');
    targeted_priorities.push('prioritize_7_to_8_hours_restful_sleep');
  }

  // Training strain balance
  if (training_strain_level === 'light-moderate') {
    score += 15;
  } else if (training_strain_level === 'hard') {
    score += 10;
  } else {
    // extreme overreaching creates transient open-window immunosuppression
    score -= 10;
    warnings.push('extreme_overreaching_creates_transient_immunosuppressive_window');
    targeted_priorities.push('implement_deload_to_prevent_immune_crash');
  }

  // Micronutrient cofactor
  if (takes_zinc_vitamin_c) {
    score += 15;
  }

  // Recurrent infection history indicator
  if (recurrent_upper_respiratory_infections) {
    score -= 15;
    warnings.push('frequent_infections_signal_underlying_immunological_stress');
  }

  score = Math.max(0, Math.min(100, score));

  let resilience_band: ImmuneSystemResult['resilience_band'];
  if (score < 45) {
    resilience_band = 'compromised-immunity';
  } else if (score < 75) {
    resilience_band = 'moderate-resilience';
  } else {
    resilience_band = 'robust-resilience';
  }

  return {
    immune_resilience_score: score,
    resilience_band,
    targeted_priorities,
    warnings: [...new Set(warnings)],
  };
}
