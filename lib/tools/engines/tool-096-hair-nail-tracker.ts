import { HairNailTrackerInputSchema } from '../schemas/tool-096-hair-nail-tracker';

export type HairNailTrackerInput = { daily_shedding_rate: 'normal_under_50' | 'moderate_50_to_100' | 'excessive_over_100'; temporal_vertex_thinning: boolean; scalp_sebum_inflammation: 'none' | 'mild_pruritus' | 'severe_seborrheic_dermatitis'; nail_brittleness_or_ridging: boolean; using_5ar_inhibitor_or_minoxidil: boolean };
export type HairNailTrackerResult = HairNailTrackerInput & { status: 'RECORDED'; resultType: 'USER_PROVIDED' };

/** Records hair and nail observations without diagnosing hair loss or treatment need. */
export function trackHairNailStatus(input: HairNailTrackerInput): HairNailTrackerResult {
  return { status: 'RECORDED', resultType: 'USER_PROVIDED', ...HairNailTrackerInputSchema.parse(input) };
}
