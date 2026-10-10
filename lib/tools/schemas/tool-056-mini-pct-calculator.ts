/**
 * Tool #056 — Mini PCT Calculator
 * Zod input/output contract.
 */
import { z } from 'zod';

export const MiniPctInputSchema = z.object({
  compound_class: z.enum(['19nor', 'aromatizing', 'oral']),
  cycle_weeks: z.number().int().min(1).max(52),
  last_dose_days_ago: z.number().int().min(0).max(365),
});

export type MiniPctInput = z.infer<typeof MiniPctInputSchema>;

const band = z.enum(['window-pending', 'window-open']);

export const MiniPctResultSchema = z.object({
  washout_days: z.number().int().min(0).max(365),
  pct_duration_days: z.number().int().min(0).max(365),
  start_in_days: z.number().int().min(0).max(365),
  band,
  warnings: z.array(z.string().max(64)).max(8),
});

export const MiniPctOutputSchema = z.object({
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
  result: MiniPctResultSchema,
});
