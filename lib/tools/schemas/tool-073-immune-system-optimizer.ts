/**
 * Tool #073 — Immune System Optimizer
 * Zod input/output contract.
 */
import { z } from 'zod';

export const ImmuneSystemInputSchema = z.object({
  vitamin_d_ng_ml: z.number().finite().min(10).max(120).optional(),
  sleep_hours_average: z.number().finite().min(3).max(12),
  training_strain_level: z.enum(['light-moderate', 'hard', 'extreme-overreaching']),
  recurrent_upper_respiratory_infections: z.boolean(),
  takes_zinc_vitamin_c: z.boolean(),
});

export type ImmuneSystemInput = z.infer<typeof ImmuneSystemInputSchema>;

export const ImmuneSystemResultSchema = z.object({
  immune_resilience_score: z.number().finite().min(0).max(100),
  resilience_band: z.enum(['compromised-immunity', 'moderate-resilience', 'robust-resilience']),
  targeted_priorities: z.array(z.string().max(64)).max(8),
  warnings: z.array(z.string().max(64)).max(8),
});

export const ImmuneSystemOutputSchema = z.object({
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
  result: ImmuneSystemResultSchema,
});
