/**
 * Tool #079 — Fat Metabolism Calculator
 * Calculates estimated substrate oxidation dynamics:
 * - Fat oxidation rate (g/h) across exercise intensities (FatMax zone estimation).
 * - Basal lipolytic capacity vs carbohydrate reliance.
 * - Respiratory Exchange Ratio (RER) estimation under aerobic training conditions.
 */

export interface FatMetabolismInput {
  body_weight_kg: number; // 40..200
  body_fat_pct?: number; // 5..50
  vo2max_ml_kg_min?: number; // 20..85
  heart_rate_bpm: number; // 50..210
  resting_heart_rate_bpm: number; // 40..100
  fasted_state: boolean;
}

export interface FatMetabolismResult {
  estimated_fat_oxidation_g_hr: number; // estimated g/hr
  estimated_carb_oxidation_g_hr: number; // estimated g/hr
  estimated_rer: number; // 0.70 .. 1.00
  zone_state: 'predominantly-fat' | 'balanced-crossover' | 'predominantly-glycolytic';
  warnings: string[];
}

export function calculateFatMetabolism(input: FatMetabolismInput): FatMetabolismResult {
  const {
    body_weight_kg,
    body_fat_pct = 15,
    vo2max_ml_kg_min = 45,
    heart_rate_bpm,
    resting_heart_rate_bpm,
    fasted_state,
  } = input;

  const warnings: string[] = ['educational_fat_oxidation_estimation'];

  // Heart rate reserve (HRR) approximation
  const maxHr = 220 - 28; // standard estimation
  const hrr = Math.max(0, Math.min(1, (heart_rate_bpm - resting_heart_rate_bpm) / (maxHr - resting_heart_rate_bpm)));

  // FatMax is typically around 45% - 65% of VO2max / HRR
  // Substrate crossover model:
  // At low intensity (HRR < 0.3): RER ~ 0.75-0.80
  // At FatMax (HRR ~ 0.50): Fat oxidation peaks (~0.4 - 0.7 g/min = 24 - 42 g/hr)
  // At high intensity (HRR > 0.80): RER -> 1.00, fat oxidation drops towards 0
  let baseFatRateGhr = 0;
  let baseCarbRateGhr = 0;
  let rer = 0.75;

  if (hrr <= 0.2) {
    // Rest / very low
    rer = 0.80;
    baseFatRateGhr = 15;
    baseCarbRateGhr = 10;
  } else if (hrr <= 0.6) {
    // Moderate / FatMax zone
    rer = 0.82 + (hrr - 0.2) * 0.25; // 0.82 -> 0.92
    baseFatRateGhr = 35 + (vo2max_ml_kg_min / 45) * 10;
    baseCarbRateGhr = 40 * (hrr / 0.5);
  } else {
    // High intensity glycolytic
    rer = Math.min(1.0, 0.92 + (hrr - 0.6) * 0.2);
    baseFatRateGhr = Math.max(5, 30 - (hrr - 0.6) * 60);
    baseCarbRateGhr = 60 + (hrr - 0.6) * 120;
  }

  // Fasted state boost to lipolysis (~20-30% higher fat oxidation at low/mod intensity)
  if (fasted_state && hrr < 0.7) {
    baseFatRateGhr *= 1.25;
    baseCarbRateGhr *= 0.8;
    rer = Math.max(0.72, rer - 0.04);
  } else if (!fasted_state) {
    warnings.push('postprandial_insulin_elevations_suppress_free_fatty_acid_oxidation');
  }

  // Lean mass scaling
  const leanMassKg = body_weight_kg * (1 - body_fat_pct / 100);
  const scaling = leanMassKg / 70;
  baseFatRateGhr *= scaling;
  baseCarbRateGhr *= scaling;

  let zone_state: FatMetabolismResult['zone_state'] = 'balanced-crossover';
  if (rer <= 0.82) {
    zone_state = 'predominantly-fat';
  } else if (rer >= 0.92) {
    zone_state = 'predominantly-glycolytic';
  }

  return {
    estimated_fat_oxidation_g_hr: Math.round(baseFatRateGhr * 10) / 10,
    estimated_carb_oxidation_g_hr: Math.round(baseCarbRateGhr * 10) / 10,
    estimated_rer: Math.round(rer * 100) / 100,
    zone_state,
    warnings,
  };
}
