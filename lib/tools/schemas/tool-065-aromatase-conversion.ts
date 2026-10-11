/** Tool #065 — Aromatase Conversion Calculator — input schema (zod). */
import { z } from 'zod';

export const AromataseInputSchema = z.object({
  body_fat_pct: z.number().min(3).max(60),
  age: z.number().int().min(16).max(100),
  total_testosterone_ng_dl: z.number().min(0).max(3000),
  estradiol_pg_ml: z.number().min(0).max(500),
});

export type AromataseInput = z.infer<typeof AromataseInputSchema>;
