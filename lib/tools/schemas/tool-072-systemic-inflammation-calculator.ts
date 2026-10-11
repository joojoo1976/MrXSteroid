/**
 * Tool #072 — Systemic Inflammation Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const SystemicInflammationInputSchema = z.object({
  hs_crp_mg_l: z.number().finite().min(0.1).max(30).optional(),
  waist_circumference_cm: z.number().finite().min(60).max(150),
  sleep_hours_per_night: z.number().finite().min(3).max(12),
  smoker_or_heavy_alcohol: z.boolean(),
  chronic_joint_pain: z.boolean(),
});

export type SystemicInflammationInput = z.infer<typeof SystemicInflammationInputSchema>;

export const SystemicInflammationResultSchema = z.object({
  inflammation_risk_score: z.number().finite().min(0).max(100),
  risk_band: z.enum(['low-inflammatory-burden', 'moderate-inflammatory-burden', 'high-inflammatory-burden']),
  crp_context: z.enum(['optimal', 'moderate-cardio-risk', 'high-systemic-risk', 'not-tested']),
  warnings: z.array(z.string().max(64)).max(8),
});

export const SystemicInflammationOutputSchema = z.object({
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
  result: SystemicInflammationResultSchema,
});
