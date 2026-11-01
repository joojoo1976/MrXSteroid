import { z } from 'zod';

export const RecoveryInputSchema = z.object({
  muscle_group: z.enum([
    'chest', 'back', 'quads', 'hamstrings', 'glutes',
    'shoulders', 'biceps', 'triceps', 'forearms',
    'calves', 'abs', 'lower_back'
  ]),
  sets: z.number().finite().int().positive().max(20),
  rpe: z.number().finite().min(1).max(10).optional(),
  frequency_per_week: z.number().finite().int().positive().max(7),
  age: z.number().finite().min(13).max(100),
  sleep_hours: z.number().finite().min(4).max(12),
  protein_g_per_kg: z.number().finite().min(0).max(5),
  stress_level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  training_age_years: z.number().finite().min(0).max(30),
}).strict();

export type RecoveryInput = z.infer<typeof RecoveryInputSchema>;


