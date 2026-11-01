import { z } from 'zod';

export const IntraWorkoutInputSchema = z.object({
  training_type: z.enum(['resistance', 'endurance', 'mixed', 'hiit', 'skill']),
  duration_min: z.number().finite().min(15).max(480),
  intensity: z.enum(['low', 'moderate', 'high', 'very_high']),
  climate: z.enum(['cool', 'moderate', 'hot', 'humid']),
  sweat_rate_ml_per_h: z.number().finite().positive().max(3000).optional(),
  goal: z.enum(['performance', 'hydration', 'recovery', 'muscle_protein_synthesis']),
  current_intake: z.object({
    carbs_g_per_h: z.number().finite().min(0).max(120),
    sodium_mg_per_h: z.number().finite().min(0).max(2000),
    fluid_ml_per_h: z.number().finite().min(0).max(2000),
    eaa_g_per_h: z.number().finite().min(0).max(20),
  }).optional(),
});

export type IntraWorkoutInput = z.infer<typeof IntraWorkoutInputSchema>;

