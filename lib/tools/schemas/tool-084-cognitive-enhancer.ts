/**
 * Tool #084 — Cognitive Enhancer
 * Zod input/output contract.
 */
import { z } from 'zod';

export const CognitiveEnhancerInputSchema = z.object({
  daily_focused_deep_work_hours: z.number().finite().min(0).max(12),
  regular_aerobic_exercise: z.boolean(),
  caffeine_daily_mg: z.number().finite().min(0).max(800),
  choline_rich_foods_or_alpha_gpc: z.boolean(),
  frequent_brain_fog_complaints: z.boolean(),
  sleep_hours: z.number().finite().min(3).max(12),
});

export type CognitiveEnhancerInput = z.infer<typeof CognitiveEnhancerInputSchema>;

export const CognitiveEnhancerResultSchema = z.object({
  cognitive_readiness_score: z.number().finite().min(0).max(100),
  cognitive_status_band: z.enum(['suboptimal-fatigued', 'functional-baseline', 'heightened-acuity', 'peak-neurotrophic-state']),
  warnings: z.array(z.string().max(120)).max(8),
});

export const CognitiveEnhancerOutputSchema = z.object({
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
  result: CognitiveEnhancerResultSchema,
});
