/**
 * Tool #072 — Systemic Inflammation Calculator
 * Scores systemic inflammatory risk based on laboratory markers (hs-CRP, ESR)
 * and clinical lifestyle drivers (visceral adiposity, sleep deprivation, ultra-processed diet).
 * Educational risk screening index — laboratory hs-CRP is the gold standard biomarker.
 */

export interface SystemicInflammationInput {
  hs_crp_mg_l?: number; // 0.1..30 (optional lab value)
  waist_circumference_cm: number; // 60..150
  sleep_hours_per_night: number; // 3..12
  smoker_or_heavy_alcohol: boolean;
  chronic_joint_pain: boolean;
}

export interface SystemicInflammationResult {
  inflammation_risk_score: number; // 0..100
  risk_band: 'low-inflammatory-burden' | 'moderate-inflammatory-burden' | 'high-inflammatory-burden';
  crp_context: 'optimal' | 'moderate-cardio-risk' | 'high-systemic-risk' | 'not-tested';
  warnings: string[];
}

export function calculateSystemicInflammation(input: SystemicInflammationInput): SystemicInflammationResult {
  const {
    hs_crp_mg_l,
    waist_circumference_cm,
    sleep_hours_per_night,
    smoker_or_heavy_alcohol,
    chronic_joint_pain,
  } = input;

  const warnings: string[] = ['educational_inflammatory_burden_screen'];

  let score = 10; // baseline

  let crp_context: SystemicInflammationResult['crp_context'] = 'not-tested';
  if (typeof hs_crp_mg_l === 'number') {
    if (hs_crp_mg_l < 1.0) {
      crp_context = 'optimal';
    } else if (hs_crp_mg_l <= 3.0) {
      crp_context = 'moderate-cardio-risk';
      score += 25;
      warnings.push('hs_crp_elevated_moderate_cardiovascular_risk');
    } else {
      crp_context = 'high-systemic-risk';
      score += 45;
      warnings.push('hs_crp_over_3_high_systemic_inflammatory_state');
    }
  }

  // Visceral adiposity / Waist circumference (metabolic endotoxemia contributor)
  if (waist_circumference_cm >= 102) {
    score += 25;
    warnings.push('visceral_adiposity_significant_inflammatory_cytokine_source');
  } else if (waist_circumference_cm >= 94) {
    score += 15;
  }

  // Sleep deficit
  if (sleep_hours_per_night < 6) {
    score += 15;
  }

  // Lifestyle stressors
  if (smoker_or_heavy_alcohol) {
    score += 20;
    warnings.push('toxic_inhalation_alcohol_fuels_systemic_cytokines');
  }

  if (chronic_joint_pain) {
    score += 10;
  }

  score = Math.max(0, Math.min(100, score));

  let risk_band: SystemicInflammationResult['risk_band'];
  if (score <= 30) {
    risk_band = 'low-inflammatory-burden';
  } else if (score <= 65) {
    risk_band = 'moderate-inflammatory-burden';
  } else {
    risk_band = 'high-inflammatory-burden';
  }

  return {
    inflammation_risk_score: score,
    risk_band,
    crp_context,
    warnings: [...new Set(warnings)],
  };
}
