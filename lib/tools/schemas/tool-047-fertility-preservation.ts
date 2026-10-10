/**
 * Tool #047 — Fertility Preservation Guide
 * Zod input/output contract.
 */
import { z } from 'zod';

export const FertilityInputSchema = z.object({
  age: z.number().finite().min(18).max(60),
  suppression_level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  uses_hcg: z.boolean(),
  planning_horizon_months: z.number().finite().min(0).max(36),
});

export type FertilityInput = z.infer<typeof FertilityInputSchema>;

export const FertilityResultSchema = z.object({
  fertility_impact_pct: z.number().finite().min(0).max(100),
  recovery_projection_months: z.number().finite().min(1).max(36),
  within_horizon: z.boolean(),
  protocol_hints: z.array(z.string().max(64)).max(8),
  warnings: z.array(z.string().max(64)).max(8),
});

export const FertilityOutputSchema = z.object({
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
  result: FertilityResultSchema,
});
