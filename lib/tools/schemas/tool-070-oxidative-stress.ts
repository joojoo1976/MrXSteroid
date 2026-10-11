/** Tool #070 — Oxidative Stress — input schema (zod). */
import { z } from 'zod';

export const OxidativeStressInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  cigarettes_per_day: z.number().min(0).max(60),
  alcohol_units_week: z.number().min(0).max(80),
  exercise_days: z.number().int().min(0).max(7),
  sleep_hours: z.number().min(0).max(14),
  produce_servings: z.number().min(0).max(15),
  processed_food_servings: z.number().min(0).max(15),
  stress_level: z.number().min(1).max(10),
  pollution_exposure: z.boolean(),
  excessive_uv: z.boolean(),
});

export type OxidativeStressInput = z.infer<typeof OxidativeStressInputSchema>;
