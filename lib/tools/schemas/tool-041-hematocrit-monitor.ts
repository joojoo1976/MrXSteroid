/**
 * Tool #041 — Hematocrit Monitor
 * Zod input/output contract.
 */
import { z } from 'zod';

const isoDate = z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: 'must be an ISO-8601 date' });

export const HctReadingSchema = z.object({
  hct_pct: z.number().finite().min(20).max(70),
  date: isoDate,
});

export const HematocritInputSchema = z.object({
  readings: z.array(HctReadingSchema).min(2).max(24),
  sex: z.enum(['male', 'female']),
  on_cycle: z.boolean(),
  weeks_remaining: z.number().int().min(0).max(52),
});

export type HematocritInput = z.infer<typeof HematocritInputSchema>;

const band = z.enum(['normal', 'borderline', 'high', 'very-high']);

export const HematocritResultSchema = z.object({
  latest_hct_pct: z.number().finite().min(0).max(70),
  baseline_hct_pct: z.number().finite().min(0).max(70),
  slope_per_30d: z.number().finite(),
  band,
  projected_threshold_date: z.string().nullable(),
  donate_eligible: z.boolean(),
  warnings: z.array(z.string().max(64)).max(8),
});

export const HematocritOutputSchema = z.object({
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
  result: HematocritResultSchema,
});
