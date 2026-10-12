/**
 * Tool #106 - Glycogen Supercompensation & Water Retention Modeler
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY (spec warning §106): this model is a reference calc from
 * user-supplied anthropometrics. It never outputs a contest prescription,
 * a carb dose, or a diuretic/sodium protocol. Values are published-calc
 * ranges, not coaching instructions.
 *
 * Model
 * -----
 * Muscle glycogen storage ceiling is estimated from lean mass (≈15 g/kg
 * lean + ~150-200 g baseline), liver glycogen ≈100 g. A supercompensation
 * target is the minimum of the ceiling and the carb budget implied by
 * target_carb_g_per_kg x days x 1000. Water retention is modeled as
 * 2.5-3.5 g water per g glycogen (published ratio), capped at the
 * lean-mass-implied plasma-volume ceiling.
 */

export type TrainingLoad = 'low' | 'medium' | 'high';
export type GiRisk = 'low' | 'medium' | 'high';

export interface GlycogenInput {
  body_weight_kg: number;
  lean_mass_kg: number;
  training_load: TrainingLoad;
  target_carbs_g_per_kg: number;
  days: number;
  baseline_glycogen_g: number;
}

export interface GlycogenResult {
  predicted_max_glycogen_g: number;
  muscle_glycogen_g: number;
  liver_glycogen_g: number;
  total_glycogen_g: number;
  water_retention_liters: number;
  total_water_retention_liters: number;
  carb_budget_per_day_g: number;
  total_carb_g: number;
  gi_risk: GiRisk;
  gi_notes: string[];
  education_flags: string[];
  scope_notice: string;
}

const LIVER_GLYCOGEN_g = 100;
const WATER_PER_GLYCOGEN_g = 2.7;
const GI_RISK_THRESHOLD_g_per_kg = 12;
const HIGH_GI_LOAD_g_per_kg = 10;

export function calcMaxMuscleGlycogen(leanKg: number): number {
  return Math.round((leanKg * 15 + 150) * 10) / 10;
}

export function calcGlycogenModel(input: GlycogenInput): GlycogenResult {
  const { lean_mass_kg, target_carbs_g_per_kg, days, baseline_glycogen_g } = input;

  const maxMuscle = calcMaxMuscleGlycogen(lean_mass_kg);
  const liver = LIVER_GLYCOGEN_g;
  const carbBudgetTotal = target_carbs_g_per_kg * 1000 * days;

  const predicted = Math.max(baseline_glycogen_g, Math.min(maxMuscle * 0.92, Math.min(carbBudgetTotal, 600)));
  const water = Math.min(predicted * WATER_PER_GLYCOGEN_g / 1000, lean_mass_kg * 0.25 + 1);

  const giRisk: GiRisk = target_carbs_g_per_kg >= GI_RISK_THRESHOLD_g_per_kg
    ? 'high'
    : target_carbs_g_per_kg >= HIGH_GI_LOAD_g_per_kg
      ? 'medium'
      : 'low';

  return {
    predicted_max_glycogen_g: Math.round(predicted * 10) / 10,
    muscle_glycogen_g: Math.round((predicted - liver) * 10) / 10,
    liver_glycogen_g: liver,
    total_glycogen_g: Math.round(predicted * 10) / 10,
    water_retention_liters: Math.round(water * 10) / 10,
    total_water_retention_liters: Math.round(water * 10) / 10,
    carb_budget_per_day_g: Math.round(target_carbs_g_per_kg * 10) / 10,
    total_carb_g: Math.round(carbBudgetTotal),
    gi_risk: giRisk,
    gi_notes: giRisk === 'high'
      ? ['very_high_carbs_relative_to_body_mass_increases_digestive_discomfort_risk']
      : giRisk === 'medium'
        ? ['carb_load_moderate_may_cause_mild_bloating_in_sensitive_individuals']
        : ['low_gi_load_supporting_reference_period_for_supercompensation'],
    education_flags: [
      'values_are_reference_calculations_not_coaching_prescriptions',
      'water_retention_is_predicted_from_glycogen_storage_not_actual_measurement',
      'carbohydrate_reference_only_used_for_educational_planning',
    ],
    scope_notice: 'educational_glycogen_and_water_reference_model_not_a_competition_protocol',
  };
}
