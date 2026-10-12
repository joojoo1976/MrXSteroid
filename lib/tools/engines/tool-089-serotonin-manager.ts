/**
 * Tool #089 — Serotonin Manager
 * Evaluates dietary tryptophan availability, gut microbiome integrity
 * (where ~90% of serotonin is synthesized), sunlight exposure, and somatic relaxation.
 *
 * NOTE: Educational screening score based on neurogastroenterology and
 * serotonin physiology; not a cerebrospinal fluid (CSF) 5-HIAA measurement.
 */

export interface SerotoninManagerInput {
  tryptophan_rich_food_intake: 'low' | 'moderate' | 'optimal'; // turkey, eggs, cheese, seeds
  gut_health_status: 'frequent_gi_distress' | 'occasional_bloating' | 'healthy_regular';
  daily_sunlight_lux_exposure_mins: number; // 0..180
  nighttime_melatonin_transition_calm: boolean; // ease of unwinding at night
  chronic_irritability_or_carb_craving: boolean; // common low serotonin somatic proxy
}

export interface SerotoninManagerResult {
  serotonin_somatic_score: number; // 0..100
  serotonin_balance_tier: 'suboptimal-depleted' | 'moderate-fluctuating' | 'optimal-harmonized';
  warnings: string[];
}

export function manageSerotonin(input: SerotoninManagerInput): SerotoninManagerResult {
  const {
    tryptophan_rich_food_intake,
    gut_health_status,
    daily_sunlight_lux_exposure_mins,
    nighttime_melatonin_transition_calm,
    chronic_irritability_or_carb_craving,
  } = input;

  const warnings: string[] = ['educational_serotonin_pathway_screen'];
  let score = 25; // baseline

  // Tryptophan supply
  if (tryptophan_rich_food_intake === 'optimal') {
    score += 25;
  } else if (tryptophan_rich_food_intake === 'moderate') {
    score += 15;
  } else {
    warnings.push('insufficient_tryptophan_substrate_limits_central_and_enteric_serotonin_synthesis');
  }

  // Gut microbiome (enterochromaffin cells)
  if (gut_health_status === 'healthy_regular') {
    score += 25;
  } else if (gut_health_status === 'occasional_bloating') {
    score += 10;
  } else {
    score -= 15;
    warnings.push('impaired_gut_microbiome_compromises_enterochromaffin_serotonin_production');
  }

  // Sunlight (retinal raphe nuclei activation)
  if (daily_sunlight_lux_exposure_mins >= 30) {
    score += 20;
  } else if (daily_sunlight_lux_exposure_mins >= 15) {
    score += 10;
  } else {
    warnings.push('insufficient_bright_light_reduces_tryptophan_hydroxylase_2_activity');
  }

  // Melatonin transition (serotonin converts to melatonin via AANAT)
  if (nighttime_melatonin_transition_calm) {
    score += 15;
  }

  // Irritability / carb cravings
  if (chronic_irritability_or_carb_craving) {
    score -= 15;
    warnings.push('recurrent_evening_carbohydrate_cravings_often_reflect_attempted_tryptophan_insulin_transport');
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let tier: SerotoninManagerResult['serotonin_balance_tier'] = 'moderate-fluctuating';
  if (finalScore >= 75) {
    tier = 'optimal-harmonized';
  } else if (finalScore <= 40) {
    tier = 'suboptimal-depleted';
  }

  return {
    serotonin_somatic_score: finalScore,
    serotonin_balance_tier: tier,
    warnings,
  };
}
