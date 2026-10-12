/**
 * Tool #104 - Thyroid Function & Metabolic Rate Dynamics
 * Layer 1: Pure TypeScript clinical EDUCATION model.
 *
 * SCOPE: estimates the metabolic-rate IMPACT of a TSH/T3/T4 pattern and
 * classifies the thyroid state using standard reference ranges. This is an
 * educational estimate - never a diagnosis of hypo/hyperthyroidism.
 *
 * Model
 * -----
 * BMR via the Mifflin-St Jeor equation; a thyroid multiplier is applied from
 * the free-T4 ratio to the reference midpoint. Clinical interpretation bands
 * follow standard lab reference ranges (TSH 0.4-4.0 mIU/L,
 * Free-T4 0.8-1.8 ng/dL, Free-T3 2.3-4.2 pg/mL).
 */

export type ThyroidState = 'primary-hypothyroidism-pattern' | 'subclinical-hypothyroidism-pattern' | 'euthyroid' | 'subclinical-hyperthyroidism-pattern' | 'hyperthyroidism-pattern' | 'indeterminate';

/** Mifflin-St Jeor BMR (kcal/day). */
export function mifflinStJeorBmr(weightKg: number, heightCm: number, ageYears: number, sex: 'male' | 'female'): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return Math.round(sex === 'male' ? base + 5 : base - 161);
}

/**
 * Metabolic-rate multiplier from the free-T4 ratio to the reference midpoint.
 * FT4 0.8-1.8 ng/dL, midpoint 1.3. Each 10 % below midpoint reduces BMR ~3 %,
 * each 10 % above raises it ~3 % (bounded 0.7-1.3).
 */
export function thyroidMetabolicMultiplier(freeT4NgDl: number): number {
  const midpoint = 1.3;
  const ratio = freeT4NgDl / midpoint;
  const delta = (ratio - 1) * 0.3;
  return Math.round(Math.max(0.7, Math.min(1.3, 1 + delta)) * 1000) / 1000;
}

export interface ThyroidInput {
  tsh_miu_l: number;
  free_t4_ng_dl: number;
  free_t3_pg_ml: number;
  age_years: number;
  sex: 'male' | 'female';
  weight_kg: number;
  height_cm: number;
}

export interface ThyroidResult {
  bmr_kcal: number;
  adjusted_bmr_kcal: number;
  metabolic_multiplier: number;
  thyroid_state: ThyroidState;
  interpretation_flags: string[];
  scope_notice: string;
}

export function calculateThyroidDynamics(input: ThyroidInput): ThyroidResult {
  const bmr = mifflinStJeorBmr(input.weight_kg, input.height_cm, input.age_years, input.sex);
  const multiplier = thyroidMetabolicMultiplier(input.free_t4_ng_dl);
  const adjusted = Math.round(bmr * multiplier);

  let state: ThyroidState = 'euthyroid';
  const tsh = input.tsh_miu_l;
  const ft4 = input.free_t4_ng_dl;

  if (tsh > 10 && ft4 < 0.8) state = 'primary-hypothyroidism-pattern';
  else if (tsh > 4 && tsh <= 10 && ft4 >= 0.8 && ft4 <= 1.8) state = 'subclinical-hypothyroidism-pattern';
  else if (tsh < 0.4 && ft4 > 1.8) state = 'hyperthyroidism-pattern';
  else if (tsh < 0.4 && ft4 <= 1.8) state = 'subclinical-hyperthyroidism-pattern';
  else if (tsh > 4 || ft4 < 0.8 || ft4 > 1.8) state = 'indeterminate';

  const interpretation_flags: string[] = [];
  if (state === 'primary-hypothyroidism-pattern') {
    interpretation_flags.push('high_tsh_with_low_ft4_is_classic_primary_hypothyroidism_pattern_endocrinology_review_required');
  } else if (state === 'subclinical-hypothyroidism-pattern') {
    interpretation_flags.push('mildly_elevated_tsh_with_normal_ft4_is_subclinical_pattern_monitor_and_discuss_with_clinician');
  } else if (state === 'hyperthyroidism-pattern') {
    interpretation_flags.push('low_tsh_with_high_ft4_suggests_hyperthyroid_pattern_urgent_clinician_review_required');
  } else if (state === 'subclinical-hyperthyroidism-pattern') {
    interpretation_flags.push('suppressed_tsh_with_normal_ft4_is_subclinical_hyperthyroid_pattern_monitor');
  } else if (state === 'indeterminate') {
    interpretation_flags.push('discordant_tsh_and_ft4_pattern_requires_repeat_testing_and_clinical_correlation');
  }
  if (multiplier < 0.9) interpretation_flags.push('low_ft4_ratio_lowers_estimated_metabolic_rate');
  if (multiplier > 1.1) interpretation_flags.push('high_ft4_ratio_raises_estimated_metabolic_rate');

  return {
    bmr_kcal: bmr,
    adjusted_bmr_kcal: adjusted,
    metabolic_multiplier: multiplier,
    thyroid_state: state,
    interpretation_flags,
    scope_notice:
      'educational_thyroid_metabolic_estimate_only_not_a_diagnosis_of_thyroid_dysfunction',
  };
}

