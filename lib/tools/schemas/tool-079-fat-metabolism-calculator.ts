/**
 * Tool #079 — Fat Metabolism Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const FatMetabolismInputSchema = z.object({
  body_weight_kg: z.number().finite().min(40).max(200),
  body_fat_pct: z.number().finite().min(5).max(50).optional(),
  vo2max_ml_kg_min: z.number().finite().min(20).max(85).optional(),
  heart_rate_bpm: z.number().finite().min(50).max(210),
  resting_heart_rate_bpm: z.number().finite().min(40).max(100),
  fasted_state: z.boolean(),
});

export type FatMetabolismInput = z.infer<typeof FatMetabolismInputSchema>;

export const FatMetabolismResultSchema = z.object({
  estimated_fat_oxidation_g_hr: z.number().finite().min(0).max(200),
  estimated_carb_oxidation_g_hr: z.number().finite().min(0).max(500),
  estimated_rer: z.number().finite().min(0.65).max(1.10),
  zone_state: z.enum(['predominantly-fat', 'balanced-crossover', 'predominantly-glycolytic']),
  warnings: z.array(z.string().max(120)).max(8),
});

export const FatMetabolismOutputSchema = z.object({
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
  result: FatMetabolismResultSchema,
});
