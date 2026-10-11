/**
 * Tool #084 — Cognitive Enhancer
 * Educational evaluation of neurotrophic support factors, focus endurance,
 * sleep consolidation, and nootropic precursor sufficiency.
 *
 * NOTE: Screens educational lifestyle/nutritional pillars supporting
 * neuroplasticity (BDNF) and executive function; not a clinical neurological
 * diagnostic (e.g. MoCA / MMSE).
 */

export interface CognitiveEnhancerInput {
  daily_focused_deep_work_hours: number; // 0..12
  regular_aerobic_exercise: boolean; // stimulates BDNF
  caffeine_daily_mg: number; // 0..800
  choline_rich_foods_or_alpha_gpc: boolean; // acetylcholine synthesis
  frequent_brain_fog_complaints: boolean;
  sleep_hours: number; // 3..12
}

export interface CognitiveEnhancerResult {
  cognitive_readiness_score: number; // 0..100
  cognitive_status_band: 'suboptimal-fatigued' | 'functional-baseline' | 'heightened-acuity' | 'peak-neurotrophic-state';
  warnings: string[];
}

export function evaluateCognitiveEnhancement(input: CognitiveEnhancerInput): CognitiveEnhancerResult {
  const {
    daily_focused_deep_work_hours,
    regular_aerobic_exercise,
    caffeine_daily_mg,
    choline_rich_foods_or_alpha_gpc,
    frequent_brain_fog_complaints,
    sleep_hours,
  } = input;

  const warnings: string[] = ['educational_cognitive_performance_screen'];
  let score = 30; // baseline

  // Aerobic BDNF stimulus
  if (regular_aerobic_exercise) {
    score += 25;
  } else {
    warnings.push('aerobic_exercise_is_a_critical_driver_of_hippocampal_bdnf_synthesis');
  }

  // Choline / Acetylcholine precursor
  if (choline_rich_foods_or_alpha_gpc) {
    score += 15;
  }

  // Deep work conditioning
  if (daily_focused_deep_work_hours >= 4) {
    score += 15;
  } else if (daily_focused_deep_work_hours >= 2) {
    score += 10;
  }

  // Caffeine dose context
  if (caffeine_daily_mg > 400) {
    score -= 10;
    warnings.push('excessive_caffeine_triggers_adenosine_receptor_upregulation_and_anxiety');
  } else if (caffeine_daily_mg >= 100 && caffeine_daily_mg <= 300) {
    score += 10;
  }

  // Sleep consolidation
  if (sleep_hours >= 7 && sleep_hours <= 9) {
    score += 15;
  } else if (sleep_hours < 6) {
    score -= 20;
    warnings.push('sleep_deprivation_severely_impairs_prefrontal_cortex_executive_function');
  }

  // Subjective brain fog
  if (frequent_brain_fog_complaints) {
    score -= 20;
    warnings.push('persistent_brain_fog_warrants_evaluation_of_sleep_apnea_thyroid_or_deficiencies');
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let band: CognitiveEnhancerResult['cognitive_status_band'] = 'functional-baseline';
  if (finalScore >= 80) {
    band = 'peak-neurotrophic-state';
  } else if (finalScore >= 60) {
    band = 'heightened-acuity';
  } else if (finalScore <= 35) {
    band = 'suboptimal-fatigued';
  }

  return {
    cognitive_readiness_score: finalScore,
    cognitive_status_band: band,
    warnings,
  };
}
