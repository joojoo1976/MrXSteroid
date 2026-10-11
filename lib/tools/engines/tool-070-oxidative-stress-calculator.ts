/**
 * Tool #070 — Oxidative Stress Calculator
 * Scans oxidative stress burden score based on physiological, metabolic,
 * lifestyle, and pharmacology markers (e.g. smoking/vaping, training volume,
 * sleep, fasting blood glucose or metabolic syndrome markers, AAS dosage burden).
 * Educational risk-scoring heuristic based on published redox biology concepts.
 * Pure deterministic engine.
 */

export interface OxidativeStressInput {
  sleep_hours_per_night: number; // 3..12
  hard_training_hours_week: number; // 0..25
  smoker_or_vaper: boolean;
  high_sugar_ultraprocessed_diet: boolean;
  androgen_dose_weekly_mg: number; // 0..3000
  antioxidant_support_adequate: boolean;
}

export interface OxidativeStressResult {
  oxidative_burden_score: number; // 0..100 (higher = worse burden)
  burden_tier: 'low-oxidative-stress' | 'moderate-oxidative-stress' | 'high-oxidative-stress';
  mitigating_priorities: string[];
  warnings: string[];
}

export function calculateOxidativeStress(input: OxidativeStressInput): OxidativeStressResult {
  const {
    sleep_hours_per_night,
    hard_training_hours_week,
    smoker_or_vaper,
    high_sugar_ultraprocessed_diet,
    androgen_dose_weekly_mg,
    antioxidant_support_adequate,
  } = input;

  const warnings: string[] = ['educational_redox_burden_screen'];
  const mitigating_priorities: string[] = [];

  let burden = 10; // baseline natural biological oxidative turnover

  // Sleep deficit
  if (sleep_hours_per_night < 6) {
    burden += 20;
    mitigating_priorities.push('prioritize_7h_plus_sleep');
  } else if (sleep_hours_per_night < 7) {
    burden += 10;
  }

  // Extreme training without adequate recovery
  if (hard_training_hours_week > 12) {
    burden += 20;
    mitigating_priorities.push('manage_excessive_training_volume');
  } else if (hard_training_hours_week > 7) {
    burden += 10;
  }

  // Tobacco / Inhalation
  if (smoker_or_vaper) {
    burden += 25;
    warnings.push('smoking_vaping_primary_oxidative_driver');
    mitigating_priorities.push('cessation_of_inhalation_compounds');
  }

  // Diet
  if (high_sugar_ultraprocessed_diet) {
    burden += 15;
    mitigating_priorities.push('reduce_ultraprocessed_sugars');
  }

  // Androgen load (elevated metabolic rate, mitochondrial ROS)
  if (androgen_dose_weekly_mg >= 750) {
    burden += 20;
    warnings.push('supraphysiological_androgen_redox_strain');
  } else if (androgen_dose_weekly_mg >= 300) {
    burden += 10;
  }

  // Mitigating antioxidant capacity
  if (antioxidant_support_adequate) {
    burden -= 15;
  } else {
    mitigating_priorities.push('incorporate_polyphenol_rich_whole_foods');
  }

  burden = Math.max(0, Math.min(100, burden));

  let burden_tier: OxidativeStressResult['burden_tier'];
  if (burden <= 30) {
    burden_tier = 'low-oxidative-stress';
  } else if (burden <= 60) {
    burden_tier = 'moderate-oxidative-stress';
  } else {
    burden_tier = 'high-oxidative-stress';
    warnings.push('high_oxidative_strain_endothelial_risk');
  }

  return {
    oxidative_burden_score: burden,
    burden_tier,
    mitigating_priorities,
    warnings: [...new Set(warnings)],
  };
}
