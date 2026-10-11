/**
 * Tool #081 — Cellular Aging Calculator
 * Educational screening model estimating relative phenotypic/cellular aging burden
 * based on lifestyle, metabolic stress markers, sun/radiation exposure, and sleep.
 *
 * NOTE: This is an educational multi-factorial risk estimator, NOT a biological
 * epigenetic methylation clock (e.g. Horvath / Hannum clock).
 */

export interface CellularAgingInput {
  chronological_age: number; // 18..90
  smoking_history: 'never' | 'former' | 'current';
  weekly_sun_protection_frequency: 'never' | 'sometimes' | 'always';
  average_sleep_hours: number; // 3..12
  ultra_processed_food_frequency: 'rare' | 'moderate' | 'high';
  regular_strength_training: boolean;
}

export interface CellularAgingResult {
  biological_age_delta_estimate: number; // e.g. -4 to +10 years relative estimate
  estimated_phenotypic_age: number; // chronological_age + delta
  cellular_stress_tier: 'resilient' | 'moderate-wear' | 'accelerated-stress';
  warnings: string[];
}

export function calculateCellularAging(input: CellularAgingInput): CellularAgingResult {
  const {
    chronological_age,
    smoking_history,
    weekly_sun_protection_frequency,
    average_sleep_hours,
    ultra_processed_food_frequency,
    regular_strength_training,
  } = input;

  const warnings: string[] = ['educational_cellular_aging_estimator'];
  let delta = 0;

  // Smoking impact
  if (smoking_history === 'current') {
    delta += 4.5;
    warnings.push('active_smoking_accelerates_cellular_senescence_and_dna_damage');
  } else if (smoking_history === 'former') {
    delta += 1.0;
  }

  // Sun / UV protection (photocutaneous aging)
  if (weekly_sun_protection_frequency === 'never') {
    delta += 2.0;
  } else if (weekly_sun_protection_frequency === 'always') {
    delta -= 1.0;
  }

  // Sleep debt / cellular repair
  if (average_sleep_hours < 6) {
    delta += 2.5;
    warnings.push('chronic_short_sleep_impairs_autophagy_and_cellular_turnover');
  } else if (average_sleep_hours >= 7 && average_sleep_hours <= 9) {
    delta -= 1.5;
  }

  // Nutrition / glycation burden
  if (ultra_processed_food_frequency === 'high') {
    delta += 2.5;
    warnings.push('high_ultra_processed_diet_accelerates_advanced_glycation_end_products');
  } else if (ultra_processed_food_frequency === 'rare') {
    delta -= 1.0;
  }

  // Exercise hormesis
  if (regular_strength_training) {
    delta -= 2.0;
  } else {
    delta += 1.0;
  }

  // Normalize delta to plausible educational boundaries (-6 to +12)
  const normalizedDelta = Number(Math.max(-6, Math.min(12, delta)).toFixed(1));
  const estimated_phenotypic_age = Number(Math.max(18, chronological_age + normalizedDelta).toFixed(1));

  let tier: CellularAgingResult['cellular_stress_tier'] = 'moderate-wear';
  if (normalizedDelta <= -1) {
    tier = 'resilient';
  } else if (normalizedDelta >= 3) {
    tier = 'accelerated-stress';
  }

  return {
    biological_age_delta_estimate: normalizedDelta,
    estimated_phenotypic_age,
    cellular_stress_tier: tier,
    warnings,
  };
}
