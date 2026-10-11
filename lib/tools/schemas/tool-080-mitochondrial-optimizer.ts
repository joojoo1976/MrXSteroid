/** Tool #080 — Mitochondrial Optimizer — input schema (zod). */
import { z } from 'zod';

export const MitochondrialInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  exercise_days: z.number().int().min(0).max(7),
  sleep_hours: z.number().min(0).max(14),
  diet_diversity: z.number().min(1).max(5),
  cold_exposure_days: z.number().int().min(0).max(7),
  heat_exposure_days: z.number().int().min(0).max(7),
  stress_level: z.number().min(1).max(10),
  smoker: z.boolean(),
  cardiovascular_disease: z.boolean(),
});

export type MitochondrialInput = z.infer<typeof MitochondrialInputSchema>;
