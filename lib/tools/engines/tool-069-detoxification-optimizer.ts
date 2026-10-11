/**
 * Tool #069 — Detoxification Optimizer
 * Hepatic clearance & biological detoxification support assessment.
 * Evaluates evidence-based physiological lifestyle and nutrient support factors
 * (hydration, dietary fiber, cruciferous vegetables/sulforaphane sources, NAC/glutathione precursor status, alcohol abstinence).
 * Important: This tool evaluates lifestyle support factors for normal endogenous hepatic function.
 * It strictly avoids pseudoscientific "detox cure" claims or unproven formulas.
 * Pure deterministic educational engine.
 */

export interface DetoxificationInput {
  daily_water_liters: number; // 0.5..6.0
  daily_fiber_grams: number; // 5..60
  cruciferous_servings_week: number; // 0..21
  alcohol_drinks_week: number; // 0..50
  takes_nac_or_glutathione_support: boolean;
  oral_compounds_present: boolean;
}

export interface DetoxificationResult {
  hepatic_support_score: number; // 0..100
  support_tier: 'suboptimal-support' | 'moderate-support' | 'optimal-support';
  key_recommendations: string[];
  warnings: string[];
}

export function optimizeDetoxification(input: DetoxificationInput): DetoxificationResult {
  const {
    daily_water_liters,
    daily_fiber_grams,
    cruciferous_servings_week,
    alcohol_drinks_week,
    takes_nac_or_glutathione_support,
    oral_compounds_present,
  } = input;

  const warnings: string[] = ['evidence_based_physiological_support_only'];
  const key_recommendations: string[] = [];

  let score = 20; // baseline

  // Hydration (max +20)
  if (daily_water_liters >= 3.0) {
    score += 20;
  } else if (daily_water_liters >= 2.0) {
    score += 12;
  } else {
    key_recommendations.push('increase_hydration_3l');
  }

  // Fiber (Phase 3 excretion support: max +20)
  if (daily_fiber_grams >= 30) {
    score += 20;
  } else if (daily_fiber_grams >= 20) {
    score += 10;
  } else {
    key_recommendations.push('increase_dietary_fiber_30g');
  }

  // Cruciferous (Phase 2 glucuronidation/sulfation support: max +15)
  if (cruciferous_servings_week >= 5) {
    score += 15;
  } else if (cruciferous_servings_week >= 2) {
    score += 8;
  } else {
    key_recommendations.push('consume_cruciferous_veg_5x_week');
  }

  // Antioxidant / Glutathione precursor (+15)
  if (takes_nac_or_glutathione_support) {
    score += 15;
  } else if (oral_compounds_present) {
    key_recommendations.push('consider_nac_or_tudca_with_physician');
  }

  // Alcohol burden penalty (up to -30)
  if (alcohol_drinks_week > 7) {
    score -= 25;
    warnings.push('alcohol_compounds_hepatic_burden');
  } else if (alcohol_drinks_week > 2) {
    score -= 10;
  }

  // Oral 17aa compound presence alert
  if (oral_compounds_present) {
    warnings.push('c17aa_orals_require_active_liver_enzyme_monitoring');
    if (alcohol_drinks_week > 0) {
      warnings.push('zero_alcohol_mandate_during_oral_use');
      score -= 10;
    }
  }

  score = Math.max(0, Math.min(100, score));

  let support_tier: DetoxificationResult['support_tier'];
  if (score < 45) {
    support_tier = 'suboptimal-support';
  } else if (score < 75) {
    support_tier = 'moderate-support';
  } else {
    support_tier = 'optimal-support';
  }

  return {
    hepatic_support_score: score,
    support_tier,
    key_recommendations,
    warnings: [...new Set(warnings)],
  };
}
