/**
 * Tool #035 — Hormone Conversion Calculator
 * Zod input/output contract. Reuses the engine's TypeScript types.
 */
import { z } from 'zod';

export const ConversionInputSchema = z.object({
  weekly_test_mg: z.number().finite().min(0).max(3000),
  body_fat_pct: z.number().finite().min(5).max(60),
  age: z.number().int().min(18).max(90),
  ai_dose_mg_per_week: z.number().finite().min(0).max(14).optional(),
});

export type ConversionInput = z.infer<typeof ConversionInputSchema>;

export const ConversionResultSchema = z.object({
  estimated_total_t_ng_dl: z.number().finite().min(0).max(20000),
  estimated_e2_pg_ml: z.number().finite().min(0).max(500),
  e2_status: z.enum(['low', 'optimal', 'high', 'very-high']),
  test_to_e2_ratio: z.number().finite().min(0),
  ai_suggestion_mg_per_week: z.number().finite().min(0).max(14),
  warnings: z.array(z.string()).max(12),
});

export type ConversionResult = z.infer<typeof ConversionResultSchema>;
