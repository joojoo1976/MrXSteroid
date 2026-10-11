/** Tool #079 — Fat Metabolism — input schema (zod). */
import { z } from 'zod';

export const FatMetabolismInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  cardio_days: z.number().int().min(0).max(7),
  resistance_days: z.number().int().min(0).max(7),
  daily_steps: z.number().int().min(0).max(40000),
  carb_grams: z.number().min(0).max(800),
  protein_adequacy: z.number().min(1).max(5),
  body_fat_pct: z.number().min(3).max(60),
  fasting_hours: z.number().min(0).max(24),
});

export type FatMetabolismInput = z.infer<typeof FatMetabolismInputSchema>;
