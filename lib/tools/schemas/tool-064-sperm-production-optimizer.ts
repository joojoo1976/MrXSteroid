/**
 * Tool #064 — Sperm Production Optimizer
 * Zod input/output contract.
 */
import { z } from 'zod';

export const SpermProductionInputSchema = z.object({
  months_since_last_cycle: z.number().finite().min(0).max(36),
  age: z.number().int().min(18).max(70),
  hcg_used: z.boolean(),
  weekly_training_hours: z.number().finite().min(0).max(30),
  sleep_hours: z.number().finite().min(0).max(14),
});

export type SpermProductionInput = z.infer<typeof SpermProductionInputSchema>;

export const SpermProductionResultSchema = z.object({
  recovery_score: z.number().finite().min(0).max(100),
  band: z.enum(['early-recovery', 'recovering', 'recovered-context']),
  recommendations: z.array(z.string().max(64)).max(8),
  warnings: z.array(z.string().max(64)).max(8),
});

export const SpermProductionOutputSchema = z.object({
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
  result: SpermProductionResultSchema,
});
