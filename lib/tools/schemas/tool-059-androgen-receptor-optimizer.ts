/**
 * Tool #059 — Androgen Receptor Optimizer
 * Zod input/output contract.
 */
import { z } from 'zod';

export const ReceptorResponsivenessInputSchema = z.object({
  training_days_per_week: z.number().finite().min(0).max(7),
  sleep_hours: z.number().finite().min(0).max(14),
  weeks_since_last_break: z.number().finite().min(0).max(104),
  current_cycle_week: z.number().finite().min(0).max(52),
});

export type ReceptorResponsivenessInput = z.infer<typeof ReceptorResponsivenessInputSchema>;

const band = z.enum(['downregulated-context', 'baseline', 'responsive-context']);

export const ReceptorResponsivenessResultSchema = z.object({
  score: z.number().finite().min(0).max(100),
  band,
  recommendations: z.array(z.string().max(64)).max(8),
  warnings: z.array(z.string().max(64)).max(8),
});

export const ReceptorResponsivenessOutputSchema = z.object({
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
  result: ReceptorResponsivenessResultSchema,
});
