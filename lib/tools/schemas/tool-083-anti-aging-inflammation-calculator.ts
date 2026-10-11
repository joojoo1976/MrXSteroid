/**
 * Tool #083 — Anti-Aging Inflammation Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const AntiAgingInflammationInputSchema = z.object({
  hs_crp_mg_l: z.number().finite().min(0.1).max(20).optional(),
  visceral_adiposity_rating: z.enum(['low', 'moderate', 'high']),
  periodontal_disease_present: z.boolean(),
  daily_joint_stiffness_morning_mins: z.number().finite().min(0).max(120),
  anti_inflammatory_polyphenols_daily: z.boolean(),
});

export type AntiAgingInflammationInput = z.infer<typeof AntiAgingInflammationInputSchema>;

export const AntiAgingInflammationResultSchema = z.object({
  inflammaging_index_score: z.number().finite().min(0).max(100),
  inflammaging_tier: z.enum(['minimal-baseline', 'moderate-inflammaging', 'pronounced-systemic-wear']),
  warnings: z.array(z.string().max(120)).max(8),
});

export const AntiAgingInflammationOutputSchema = z.object({
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
  result: AntiAgingInflammationResultSchema,
});
