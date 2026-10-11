/**
 * Tool #085 — Sleep Quality Manager
 * Zod input/output contract.
 */
import { z } from 'zod';

export const SleepQualityInputSchema = z.object({
  sleep_duration_hours: z.number().finite().min(3).max(14),
  sleep_latency_minutes: z.number().finite().min(0).max(120),
  night_awakenings_count: z.number().int().min(0).max(10),
  caffeine_within_6h_of_bedtime: z.boolean(),
  dark_cool_room_optimized: z.boolean(),
  morning_rested_feeling_score: z.number().finite().min(1).max(10),
});

export type SleepQualityInput = z.infer<typeof SleepQualityInputSchema>;

export const SleepQualityResultSchema = z.object({
  sleep_quality_index: z.number().finite().min(0).max(100),
  sleep_tier: z.enum(['poor-fragmented', 'fair-restorative', 'good-consolidated', 'optimal-restorative']),
  estimated_sleep_efficiency_pct: z.number().finite().min(50).max(100),
  warnings: z.array(z.string().max(120)).max(8),
});

export const SleepQualityOutputSchema = z.object({
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
  result: SleepQualityResultSchema,
});
