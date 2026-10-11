/** Tool #072 — Systemic Inflammation Calculator — input schema (zod). */
import { z } from 'zod';

export const InflammationInputSchema = z.object({
  hs_crp_mg_l: z.number().min(0).max(300).nullable(),
  esr_mm_hr: z.number().min(0).max(150).nullable(),
  age: z.number().int().min(16).max(100),
  bmi: z.number().min(10).max(70),
  sleep_hours: z.number().min(0).max(14),
  exercise_days: z.number().int().min(0).max(7),
  alcohol_units_week: z.number().min(0).max(80),
  produce_servings: z.number().min(0).max(15),
  oily_fish_servings: z.number().min(0).max(14),
  sugar_servings: z.number().min(0).max(20),
  stress_level: z.number().min(1).max(10),
  smoker: z.boolean(),
});

export type InflammationInput = z.infer<typeof InflammationInputSchema>;
