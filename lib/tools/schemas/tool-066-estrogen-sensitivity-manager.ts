/**
 * Tool #066 — Estrogen Sensitivity Manager
 * Zod input/output contract.
 */
import { z } from 'zod';

export const EstrogenSensitivityInputSchema = z.object({
  e2_level_pg_ml: z.number().finite().min(5).max(200),
  water_retention_score: z.number().int().min(0).max(3),
  nipple_sensitivity: z.boolean(),
  mood_lability_score: z.number().int().min(0).max(3),
  libido_impact: z.enum(['none', 'reduced', 'crashed']),
});

export type EstrogenSensitivityInput = z.infer<typeof EstrogenSensitivityInputSchema>;

export const EstrogenSensitivityResultSchema = z.object({
  total_symptom_score: z.number().finite().min(0).max(20),
  sensitivity_pattern: z.enum(['low-sensitivity', 'normal-sensitivity', 'high-sensitivity']),
  contextual_band: z.enum(['asymptomatic', 'mild-estrogenic-burden', 'significant-estrogenic-burden']),
  warnings: z.array(z.string().max(64)).max(8),
});

export const EstrogenSensitivityOutputSchema = z.object({
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
  result: EstrogenSensitivityResultSchema,
});
