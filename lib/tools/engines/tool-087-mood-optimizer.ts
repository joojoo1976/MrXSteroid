/**
 * Tool #087 — Mood Optimizer
 * Evaluates lifestyle and neurochemical precursors supporting affective stability,
 * positive valence, social connectedness, and emotional resilience.
 *
 * NOTE: Educational screening score based on positive psychology and neurobiology
 * of affect; not a psychiatric diagnostic tool (e.g. PHQ-9 / GAD-7).
 */

export interface MoodOptimizerInput {
  sunlight_outdoor_minutes_daily: number; // 0..300
  social_connection_satisfaction: 'isolated' | 'moderate' | 'strong';
  physical_activity_days_weekly: number; // 0..7
  omega3_and_micronutrient_sufficiency: boolean; // B-complex, magnesium, zinc, D3
  chronic_work_overload_burnout: boolean;
  subjective_anhedonia_present: boolean; // loss of interest or pleasure
}

export interface MoodOptimizerResult {
  affective_resilience_score: number; // 0..100
  affective_balance_tier: 'depleted-vulnerable' | 'moderate-stability' | 'robust-flourishing';
  warnings: string[];
}

export function optimizeMood(input: MoodOptimizerInput): MoodOptimizerResult {
  const {
    sunlight_outdoor_minutes_daily,
    social_connection_satisfaction,
    physical_activity_days_weekly,
    omega3_and_micronutrient_sufficiency,
    chronic_work_overload_burnout,
    subjective_anhedonia_present,
  } = input;

  const warnings: string[] = ['educational_affective_resilience_screen'];
  let score = 25; // baseline

  // Sunlight
  if (sunlight_outdoor_minutes_daily >= 45) {
    score += 20;
  } else if (sunlight_outdoor_minutes_daily >= 20) {
    score += 12;
  } else {
    warnings.push('minimal_sunlight_exposure_compromises_serotonin_synthesis_and_circadian_entrainment');
  }

  // Social connection (oxytocin / vagal tone)
  if (social_connection_satisfaction === 'strong') {
    score += 25;
  } else if (social_connection_satisfaction === 'moderate') {
    score += 12;
  } else {
    score -= 10;
    warnings.push('social_isolation_is_a_potent_driver_of_pro_inflammatory_neurochemical_states');
  }

  // Physical exercise (endorphin & endocannabinoid tone)
  if (physical_activity_days_weekly >= 4) {
    score += 20;
  } else if (physical_activity_days_weekly >= 2) {
    score += 10;
  }

  // Nutrition
  if (omega3_and_micronutrient_sufficiency) {
    score += 15;
  }

  // Burnout
  if (chronic_work_overload_burnout) {
    score -= 20;
    warnings.push('chronic_burnout_blunts_fronto_limbic_inhibitory_control');
  }

  // Anhedonia
  if (subjective_anhedonia_present) {
    score -= 25;
    warnings.push('persistent_anhedonia_warrants_evaluation_by_a_licensed_mental_health_professional');
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let tier: MoodOptimizerResult['affective_balance_tier'] = 'moderate-stability';
  if (finalScore >= 75) {
    tier = 'robust-flourishing';
  } else if (finalScore <= 40) {
    tier = 'depleted-vulnerable';
  }

  return {
    affective_resilience_score: finalScore,
    affective_balance_tier: tier,
    warnings,
  };
}
