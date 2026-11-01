import { z } from 'zod';

export const FiberInputSchema = z.object({
  age: z.number().finite().min(13).max(100),
  sex: z.enum(['male', 'female']),
  height_cm: z.number().finite().min(100).max(250),
  body_weight_kg: z.number().finite().min(30).max(300),
  max_reps_225_bench: z.number().finite().int().min(0).max(100).optional(),
  max_reps_135_squat: z.number().finite().int().min(0).max(100).optional(),
  vertical_jump_cm: z.number().finite().positive().max(100).optional(),
  broad_jump_cm: z.number().finite().positive().max(400).optional(),
  sprint_30m_time: z.number().finite().positive().max(10).optional(),
  preferred_rep_range: z.enum(['1-5', '6-10', '11-15', '16-20', '20+']),
  enjoys_explosive_training: z.boolean(),
  fatigues_quickly_high_reps: z.boolean(),
  recovers_fast_between_sets: z.boolean(),
  training_age_years: z.number().finite().min(0).max(30),
  avg_weekly_volume_sets: z.number().finite().min(0).max(200),
  avg_intensity_rpe: z.number().finite().min(1).max(10),
  current_tempo: z.enum(['explosive', 'controlled', 'slow_eccentric']),
  current_rom: z.enum(['partial', 'full', 'extended']),
  current_intent: z.enum(['speed', 'tension', 'pump']),
}).strict();

export type FiberInput = z.infer<typeof FiberInputSchema>;

