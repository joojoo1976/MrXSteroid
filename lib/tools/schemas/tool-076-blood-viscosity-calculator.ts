/**
 * Tool #076 — Blood Viscosity Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const BloodViscosityInputSchema = z.object({
  hematocrit_pct: z.number().finite().min(30).max(65),
  total_protein_g_dl: z.number().finite().min(4.5).max(10.0).optional(),
  hydration_status: z.enum(['dehydrated', 'adequate', 'well_hydrated']),
  androgen_use: z.boolean(),
});

export type BloodViscosityInput = z.infer<typeof BloodViscosityInputSchema>;

export const BloodViscosityResultSchema = z.object({
  relative_viscosity_score: z.number().finite().min(0).max(100),
  viscosity_band: z.enum(['normal', 'borderline-elevated', 'significantly-elevated', 'critical-hyperviscosity-risk']),
  estimated_viscosity_cp: z.number().finite().min(0).max(20),
  warnings: z.array(z.string().max(100)).max(8),
});

export const BloodViscosityOutputSchema = z.object({
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
  result: BloodViscosityResultSchema,
});
