/** Tool #064 — Sperm Production Optimizer — input schema (zod). */
import { z } from 'zod';

export const SpermProductionInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  bmi: z.number().min(12).max(60),
  sleep_hours: z.number().min(0).max(14),
  heat_exposure_hours: z.number().min(0).max(40),
  exercise_days: z.number().int().min(0).max(7),
  smoker: z.boolean(),
  alcohol_units: z.number().min(0).max(100),
  stress_level: z.number().int().min(1).max(10),
  abstinence_days: z.number().min(0).max(30),
  exogenous_androgen: z.boolean(),
  fertility_intent: z.boolean(),
});

export type SpermProductionInput = z.infer<typeof SpermProductionInputSchema>;
