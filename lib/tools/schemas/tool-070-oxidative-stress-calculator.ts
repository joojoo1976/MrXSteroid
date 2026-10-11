/**
 * Tool #070 — Oxidative Stress Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const OxidativeStressInputSchema = z.object({
  sleep_hours_per_night: z.number().finite().min(3).max(12),
  hard_training_hours_week: z.number().finite().min(0).max(25),
  smoker_or_vaper: z.boolean(),
  high_sugar_ultraprocessed_diet: z.boolean(),
  androgen_dose_weekly_mg: z.number().finite().min(0).max(3000),
  antioxidant_support_adequate: z.boolean(),
});

export type OxidativeStressInput = z.infer<typeof OxidativeStressInputSchema>;

export const OxidativeStressResultSchema = z.object({
  oxidative_burden_score: z.number().finite().min(0).max(100),
  burden_tier: z.enum(['low-oxidative-stress', 'moderate-oxidative-stress', 'high-oxidative-stress']),
  mitigating_priorities: z.array(z.string().max(64)).max(8),
  warnings: z.array(z.string().max(64)).max(8),
});

export const OxidativeStressOutputSchema = z.object({
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
  result: OxidativeStressResultSchema,
});
