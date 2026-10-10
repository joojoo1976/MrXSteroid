/**
 * Tool #057 — Free Testosterone Manager
 * Zod input/output contract.
 */
import { z } from 'zod';

export const FreeTestosteroneInputSchema = z.object({
  total_test_ng_dl: z.number().finite().min(10).max(3000),
  shbg_nmol_l: z.number().finite().min(5).max(200),
  albumin_g_dl: z.number().finite().min(3).max(6),
});

export type FreeTestosteroneInput = z.infer<typeof FreeTestosteroneInputSchema>;

const band = z.enum(['low-free-fraction', 'normal-free-fraction', 'high-free-fraction']);

export const FreeTestosteroneResultSchema = z.object({
  free_t_pg_ml: z.number().finite().min(0).max(3000),
  free_t_pct: z.number().finite().min(0).max(100),
  band,
  warnings: z.array(z.string().max(64)).max(8),
});

export const FreeTestosteroneOutputSchema = z.object({
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
  result: FreeTestosteroneResultSchema,
});
