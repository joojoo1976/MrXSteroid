/**
 * Tool #069 — Detoxification Optimizer
 * Zod input/output contract.
 */
import { z } from 'zod';

export const DetoxificationInputSchema = z.object({
  daily_water_liters: z.number().finite().min(0.5).max(6.0),
  daily_fiber_grams: z.number().finite().min(5).max(60),
  cruciferous_servings_week: z.number().int().min(0).max(21),
  alcohol_drinks_week: z.number().int().min(0).max(50),
  takes_nac_or_glutathione_support: z.boolean(),
  oral_compounds_present: z.boolean(),
});

export type DetoxificationInput = z.infer<typeof DetoxificationInputSchema>;

export const DetoxificationResultSchema = z.object({
  hepatic_support_score: z.number().finite().min(0).max(100),
  support_tier: z.enum(['suboptimal-support', 'moderate-support', 'optimal-support']),
  key_recommendations: z.array(z.string().max(64)).max(8),
  warnings: z.array(z.string().max(64)).max(8),
});

export const DetoxificationOutputSchema = z.object({
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
  result: DetoxificationResultSchema,
});
