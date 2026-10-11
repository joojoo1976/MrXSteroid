/**
 * Tool #075 — Arterial Health Manager
 * Zod input/output contract.
 */
import { z } from 'zod';

export const ArterialHealthInputSchema = z.object({
  age: z.number().int().min(20).max(90),
  systolic_mmhg: z.number().finite().min(70).max(240),
  diastolic_mmhg: z.number().finite().min(40).max(150),
  total_cholesterol_mg_dl: z.number().finite().min(100).max(500).optional(),
  hdl_mg_dl: z.number().finite().min(10).max(150).optional(),
  triglycerides_mg_dl: z.number().finite().min(30).max(1000).optional(),
  smoker: z.boolean(),
});

export type ArterialHealthInput = z.infer<typeof ArterialHealthInputSchema>;

export const ArterialHealthResultSchema = z.object({
  arterial_risk_score: z.number().finite().min(0).max(100),
  stiffness_risk_band: z.enum(['low-stiffness-risk', 'moderate-stiffness-risk', 'elevated-stiffness-risk']),
  tg_to_hdl_ratio: z.number().finite().min(0).max(50).nullable(),
  tc_to_hdl_ratio: z.number().finite().min(0).max(50).nullable(),
  warnings: z.array(z.string().max(64)).max(8),
});

export const ArterialHealthOutputSchema = z.object({
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
  result: ArterialHealthResultSchema,
});
