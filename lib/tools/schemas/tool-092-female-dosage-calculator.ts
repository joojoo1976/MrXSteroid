import { z } from 'zod';

export const FemaleDosageCalculatorInputSchema = z.object({
  compound: z.enum(['oxandrolone', 'methenolone_acetate', 'nandrolone_decanoate', 'testosterone_propionate']),
  proposed_weekly_dose_mg: z.number().min(1).max(250),
  cycle_experience: z.enum(['first_time', 'intermediate_experience', 'advanced_risk_aware']),
  monitoring_bloodwork_planned: z.boolean(),
});

export type FemaleDosageCalculatorInput = z.infer<typeof FemaleDosageCalculatorInputSchema>;
