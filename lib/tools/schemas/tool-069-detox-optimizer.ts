/** Tool #069 — Detoxification Optimizer — input schema (zod). */
import { z } from 'zod';

export const DetoxInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  sex: z.enum(['male', 'female']),
  water_liters: z.number().min(0).max(6),
  fiber_g: z.number().min(0).max(80),
  alcohol_units_week: z.number().min(0).max(80),
  sleep_hours: z.number().min(0).max(14),
  exercise_days: z.number().int().min(0).max(7),
  diet_quality: z.number().min(1).max(5),
  produce_servings: z.number().min(0).max(15),
  smoker: z.boolean(),
  liver_condition: z.boolean(),
  kidney_condition: z.boolean(),
});

export type DetoxInput = z.infer<typeof DetoxInputSchema>;
