/**
 * Tool #078 — Endothelial Health Manager
 * Zod input/output contract.
 */
import { z } from 'zod';

export const EndothelialHealthInputSchema = z.object({
  systolic_bp: z.number().finite().min(80).max(220),
  fasting_glucose_mg_dl: z.number().finite().min(50).max(300).optional(),
  high_sensitivity_crp_mg_l: z.number().finite().min(0.1).max(20).optional(),
  smoker_or_vaper: z.boolean(),
  androgen_therapy_active: z.boolean(),
  daily_aerobic_movement_mins: z.number().finite().min(0).max(180),
});

export type EndothelialHealthInput = z.infer<typeof EndothelialHealthInputSchema>;

export const EndothelialHealthResultSchema = z.object({
  endothelial_dysfunction_risk_score: z.number().finite().min(0).max(100),
  endothelial_status_band: z.enum(['resilient-intact', 'mild-endothelial-stress', 'moderate-dysfunction-risk', 'pronounced-endothelial-impairment']),
  warnings: z.array(z.string().max(120)).max(8),
});

export const EndothelialHealthOutputSchema = z.object({
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
  result: EndothelialHealthResultSchema,
});
