import { DigestiveHealthOptimizerInputSchema } from '../schemas/tool-099-digestive-health-optimizer';

export type DigestiveHealthOptimizerInput = {
  daily_protein_intake_grams: number;
  bloating_or_reflux_frequency: 'rare' | 'occasional' | 'severe_daily';
  bowel_regularity_bristol_score: number;
  using_oral_17aa_or_nsaids: boolean;
  fermented_food_or_probiotic_intake: boolean;
};

export type DigestiveHealthOptimizerResult = {
  status: 'RECORDED';
  resultType: 'USER_PROVIDED';
  daily_protein_intake_grams: number;
  bloating_or_reflux_frequency: DigestiveHealthOptimizerInput['bloating_or_reflux_frequency'];
  bowel_regularity_bristol_score: number;
  using_oral_17aa_or_nsaids: boolean;
  fermented_food_or_probiotic_intake: boolean;
};

/** Records user-entered digestive observations without inferring a health state. */
export function optimizeDigestiveHealth(input: DigestiveHealthOptimizerInput): DigestiveHealthOptimizerResult {
  const values = DigestiveHealthOptimizerInputSchema.parse(input);
  return { status: 'RECORDED', resultType: 'USER_PROVIDED', ...values };
}
