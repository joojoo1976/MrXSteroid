/**
 * Tool #042 — Estrogen Management Pro
 * Zod input/output contract.
 */
import { z } from 'zod';

export const EstrogenInputSchema = z.object({
  e2_pg_ml: z.number().finite().min(5).max(500),
  weekly_testosterone_mg: z.number().finite().min(0).max(1000),
  taking_ai: z.boolean(),
  weekly_ai_dose_mg: z.number().finite().min(0).max(7),
  symptoms: z
    .array(z.enum(['nipple_sensitivity', 'water_retention', 'mood_swings', 'low_libido', 'edema']))
    .max(10),
  body_fat_pct: z.number().finite().min(5).max(60),
});

export type EstrogenInput = z.infer<typeof EstrogenInputSchema>;

const band = z.enum(['low', 'optimal', 'elevated', 'high']);

export const EstrogenResultSchema = z.object({
  band,
  optimal_range: z.object({ low: z.number(), high: z.number() }),
  ai_delta_mg: z.number().finite().min(-1).max(1),
  action: z.enum(['none', 'monitor', 'adjust_ai', 'reduce_test']),
  warnings: z.array(z.string().max(64)).max(8),
});

export const EstrogenOutputSchema = z.object({
  toolId: z.string(),
  toolSlug: z.string(),
  locale: z.string(),
  unitSystem: z.string(),
  snapshotType: z.string(),
  calculatedAt: z.string(),
  recordedAt: z.string(),
  timezone: z.string(),
  accessTier: z.string(),
  keyFindings: z.array(z.any()),
  provenance: z.any(),
  seoLinks: z.any(),
  result: EstrogenResultSchema,
});
