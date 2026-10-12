import { z } from 'zod';

export const FemaleHealthOptimizerInputSchema = z.object({
  energy_availability_adequacy: z.enum(['adequate', 'marginal', 'severely_deficient']),
  ferritin_status: z.enum(['optimal', 'borderline_low', 'clinical_deficiency_suspected']),
  bone_stress_or_joint_pains: z.boolean(),
  thyroid_cold_intolerance: z.boolean(),
  resistance_training_sessions_per_week: z.number().min(0).max(7),
});

export type FemaleHealthOptimizerInput = z.infer<typeof FemaleHealthOptimizerInputSchema>;
