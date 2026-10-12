/**
 * Tool #086 — Cortisol Stress Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const CortisolStressInputSchema = z.object({
  morning_exhaustion_rating: z.number().finite().min(1).max(10),
  evening_tired_but_wired: z.boolean(),
  daily_caffeine_cups: z.number().finite().min(0).max(15),
  resting_heart_rate_variability_trend: z.enum(['normal_high', 'reduced', 'chronically_low']),
  intense_training_sessions_weekly: z.number().finite().min(0).max(14),
  life_stressors_level: z.enum(['low', 'moderate', 'high', 'extreme']),
});

export type CortisolStressInput = z.infer<typeof CortisolStressInputSchema>;

export const CortisolStressResultSchema = z.object({
  cortisol_stress_load_score: z.number().finite().min(0).max(100),
  hpa_axis_status_tier: z.enum(['adaptive-balanced', 'compensated-strain', 'dysregulated-exhaustion']),
  catabolic_risk_tier: z.enum(['low', 'moderate', 'high']),
  warnings: z.array(z.string().max(120)).max(8),
});

export const CortisolStressOutputSchema = z.object({
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
  result: CortisolStressResultSchema,
});
