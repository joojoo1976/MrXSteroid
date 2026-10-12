/**
 * Tool #089 — Serotonin Manager
 * Zod input/output contract.
 */
import { z } from 'zod';

export const SerotoninManagerInputSchema = z.object({
  tryptophan_rich_food_intake: z.enum(['low', 'moderate', 'optimal']),
  gut_health_status: z.enum(['frequent_gi_distress', 'occasional_bloating', 'healthy_regular']),
  daily_sunlight_lux_exposure_mins: z.number().finite().min(0).max(180),
  nighttime_melatonin_transition_calm: z.boolean(),
  chronic_irritability_or_carb_craving: z.boolean(),
});

export type SerotoninManagerInput = z.infer<typeof SerotoninManagerInputSchema>;

export const SerotoninManagerResultSchema = z.object({
  serotonin_somatic_score: z.number().finite().min(0).max(100),
  serotonin_balance_tier: z.enum(['suboptimal-depleted', 'moderate-fluctuating', 'optimal-harmonized']),
  warnings: z.array(z.string().max(120)).max(8),
});

export const SerotoninManagerOutputSchema = z.object({
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
  result: SerotoninManagerResultSchema,
});
