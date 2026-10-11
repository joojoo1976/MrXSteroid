/**
 * Tool #065 — Aromatase Conversion Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const AromatizationInputSchema = z.object({
  testosterone_mg_week: z.number().finite().min(25).max(1000),
  body_fat_pct: z.number().finite().min(5).max(50),
  aromatase_inhibitor: z.enum(['none', 'anastrozole_0.5mg', 'anastrozole_1mg', 'letrozole_2.5mg']),
});

export type AromatizationInput = z.infer<typeof AromatizationInputSchema>;

export const AromatizationResultSchema = z.object({
  e2_estimate_pg_ml: z.number().finite().min(0).max(1000),
  band: z.enum(['low-e2', 'normal-range', 'elevated-e2']),
  warnings: z.array(z.string().max(64)).max(8),
});

export const AromatizationOutputSchema = z.object({
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
  result: AromatizationResultSchema,
});
