/**
 * Tool #082 — Telomere Manager
 * Zod input/output contract.
 */
import { z } from 'zod';

export const TelomereInputSchema = z.object({
  perceived_chronic_stress_level: z.enum(['low', 'moderate', 'high', 'severe']),
  aerobic_exercise_hours_weekly: z.number().finite().min(0).max(20),
  mediterranean_diet_adherence: z.enum(['low', 'moderate', 'high']),
  omega3_supplementation_or_fatty_fish: z.boolean(),
  bmi: z.number().finite().min(15).max(50),
});

export type TelomereInput = z.infer<typeof TelomereInputSchema>;

export const TelomereResultSchema = z.object({
  telomere_protection_score: z.number().finite().min(0).max(100),
  telomere_status_band: z.enum(['depleted-attrition-risk', 'moderate-maintenance', 'favorable-preservation', 'optimal-telomere-support']),
  warnings: z.array(z.string().max(120)).max(8),
});

export const TelomereOutputSchema = z.object({
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
  result: TelomereResultSchema,
});
