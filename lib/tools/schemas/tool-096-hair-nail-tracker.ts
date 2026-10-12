import { z } from 'zod';

export const HairNailTrackerInputSchema = z.object({
  daily_shedding_rate: z.enum(['normal_under_50', 'moderate_50_to_100', 'excessive_over_100']),
  temporal_vertex_thinning: z.boolean(),
  scalp_sebum_inflammation: z.enum(['none', 'mild_pruritus', 'severe_seborrheic_dermatitis']),
  nail_brittleness_or_ridging: z.boolean(),
  using_5ar_inhibitor_or_minoxidil: z.boolean(),
});

export type HairNailTrackerInput = z.infer<typeof HairNailTrackerInputSchema>;
