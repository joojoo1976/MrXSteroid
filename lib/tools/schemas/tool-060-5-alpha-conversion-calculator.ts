/**
 * Tool #060 — 5-Alpha Conversion Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const DhtConversionInputSchema = z.object({
  testosterone_ng_dl: z.number().finite().min(50).max(3000),
  inhibitor: z.enum(['none', 'finasteride_1mg', 'finasteride_5mg', 'dutasteride_0.5mg']),
});

export type DhtConversionInput = z.infer<typeof DhtConversionInputSchema>;

const band = z.enum(['suppressed-dht', 'normal-range', 'elevated-dht']);

export const DhtConversionResultSchema = z.object({
  dht_estimate_ng_dl: z.number().finite().min(0).max(3000),
  est_conversion_pct: z.number().finite().min(0).max(100),
  suppression_pct: z.number().finite().min(0).max(100),
  band,
  warnings: z.array(z.string().max(64)).max(8),
});

export const DhtConversionOutputSchema = z.object({
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
  result: DhtConversionResultSchema,
});
