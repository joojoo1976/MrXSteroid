import { z } from 'zod';

export const SkinHealthOptimizerInputSchema = z.object({
  sebum_production_level: z.enum(['normal_balanced', 'moderately_oily', 'excessive_hyperseborrhea']),
  acne_lesion_distribution: z.enum([
    'none_or_mild_comedones',
    'papules_and_pustules_face_or_back',
    'deep_cystic_nodular_lesions',
  ]),
  barrier_dryness_or_flaking: z.boolean(),
  sweat_hygiene_post_workout: z.enum(['immediate_shower', 'delayed_over_1hr']),
  using_topical_dht_blockers_or_salicylic: z.boolean(),
});

export type SkinHealthOptimizerInput = z.infer<typeof SkinHealthOptimizerInputSchema>;
