/**
 * Tool #048 — Cardiovascular Risk Assessor
 * Zod input/output contract.
 */
import { z } from 'zod';

export const CardioRiskInputSchema = z.object({
  age: z.number().finite().min(18).max(90),
  sex: z.enum(['male', 'female']),
  smoker: z.boolean(),
  systolic_bp: z.number().finite().min(80).max(220),
  total_cholesterol: z.number().finite().min(100).max(400),
  hdl: z.number().finite().min(20).max(110),
  on_cycle: z.boolean(),
});

export type CardioRiskInput = z.infer<typeof CardioRiskInputSchema>;

const band = z.enum(['low', 'moderate', 'elevated', 'high']);

export const CardioRiskResultSchema = z.object({
  risk_pct_10yr: z.number().finite().min(0).max(60),
  band,
  drivers: z.array(z.string().max(48)).max(8),
  mitigations: z.array(z.string().max(64)).max(8),
  warnings: z.array(z.string().max(64)).max(8),
});

export const CardioRiskOutputSchema = z.object({
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
  result: CardioRiskResultSchema,
});
