/** Tool #060 — 5-Alpha Conversion Calculator — input schema (zod). */
import { z } from 'zod';

export const FiveAlphaInputSchema = z.object({
  total_testosterone_ng_dl: z.number().min(0).max(3000),
  age: z.number().int().min(16).max(100),
  body_fat_pct: z.number().min(3).max(60),
  scalp_sensitivity: z.number().int().min(1).max(10),
  mpb_family_history: z.boolean(),
  sebum_activity: z.number().int().min(0).max(3),
});

export type FiveAlphaInput = z.infer<typeof FiveAlphaInputSchema>;
