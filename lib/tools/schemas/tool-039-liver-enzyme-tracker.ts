/**
 * Tool #039 — Liver Enzyme Tracker
 * Zod input/output contract.
 */
import { z } from 'zod';

const isoDate = z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
  message: 'must be an ISO-8601 date',
});

export const LiverReadingSchema = z.object({
  marker: z.enum(['ALT', 'AST', 'GGT', 'ALP', 'bilirubin']),
  value: z.number().finite().min(0).max(5000),
  unit: z.string().min(1).max(24),
  date: isoDate,
});

export const LiverTrackerInputSchema = z.object({
  readings: z.array(LiverReadingSchema).min(1).max(100),
  oral_steroids: z.boolean(),
  alcohol_drinks_per_week: z.number().int().min(0).max(100),
  uses_tudca: z.boolean(),
});

export type LiverTrackerInput = z.infer<typeof LiverTrackerInputSchema>;

export const LiverMarkerStatusSchema = z.object({
  marker: z.string().min(1).max(24),
  latest_value: z.number().finite(),
  unit: z.string().min(1).max(24),
  uln_multiple: z.number().finite().min(0),
  status: z.enum(['normal', 'elevated', 'high', 'critical']),
  trend_per_30d: z.number().finite(),
});

export const LiverTrackerResultSchema = z.object({
  markers: z.array(LiverMarkerStatusSchema).max(10),
  overall_status: z.enum(['normal', 'elevated', 'high', 'critical']),
  stop_orals: z.boolean(),
  recommendations: z.array(z.string()).max(16),
});

export type LiverTrackerResult = z.infer<typeof LiverTrackerResultSchema>;

