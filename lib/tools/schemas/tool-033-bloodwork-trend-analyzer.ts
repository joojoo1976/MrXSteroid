/**
 * Tool #033 — Bloodwork Trend Analyzer
 * Zod input/output contract. Reuses the engine's TypeScript types.
 */
import { z } from 'zod';

const isoDate = z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
  message: 'must be an ISO-8601 date',
});

export const LabReadingSchema = z.object({
  marker: z.string().min(1).max(40),
  value: z.number().finite(),
  unit: z.string().min(1).max(24),
  date: isoDate,
});

export const MarkerRangeSchema = z.object({
  low: z.number().finite(),
  high: z.number().finite(),
  unit: z.string().min(1).max(24),
});

export const TrendAnalyzerInputSchema = z.object({
  readings: z.array(LabReadingSchema).min(1).max(200),
  ranges: z.record(z.string(), MarkerRangeSchema),
});

export type TrendAnalyzerInput = z.infer<typeof TrendAnalyzerInputSchema>;

export const MarkerTrendSchema = z.object({
  marker: z.string().min(1).max(40),
  unit: z.string().min(1).max(24),
  latest_value: z.number().finite(),
  latest_date: isoDate,
  slope_per_30d: z.number().finite(),
  direction: z.enum(['rising', 'falling', 'stable']),
  in_range: z.boolean(),
  velocity_alert: z.boolean(),
  points: z.number().int().min(1),
});

export const TrendAnalyzerResultSchema = z.object({
  markers: z.array(MarkerTrendSchema).max(40),
  summary: z.array(z.string()).max(40),
});

export type TrendAnalyzerResult = z.infer<typeof TrendAnalyzerResultSchema>;
