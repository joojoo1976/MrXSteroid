/**
 * Tool #049 — Bone Density Optimizer
 * Zod input/output contract.
 */
import { z } from 'zod';

export const BoneDensityInputSchema = z.object({
  age: z.number().finite().min(18).max(90),
  sex: z.enum(['male', 'female']),
  uses_ai_years: z.number().finite().min(0).max(30),
  weekly_resistance_sessions: z.number().finite().min(0).max(14),
  calcium_mg_daily: z.number().finite().min(0).max(3000),
  vitamin_d_iu_daily: z.number().finite().min(0).max(10000),
  smoker: z.boolean(),
});

export type BoneDensityInput = z.infer<typeof BoneDensityInputSchema>;

const band = z.enum(['optimal', 'good', 'at-risk', 'high-risk']);

export const BoneDensityResultSchema = z.object({
  bone_health_score: z.number().finite().min(0).max(100),
  band,
  risk_factors: z.array(z.string().max(48)).max(10),
  interventions: z.array(z.string().max(64)).max(10),
  warnings: z.array(z.string().max(64)).max(8),
});

export const BoneDensityOutputSchema = z.object({
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
  result: BoneDensityResultSchema,
});
