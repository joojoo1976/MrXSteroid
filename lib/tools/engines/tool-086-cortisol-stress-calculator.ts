/**
 * Tool #086 — Cortisol Stress Calculator
 * Evaluates HPA axis stress load, diurnal rhythm disruption indicators,
 * somatic tension, and catabolic risk markers.
 *
 * NOTE: Educational screening score based on cortisol awakening response (CAR)
 * literature and stress physiology; not a 4-point salivary cortisol lab assay.
 */

export interface CortisolStressInput {
  morning_exhaustion_rating: number; // 1..10 (feeling wiped out despite sleep)
  evening_tired_but_wired: boolean; // classic flat diurnal curve symptom
  daily_caffeine_cups: number; // 0..15
  resting_heart_rate_variability_trend: 'normal_high' | 'reduced' | 'chronically_low';
  intense_training_sessions_weekly: number; // 0..14
  life_stressors_level: 'low' | 'moderate' | 'high' | 'extreme';
}

export interface CortisolStressResult {
  cortisol_stress_load_score: number; // 0..100 (higher = higher stress/catabolic load)
  hpa_axis_status_tier: 'adaptive-balanced' | 'compensated-strain' | 'dysregulated-exhaustion';
  catabolic_risk_tier: 'low' | 'moderate' | 'high';
  warnings: string[];
}

export function calculateCortisolStress(input: CortisolStressInput): CortisolStressResult {
  const {
    morning_exhaustion_rating,
    evening_tired_but_wired,
    daily_caffeine_cups,
    resting_heart_rate_variability_trend,
    intense_training_sessions_weekly,
    life_stressors_level,
  } = input;

  const warnings: string[] = ['educational_cortisol_stress_screen'];
  let load = 15; // baseline

  // Morning exhaustion
  load += Math.round((morning_exhaustion_rating / 10) * 25);
  if (morning_exhaustion_rating >= 8) {
    warnings.push('severe_morning_exhaustion_correlates_with_blunted_cortisol_awakening_response');
  }

  // Evening tired but wired
  if (evening_tired_but_wired) {
    load += 20;
    warnings.push('evening_hyperarousal_indicates_elevated_nocturnal_cortisol_suppressing_melatonin');
  }

  // Caffeine reliance
  if (daily_caffeine_cups >= 5) {
    load += 15;
    warnings.push('high_caffeine_intake_artificially_sustains_adrenal_sympathetic_tone');
  } else if (daily_caffeine_cups >= 3) {
    load += 8;
  }

  // HRV trend
  if (resting_heart_rate_variability_trend === 'chronically_low') {
    load += 20;
    warnings.push('chronically_depressed_hrv_reflects_autonomic_nervous_system_overdrive');
  } else if (resting_heart_rate_variability_trend === 'reduced') {
    load += 10;
  }

  // Training load
  if (intense_training_sessions_weekly >= 7) {
    load += 15;
    warnings.push('daily_or_two_a_day_intense_training_without_recovery_increases_cortisol_to_testosterone_ratio');
  } else if (intense_training_sessions_weekly >= 5) {
    load += 8;
  }

  // Life stressors
  if (life_stressors_level === 'extreme') {
    load += 20;
  } else if (life_stressors_level === 'high') {
    load += 12;
  } else if (life_stressors_level === 'low') {
    load = Math.max(5, load - 10);
  }

  const finalScore = Math.max(0, Math.min(100, load));

  let statusTier: CortisolStressResult['hpa_axis_status_tier'] = 'compensated-strain';
  let catabolicTier: CortisolStressResult['catabolic_risk_tier'] = 'moderate';

  if (finalScore >= 70) {
    statusTier = 'dysregulated-exhaustion';
    catabolicTier = 'high';
  } else if (finalScore <= 35) {
    statusTier = 'adaptive-balanced';
    catabolicTier = 'low';
  }

  return {
    cortisol_stress_load_score: finalScore,
    hpa_axis_status_tier: statusTier,
    catabolic_risk_tier: catabolicTier,
    warnings,
  };
}
