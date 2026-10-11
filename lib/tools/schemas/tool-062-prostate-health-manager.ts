/**
 * Tool #062 — Prostate Health Manager
 * Zod input/output contract.
 */
import { z } from 'zod';

export const ProstateHealthInputSchema = z.object({
  age: z.number().int().min(30).max(90),
  psa_ng_ml: z.number().finite().min(0).max(50),
  psa_prev_1y_ng_ml: z.number().finite().min(0).max(50).optional(),
});

export type ProstateHealthInput = z.infer<typeof ProstateHealthInputSchema>;

export const ProstateHealthResultSchema = z.object({
  psa_ceiling: z.number().finite().min(0).max(20),
  psa_delta_1y: z.number().finite().min(-50).max(50).nullable(),
  band: z.enum(['age-normal', 'above-age-ceiling', 'notably-elevated']),
  warnings: z.array(z.string().max(64)).max(8),
});

export const ProstateHealthOutputSchema = z.object({
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
  result: ProstateHealthResultSchema,
});
