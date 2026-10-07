/**
 * Tool #011 — Progress Tracker
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const ProgressEntrySchema = z.object({
  id: z.string().uuid(),
  date: z.string().datetime(),
  weight_kg: z.number().optional(),
  weight_lbs: z.number().optional(),
  strength_kg: z.number().optional(),
  strength_lbs: z.number().optional(),
  body_fat_pct: z.number().optional().min(1).max(50),
  notes: z.string().optional(),
  cycle_id: z.string().optional(),
});

export type ProgressEntry = z.infer<typeof ProgressEntrySchema>;

export const ProgressTrendSchema = z.object({
  metric: z.enum(['weight', 'strength', 'body_fat']),
  label: z.string(),
  dataPoints: z.array(ProgressEntrySchema),
  trendDirection: z.enum(['up', 'down', 'stable', 'unknown']),
  avgChangePerWeek: z.number(),
});

export type ProgressTrend = z.infer<typeof ProgressTrendSchema>;

export const CycleComparisonSchema = z.object({
  cycleName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  entries: z.array(ProgressEntrySchema),
  netWeightChange: z.number(),
  strengthChange: z.number(),
  bodyFatChange: z.number(),
});

export type CycleComparison = z.infer<typeof CycleComparisonSchema>;