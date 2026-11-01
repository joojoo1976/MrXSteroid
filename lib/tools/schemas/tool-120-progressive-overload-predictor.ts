import { z } from 'zod';

export const OverloadInputSchema = z.object({
  exercise: z.string().trim().min(1).max(100),
  current_1rm_kg: z.number().finite().positive().max(500),
  current_volume_load_kg: z.number().finite().min(0).max(100000),
  current_frequency: z.number().finite().int().positive().max(7),
  baseline_1rm_kg: z.number().finite().positive().max(500),
  baseline_volume_load_kg: z.number().finite().min(0).max(100000),
  body_weight_kg: z.number().finite().min(30).max(300),
  height_cm: z.number().finite().min(100).max(250),
  age: z.number().finite().min(13).max(100),
  sex: z.enum(['male', 'female']),
  training_age_years: z.number().finite().min(0).max(30),
  weekly_load_increase_pct: z.number().finite().min(0).max(20),
  deload_frequency_weeks: z.number().finite().int().min(0).max(12),
  sleep_hours: z.number().finite().min(4).max(12),
  protein_g_per_kg: z.number().finite().min(0).max(5),
  wrist_cm: z.number().finite().positive().max(25).optional(),
  ankle_cm: z.number().finite().positive().max(30).optional(),
  days_since_deload: z.number().finite().min(0).max(365).optional(),
}).strict();

export type OverloadInput = z.infer<typeof OverloadInputSchema>;

