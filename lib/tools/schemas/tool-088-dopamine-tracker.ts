/**
 * Tool #088 — Dopamine Tracker
 * Zod input/output contract.
 */
import { z } from 'zod';

export const DopamineTrackerInputSchema = z.object({
  daily_short_form_screen_time_hours: z.number().finite().min(0).max(12),
  tyrosine_rich_protein_intake: z.enum(['suboptimal', 'adequate', 'optimal']),
  habitual_cold_exposure_or_hard_effort: z.boolean(),
  frequent_compulsive_dopamine_seeking: z.boolean(),
  sleep_consistency_score: z.number().finite().min(1).max(10),
  stimulant_usage_frequency: z.enum(['none', 'moderate_caffeine', 'high_caffeine_or_preworkout', 'prescription_or_illicit']),
});

export type DopamineTrackerInput = z.infer<typeof DopamineTrackerInputSchema>;

export const DopamineTrackerResultSchema = z.object({
  dopamine_baseline_health_score: z.number().finite().min(0).max(100),
  dopaminergic_tone_tier: z.enum(['depleted-desensitized', 'functional-volatile', 'resilient-balanced']),
  warnings: z.array(z.string().max(120)).max(8),
});

export const DopamineTrackerOutputSchema = z.object({
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
  result: DopamineTrackerResultSchema,
});
