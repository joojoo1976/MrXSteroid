/**
 * Tool #103 - Renal Function & Hydration Index
 * Layer 1: Pure TypeScript clinical EDUCATION model.
 *
 * SCOPE: uses the CKD-EPI 2021 creatinine equation (race-free, the current
 * international standard). This is an ESTIMATE for education only - never a
 * diagnosis of renal function. Hydration context is a simple fluid-balance
 * model. Always state that a clinician + lab confirmation is required.
 *
 * CKD-EPI 2021 (creatinine, race-free):
 *   eGFR = 142 x min(Scr/kappa, 1)^alpha x max(Scr/kappa, 1)^(-1.200) x 0.9938^age
 *   with the sex coefficient x 1.012 for females.
 *   kappa = 0.7 (F) / 0.9 (M); alpha = -0.241 (F) / -0.302 (M)
 *   Valid range Scr 0.3-4.0 mg/dL (result flagged outside it).
 */

export type Sex = 'male' | 'female';

/** CKD-EPI 2021 kappa constant by sex. */
export function kappaForSex(sex: Sex): number {
  return sex === 'female' ? 0.7 : 0.9;
}

/** CKD-EPI 2021 alpha constant by sex. */
export function alphaForSex(sex: Sex): number {
  return sex === 'female' ? -0.241 : -0.302;
}

/**
 * eGFR (mL/min/1.73 m2) via CKD-EPI 2021 creatinine equation.
 * Scr in mg/dL. Returns null when Scr is outside the validated range.
 */
export function calculateEgfrCkdEpi2021(scrMgDl: number, ageYears: number, sex: Sex): number | null {
  if (scrMgDl < 0.3 || scrMgDl > 4.0) return null;
  const kappa = kappaForSex(sex);
  const alpha = alphaForSex(sex);
  const ratio = scrMgDl / kappa;
  const egfr =
    142 *
    Math.pow(Math.min(ratio, 1), alpha) *
    Math.pow(Math.max(ratio, 1), -1.2) *
    Math.pow(0.9938, ageYears);
  return Math.round(sex === 'female' ? egfr * 1.012 : egfr);
}

/** KDIGO eGFR category (G1-G5). */
export function egfrCategory(egfr: number | null): 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5' | 'invalid' {
  if (egfr === null) return 'invalid';
  if (egfr >= 90) return 'G1';
  if (egfr >= 60) return 'G2';
  if (egfr >= 45) return 'G3a';
  if (egfr >= 30) return 'G3b';
  if (egfr >= 15) return 'G4';
  return 'G5';
}

export type HydrationStatus = 'well-hydrated' | 'mild-dehydration-risk' | 'dehydration-flagged';

/**
 * Hydration index 0-100 from estimated fluid balance.
 * higher = better hydrated. `fluid_intake_liters` vs a body-weight-scaled
 * target of 30 ml/kg/day, adjusted for climate and training sweat losses.
 */
export function calculateHydrationIndex(
  fluidIntakeLiters: number,
  bodyWeightKg: number,
  climate: 'temperate' | 'hot_humid',
  trainingSweatLiters: number,
): { hydration_index: number; hydration_status: HydrationStatus; target_fluid_liters: number } {
  const climateFactor = climate === 'hot_humid' ? 1.15 : 1.0;
  const target = (bodyWeightKg * 30 * climateFactor) / 1000 + trainingSweatLiters;
  const ratio = target > 0 ? fluidIntakeLiters / target : 1;
  const index = Math.round(Math.max(0, Math.min(100, ratio * 100)));
  let status: HydrationStatus;
  if (index >= 85) status = 'well-hydrated';
  else if (index >= 60) status = 'mild-dehydration-risk';
  else status = 'dehydration-flagged';
  return { hydration_index: index, hydration_status: status, target_fluid_liters: Math.round(target * 10) / 10 };
}

export interface RenalFunctionInput {
  serum_creatinine_mg_dl: number;
  age_years: number;
  sex: Sex;
  body_weight_kg: number;
  fluid_intake_liters: number;
  climate: 'temperate' | 'hot_humid';
  training_sweat_liters: number;
}

export interface RenalFunctionResult {
  egfr_ml_min_1_73: number | null;
  egfr_valid: boolean;
  egfr_category: string;
  hydration_index: number;
  hydration_status: HydrationStatus;
  target_fluid_liters: number;
  monitoring_flags: string[];
  scope_notice: string;
}

export function calculateRenalFunction(input: RenalFunctionInput): RenalFunctionResult {
  const egfr = calculateEgfrCkdEpi2021(input.serum_creatinine_mg_dl, input.age_years, input.sex);
  const category = egfrCategory(egfr);
  const hydration = calculateHydrationIndex(
    input.fluid_intake_liters,
    input.body_weight_kg,
    input.climate,
    input.training_sweat_liters,
  );

  const monitoring_flags: string[] = [];
  if (egfr === null) {
    monitoring_flags.push('creatinine_outside_ckd_epi_2021_validated_range_0_3_to_4_0_mg_dl');
  } else if (egfr < 60) {
    monitoring_flags.push('estimated_egfr_below_60_indicates_possible_ckd_range_clinician_review_required');
  } else if (egfr < 90) {
    monitoring_flags.push('estimated_egfr_60_to_89_monitor_trend_over_time');
  }
  if (category === 'G3a' || category === 'G3b') {
    monitoring_flags.push('moderate_reduction_requires_nephrology_referral_per_kdigo_guidance');
  }
  if (category === 'G4' || category === 'G5') {
    monitoring_flags.push('severely_reduced_egfr_urgent_specialist_review_required');
  }
  if (hydration.hydration_status === 'dehydration-flagged') {
    monitoring_flags.push('hydration_deficit_can_inflate_serum_creatinine_recheck_after_rehydration');
  }
  if (input.climate === 'hot_humid' && hydration.hydration_status !== 'well-hydrated') {
    monitoring_flags.push('hot_humid_climate_increases_insensible_fluid_loss_adjust_intake');
  }

  return {
    egfr_ml_min_1_73: egfr,
    egfr_valid: egfr !== null,
    egfr_category: category,
    hydration_index: hydration.hydration_index,
    hydration_status: hydration.hydration_status,
    target_fluid_liters: hydration.target_fluid_liters,
    monitoring_flags,
    scope_notice:
      'educational_ckd_epi_2021_estimate_only_not_a_diagnosis_of_renal_function_or_hydration_status',
  };
}

