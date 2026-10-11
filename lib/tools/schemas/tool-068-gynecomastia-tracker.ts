/**
 * Tool #068 — Gynecomastia Tracker
 * Zod input/output contract.
 */
import { z } from 'zod';

export const GynecomastiaInputSchema = z.object({
  has_tenderness_or_itching: z.boolean(),
  has_palpable_lump: z.boolean(),
  lump_size_cm: z.number().finite().min(0).max(10).optional(),
  duration_weeks: z.number().int().min(0).max(52),
  prolactin_involved: z.boolean(),
});

export type GynecomastiaInput = z.infer<typeof GynecomastiaInputSchema>;

export const GynecomastiaResultSchema = z.object({
  progression_stage: z.enum(['none', 'subclinical-sensitivity', 'early-budding', 'progressive-glandular']),
  fibrosis_risk: z.enum(['reversible-early', 'moderate-risk', 'established-fibrotic']),
  escalation_needed: z.boolean(),
  warnings: z.array(z.string().max(64)).max(8),
});

export const GynecomastiaOutputSchema = z.object({
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
  result: GynecomastiaResultSchema,
});
