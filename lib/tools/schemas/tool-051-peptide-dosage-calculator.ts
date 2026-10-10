/**
 * Tool #051 — Peptide Dosage Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const PeptideDoseInputSchema = z.object({
  vial_mg: z.number().finite().min(0.1).max(100),
  bac_water_ml: z.number().finite().min(0.1).max(10),
  desired_dose_mg: z.number().finite().min(0.01).max(10),
});

export type PeptideDoseInput = z.infer<typeof PeptideDoseInputSchema>;

export const PeptideDoseResultSchema = z.object({
  concentration_mg_per_ml: z.number().finite().min(0).max(1000),
  dose_volume_ml: z.number().finite().min(0).max(10),
  draw_units_u100: z.number().finite().min(0).max(1000),
  doses_per_vial: z.number().int().min(0).max(10000),
  clamped: z.boolean(),
  warnings: z.array(z.string().max(64)).max(8),
});

export const PeptideDoseOutputSchema = z.object({
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
  result: PeptideDoseResultSchema,
});
