/**
 * Tool #044 — DHT Side Effect Predictor
 * Zod input/output contract.
 */
import { z } from 'zod';

export const DhtInputSchema = z.object({
  dht_ng_dl: z.number().finite().min(5).max(300),
  uses_dht_derivative: z.boolean(),
  five_ari: z.enum(['none', 'finasteride', 'dutasteride']),
  family_history_hairloss: z.boolean(),
  age: z.number().int().min(18).max(90),
});

export type DhtInput = z.infer<typeof DhtInputSchema>;

const band = z.enum(['low', 'moderate', 'high']);

export const DhtResultSchema = z.object({
  hair_loss_risk_pct: z.number().finite().min(0).max(100),
  prostate_symptom_risk_pct: z.number().finite().min(0).max(100),
  overall_burden_pct: z.number().finite().min(0).max(100),
  band,
  mitigations: z.array(z.string().max(80)).max(6),
});

export const DhtOutputSchema = z.object({
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
  result: DhtResultSchema,
});
