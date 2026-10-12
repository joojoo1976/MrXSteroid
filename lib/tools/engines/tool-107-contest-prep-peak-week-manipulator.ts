/**
 * Tool #107 - Contest Prep Peak-Week Manipulator
 * Layer 1: deterministic educational phase-timeline model.
 *
 * SCOPE BOUNDARY: the engine returns an educational phase schedule with
 * reference ranges only. It never emits a medical protocol, a diuretic
 * prescription, a sodium clamp plan, or a dosing schedule. All numeric
 * outputs are reference ranges from published contest-prep literature
 * for planning discussion only.
 */

export type Sex = 'male' | 'female';
export type Stage = 'weeks_before' | 'day_before' | 'show_day';
export type Hydration = 'normal' | 'mild' | 'severe';
export type TanStability = 'low' | 'medium' | 'high';

export interface ContestPrepInput {
  days_until_show: number;
  sex: Sex;
  weight_kg: number;
  hydration_status: Hydration;
  tan_stability: TanStability;
  show_stage_format: 'bodybuilding' | 'physique' | 'figure' | 'bikini';
}

export interface PhaseStep {
  days_before: number;
  phase: Stage;
  action: string;
  reference_text: string;
}

export interface ContestPrepResult {
  phase_steps: PhaseStep[];
  dehydration_risk_tier: 'low' | 'moderate' | 'high';
  sodium_ref_mg_day: number[];
  water_ref_liters: number[];
  checklist_ref: string[];
  education_flags: string[];
  scope_notice: string;
}

const MIN_SODIUM_MG = 500;
const MAX_SODIUM_MG = 2000;

export function buildPhaseTimeline(input: ContestPrepInput): ContestPrepResult {
  const { days_until_show, sex, weight_kg, hydration_status, tan_stability } = input;

  const sodiumRef: number[] = [];
  const sodiumDays = Math.min(days_until_show, 21);
  for (let i = 0; i < sodiumDays; i++) {
    // Linear ramp across the window so the endpoints are exactly 500 and 2000.
    sodiumRef.push(MIN_SODIUM_MG + Math.round((MAX_SODIUM_MG - MIN_SODIUM_MG) * (i / Math.max(1, sodiumDays - 1))));
  }

  const waterRefL = [weight_kg * (0.03 + (sex === 'male' ? 0.005 : 0.002)), weight_kg * 0.04];

  const steps: PhaseStep[] = [];
  const days = days_until_show;

  if (days >= 21) {
    steps.push({
      days_before: -21,
      phase: 'weeks_before',
      action: 'establish_baseline_water_and_sodium_management',
      reference_text: 'sodium_reference_range_500_to_2000_mg_day_with_educational_note_contest_show_period',
    });
  }

  // Walk from the furthest-away day down to show day so every checkpoint can
  // fire exactly once and the timeline is ordered away-from-show -> show.
  for (let d = days; d >= 0; d--) {
    if (d === 14) {
      steps.push({
        days_before: -14,
        phase: 'weeks_before',
        action: 'begin_targeted_texture_and_skin_reference_maintenance',
        reference_text: tan_stability === 'high' ? 'tan_referenced_as_supplement_not_prescription' : 'tan_maintenance_skin_health',
      });
    }
    if (d === 7) {
      steps.push({
        days_before: -7,
        phase: 'weeks_before',
        action: 'hydration_status_review_and_water_reference_adjustment',
        reference_text: hydrationStatusRef(hydration_status),
      });
    }
    if (d === 3) {
      steps.push({
        days_before: -3,
        phase: 'day_before',
        action: 'carb_ref_and_water_ref_review',
        reference_text: 'carb_and_water_reference_bands_only_no_prescription',
      });
    }
    if (d === 1) {
      steps.push({
        days_before: -1,
        phase: 'day_before',
        action: 'do_not_try_new_policy_stage',
        reference_text: 'new_policy_stage_should_not_be_attempted_within_72_hours_before_show',
      });
    }
    if (d === 0) {
      steps.push({
        days_before: 0,
        phase: 'show_day',
        action: 'stage_reference_and_grinding_checklist_retrieval',
        reference_text: 'stage_readiness_checklist_form_reference',
      });
    }
  }

  let dehydrationRisk: 'low' | 'moderate' | 'high' = 'low';
  if (hydration_status === 'severe') dehydrationRisk = 'high';
  else if (hydration_status === 'mild') dehydrationRisk = 'moderate';

  const flags: string[] = [
    'schedule_is_reference_only_not_a_prescription',
    'sodium_response_varies_individual_to_individual',
    'bodybuilding_category_markup_varies_by_show_stage',
  ];

  return {
    phase_steps: steps,
    dehydration_risk_tier: dehydrationRisk,
    sodium_ref_mg_day: sodiumRef,
    water_ref_liters: waterRefL,
    checklist_ref: [
      'show_day_grooming_and_props_checklist',
      'stage_walk_and_grinding_routine_reference',
      'tan_and_makeup_reference',
      'photo_and_backstage_ref',
    ],
    education_flags: flags,
    scope_notice: 'educational_contest_prep_reference_timeline_not_a_medical_or_dietetic_prescription',
  };
}

function hydrationStatusRef(status: Hydration): string {
  if (status === 'severe') return 'severe_hydration_flag_clinician_review_required';
  if (status === 'mild') return 'mild_hydration_risk_monitor_and_review';
  return 'normal_hydration_reference';
}
