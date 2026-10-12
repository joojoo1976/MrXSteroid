/**
 * Tool #087 — Mood Optimizer
 * Zod input/output contract.
 */
import { z } from 'zod';

export const MoodOptimizerInputSchema = z.object({
  sunlight_outdoor_minutes_daily: z.number().finite().min(0).max(300),
  social_connection_satisfaction: z.enum(['isolated', 'moderate', 'strong']),
  physical_activity_days_weekly: z.number().finite().min(0).max(7),
  omega3_and_micronutrient_sufficiency: z.boolean(),
  chronic_work_overload_burnout: z.boolean(),
  subjective_anhedonia_present: z.boolean(),
});

export type MoodOptimizerInput = z.infer<typeof MoodOptimizerInputSchema>;

export const MoodOptimizerResultSchema = z.object({
  affective_resilience_score: z.number().finite().min(0).max(100),
  affective_balance_tier: z.enum(['depleted-vulnerable', 'moderate-stability', 'robust-flourishing']),
  warnings: z.array(z.string().max(120)).max(8),
});

export const MoodOptimizerOutputSchema = z.object({
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
  result: MoodOptimizerResultSchema,
});
