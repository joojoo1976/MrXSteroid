/**
 * Tool #024 — Post-Cycle Bloodwork Interpreter
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const BloodworkMarkerSchema = z.object({
  name_en: z.string(),
  name_ar: z.string(),
  value: z.number(),
  reference_low: z.number(),
  reference_high: z.number(),
  unit: z.string(),
  result_status: z.enum(['low', 'normal', 'high', 'critical']),
});

export type BloodworkMarker = z.infer<typeof BloodworkMarkerSchema>;

export const PostCycleBloodworkInputSchema = z.object({
  markers: z.array(BloodworkMarkerSchema).min(1).max(30),
  cycle_duration_weeks: z.number().min(1).max(52),
  pct_compounds: z.array(z.string()).min(0).max(10),
  pct_duration_weeks: z.number().min(1).max(26},
  days_since_pct_end: z.number().min(0).max(365},
});

export type PostCycleBloodworkInput = z.infer<typeof PostCycleBloodworkInputSchema>;

export const PostCycleBloodworkResultSchema = z.object({
  overall_recovery_status: z.enum(['excellent', 'good', 'partial', 'poor']),
  hormonal_recovery: z.enum(['complete', 'incomplete', 'none']),
  liver_function: z.enum(['normal', 'elevated', 'concerning']),
  cardiovascular: z.enum(['normal', 'elevated', 'concerning']),
  estrogen_status: z.enum(['low', 'normal', 'high', 'critical']),
  recommendations: z.array(z.string()).min(0).max(15),
  followup_marker: z.string(),
  days_to_next_test: z.number().min(0).max(90},
});

export type PostCycleBloodworkResult = z.infer<typeof PostCycleBloodworkResultSchema>;