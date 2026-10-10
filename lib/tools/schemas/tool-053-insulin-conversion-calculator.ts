/**
 * Tool #053 — Insulin Conversion Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const InsulinConversionInputSchema = z.object({
  concentration: z.enum(['u100', 'u40']),
  dose_iu: z.number().finite().min(0.5).max(100),
});

export type InsulinConversionInput = z.infer<typeof InsulinConversionInputSchema>;

export const InsulinConversionResultSchema = z.object({
  volume_ml: z.number().finite().min(0).max(10),
  draw_units_u100: z.number().finite().min(0).max(1000),
  draw_units_u40: z.number().finite().min(0).max(1000),
  warnings: z.array(z.string().max(64)).max(8),
});

export const InsulinConversionOutputSchema = z.object({
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
  result: InsulinConversionResultSchema,
});
