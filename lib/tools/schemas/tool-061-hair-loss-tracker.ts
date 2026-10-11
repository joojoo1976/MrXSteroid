/**
 * Tool #061 — Hair Loss Tracker
 * Zod input/output contract.
 */
import { z } from 'zod';

export const HairLossInputSchema = z.object({
  norwood_stage: z.number().int().min(1).max(7),
  weekly_shed_counts: z.array(z.number().finite().min(0).max(500)).min(3).max(12),
  on_5ari: z.boolean(),
  weeks_since_start: z.number().int().min(0).max(260),
});

export type HairLossInput = z.infer<typeof HairLossInputSchema>;

const trend = z.enum(['stable', 'monitor', 'accelerated']);
const stage = z.enum(['minimal', 'moderate', 'advanced']);

export const HairLossResultSchema = z.object({
  avg_weekly_shed: z.number().finite().min(0).max(500),
  trend_band: trend,
  stage_band: stage,
  warnings: z.array(z.string().max(64)).max(8),
});

export const HairLossOutputSchema = z.object({
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
  result: HairLossResultSchema,
});
