import { z } from 'zod';

const ExerciseInputSchema = z.object({
  exercise: z.string().trim().min(1).max(100),
  muscle_group: z.string().trim().min(1).max(50),
  sets: z.number().finite().int().positive().max(50),
  reps: z.number().finite().int().positive().max(100),
  weight_kg: z.number().finite().positive().max(500),
  rpe: z.number().finite().min(1).max(10).optional(),
  percent_1rm: z.number().finite().min(1).max(100).optional(),
  frequency_per_week: z.number().finite().int().positive().max(7),
});

export const VolumeInputSchema = z.object({
  exercises: z.array(ExerciseInputSchema).min(1).max(30),
}).strict();

export type VolumeInput = z.infer<typeof VolumeInputSchema>;


