/** Tool #059 — Androgen Receptor Optimizer — input schema (zod). */
import { z } from 'zod';

export const AndrogenReceptorInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  sleep_hours: z.number().min(0).max(14),
  resistance_training_days: z.number().int().min(0).max(7),
  body_fat_pct: z.number().min(3).max(60),
  protein_g_per_kg: z.number().min(0).max(4),
  stress_level: z.number().int().min(1).max(10),
  vitamin_d_ng_ml: z.number().min(0).max(120),
  ar_cag_repeats: z.number().int().min(9).max(40),
});

export type AndrogenReceptorInput = z.infer<typeof AndrogenReceptorInputSchema>;
