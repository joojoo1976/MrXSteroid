/**
 * Tool #058 — Androgenic Balance Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const AndrogenicBalanceInputSchema = z.object({
  dht_ng_dl: z.number().finite().min(5).max(500),
  testosterone_ng_dl: z.number().finite().min(50).max(3000),
  estradiol_pg_ml: z.number().finite().min(2).max(500),
});

export type AndrogenicBalanceInput = z.infer<typeof AndrogenicBalanceInputSchema>;

const dhtBand = z.enum(['dht-low', 'balanced', 'androgenic-dominant']);
const e2Band = z.enum(['low-e2-context', 'balanced', 'e2-dominant']);

export const AndrogenicBalanceResultSchema = z.object({
  dht_t_ratio_pct: z.number().finite().min(0).max(100),
  e2_t_ratio_pct: z.number().finite().min(0).max(100),
  dht_band: dhtBand,
  e2_band: e2Band,
  warnings: z.array(z.string().max(64)).max(8),
});

export const AndrogenicBalanceOutputSchema = z.object({
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
  result: AndrogenicBalanceResultSchema,
});
