/**
 * Tool #054 — Glucose Tracker
 * Zod input/output contract.
 */
import { z } from 'zod';

export const GlucoseReadingSchema = z.object({
  mg_dl: z.number().finite().min(20).max(600),
  date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: 'must be an ISO-8601 date' }),
  fasting: z.boolean(),
});

export const GlucoseInputSchema = z.object({
  readings: z.array(GlucoseReadingSchema).min(3).max(60),
});

export type GlucoseInput = z.infer<typeof GlucoseInputSchema>;

const band = z.enum(['normal', 'prediabetic-range', 'elevated']);

export const GlucoseResultSchema = z.object({
  avg: z.number().finite().min(0).max(600),
  fasting_avg: z.number().finite().min(0).max(600),
  in_range_pct: z.number().finite().min(0).max(100),
  hypo_count: z.number().int().min(0).max(60),
  hyper_fast_count: z.number().int().min(0).max(60),
  band,
  warnings: z.array(z.string().max(64)).max(8),
});

export const GlucoseOutputSchema = z.object({
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
  result: GlucoseResultSchema,
});
