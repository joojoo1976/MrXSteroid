/** Tool #073 — Immune System Optimizer — input schema (zod). */
import { z } from 'zod';

export const ImmuneInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  sleep_hours: z.number().min(0).max(14),
  protein_adequacy: z.number().min(1).max(5),
  produce_servings: z.number().min(0).max(15),
  exercise_days: z.number().int().min(0).max(7),
  stress_level: z.number().min(1).max(10),
  alcohol_units_week: z.number().min(0).max(80),
  smoker: z.boolean(),
  vitamin_d_deficiency: z.boolean(),
  recurrent_infections: z.boolean(),
  fever_breathing_difficulty: z.boolean(),
});

export type ImmuneInput = z.infer<typeof ImmuneInputSchema>;
