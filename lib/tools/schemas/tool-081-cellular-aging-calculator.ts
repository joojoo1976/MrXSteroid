/**
 * Tool #081 — Cellular Aging Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const CellularAgingInputSchema = z.object({
  chronological_age: z.number().int().min(18).max(90),
  smoking_history: z.enum(['never', 'former', 'current']),
  weekly_sun_protection_frequency: z.enum(['never', 'sometimes', 'always']),
  average_sleep_hours: z.number().finite().min(3).max(12),
  ultra_processed_food_frequency: z.enum(['rare', 'moderate', 'high']),
  regular_strength_training: z.boolean(),
});

export type CellularAgingInput = z.infer<typeof CellularAgingInputSchema>;

export const CellularAgingResultSchema = z.object({
  biological_age_delta_estimate: z.number().finite().min(-10).max(20),
  estimated_phenotypic_age: z.number().finite().min(10).max(110),
  cellular_stress_tier: z.enum(['resilient', 'moderate-wear', 'accelerated-stress']),
  warnings: z.array(z.string().max(120)).max(8),
});

export const CellularAgingOutputSchema = z.object({
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
  result: CellularAgingResultSchema,
});
