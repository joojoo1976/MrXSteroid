import { z } from 'zod';

export const DigestiveHealthOptimizerInputSchema = z.object({
  daily_protein_intake_grams: z.number().finite().min(0).max(500),
  bloating_or_reflux_frequency: z.enum(['rare', 'occasional', 'severe_daily']),
  bowel_regularity_bristol_score: z.number().finite().int().min(1).max(7),
  using_oral_17aa_or_nsaids: z.boolean(),
  fermented_food_or_probiotic_intake: z.boolean(),
}).strict();

export type DigestiveHealthOptimizerInput = z.infer<typeof DigestiveHealthOptimizerInputSchema>;
