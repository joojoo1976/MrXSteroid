/**
 * Tool #067 — Estrogen Balance Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const EstrogenBalanceInputSchema = z.object({
  total_testosterone_ng_dl: z.number().finite().min(100).max(3000),
  estradiol_pg_ml: z.number().finite().min(5).max(250),
});

export type EstrogenBalanceInput = z.infer<typeof EstrogenBalanceInputSchema>;

export const EstrogenBalanceResultSchema = z.object({
  t_to_e2_ratio: z.number().finite().min(0).max(500),
  balance_band: z.enum(['estrogen-dominant', 'balanced-optimal', 'androgen-dominant-low-e2']),
  warnings: z.array(z.string().max(64)).max(8),
});

export const EstrogenBalanceOutputSchema = z.object({
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
  result: EstrogenBalanceResultSchema,
});
