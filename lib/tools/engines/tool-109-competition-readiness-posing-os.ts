/**
 * Tool #109 - Competition Readiness & Stage Posing OS
 * Layer 1: deterministic competition-readiness checklist model.
 *
 * SCOPE BOUNDARY: generates an educational stage-ready checklist
 * reference. It never prescribes a posing routine, a tan formula, jewelry
 * or accessory selection, or a medical protocol.
 */

export type Gender = 'male' | 'female';
export type ShowType = 'bodybuilding' | 'physique' | 'figure' | 'bikini';
export type PrepPhase = 'early' | 'late' | 'peak_week';
export type TanMaintenance = 'none' | 'auto' | 'manual';

export interface ReadinessInput {
  gender: Gender;
  show_type: ShowType;
  experience_years: number;
  prep_phase: PrepPhase;
  tan_maintenance: TanMaintenance;
  has_stage_photo_session: boolean;
}

export interface ChecklistItem {
  when: string;
  category: string;
  item_key: string;
  reference: string;
  done: boolean;
}

export interface ReadinessResult {
  checklist: ChecklistItem[];
  readiness_tier: 'ready_reference' | 'needs_review' | 'requires_planning';
  count_by_category: Record<string, number>;
  education_flags: string[];
  scope_notice: string;
}

function makeItem(when: string, category: string, key: string, reference: string, done = false): ChecklistItem {
  return { when, category, item_key: key, reference, done };
}

export function buildReadinessChecklist(input: ReadinessInput): ReadinessResult {
  const { show_type, experience_years, has_stage_photo_session } = input;

  const base: ChecklistItem[] = [
    makeItem('day_before', 'prep', 'show_day_prop_and_heels_reference', 'final_props_heels_stage_walk_routine_reference'),
    makeItem('day_before', 'visual', 'tan_and_makeup_reference', 'stage_tan_and_makeup_ref_only'),
    makeItem('day_before', 'visual', 'posing_routine_reference', 'posing_routine_template_form_reference'),
    makeItem('day_before', 'visual', 'photo_session_checklist', 'stage_photo_session_reference'),
    makeItem('week_before', 'prep', 'show_day_grooming_reference', 'show_day_grooming_reference'),
    makeItem('week_before', 'visual', 'tan_stability_and_retouch_window', 'tan_reference_retouch_schedule'),
    makeItem('week_before', 'visual', 'wearable_and_pro_delete_checklist', 'remove_wearable_jewelry_reference'),
    makeItem('week_before', 'prep', 'show_type_category_reference', 'show_type_category_category_form'),
    makeItem('early', 'prep', 'tan_plan_reference', 'tan_plan_reference'),
    makeItem('early', 'prep', 'stage_walk_and_grinding_reference', 'stage_walk_and_grinding_reference'),
  ];

  const refs = base.filter((i) => {
    if (show_type === 'bodybuilding') return true;
    if (show_type === 'physique') return !i.item_key.includes('bikini');
    if (show_type === 'figure') return true;
    if (show_type === 'bikini') return true;
    return true;
  });

  refs.push(makeItem('day_before', 'prep', 'show_day_selfie_and_props_reference', 'show_day_selfie_and_props_reference', has_stage_photo_session));

  const rate = experience_years >= 3 ? 'ready_reference' : experience_years >= 1 ? 'needs_review' : 'requires_planning';

  const catCount: Record<string, number> = {};
  for (const i of refs) {
    catCount[i.category] = (catCount[i.category] ?? 0) + 1;
  }

  return {
    checklist: refs,
    readiness_tier: rate,
    count_by_category: catCount,
    education_flags: [
      'checklist_is_reference_only_not_a_custom_stage_directive',
      'new_tan_or_makeup_techniques_should_be_practiced_weeks_before_show',
      'show_type_category_varies_by_organizer',
    ],
    scope_notice: 'educational_competition_readiness_checklist_not_a_stage_directive_or_prescription',
  };
}
