/**
 * Tool #077 — Nitric Oxide Optimizer
 * Zod input/output contract.
 */
import { z } from 'zod';

export const NitricOxideInputSchema = z.object({
  dietary_nitrate_frequency: z.enum(['rarely', 'occasional', 'daily', 'high_daily']),
  aerobic_exercise_days_per_week: z.number().int().min(0).max(7),
  uses_antiseptic_mouthwash: z.boolean(),
  citrulline_supplementation: z.boolean(),
  high_sunlight_or_uva_exposure: z.boolean(),
});

export type NitricOxideInput = z.infer<typeof NitricOxideInputSchema>;

export const NitricOxideResultSchema = z.object({
  no_optimization_score: z.number().finite().min(0).max(100),
  no_status_band: z.enum(['depleted-no-pathway', 'suboptimal-no-support', 'favorable-no-production', 'optimized-no-signaling']),
  warnings: z.array(z.string().max(120)).max(8),
});

export const NitricOxideOutputSchema = z.object({
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
  result: NitricOxideResultSchema,
});
