/** Tool #054 — Glucose Tracker — input schema (zod). */
import { z } from 'zod';

export const GlucoseReadingSchema = z.object({
  value: z.number().min(20).max(700),
  at: z.string().min(4).max(40),
});

export const GlucoseTrackerInputSchema = z.object({
  readings: z.array(GlucoseReadingSchema).max(2000),
  target_low: z.number().min(40).max(120).optional(),
  target_high: z.number().min(120).max(300).optional(),
});

export type GlucoseTrackerInput = z.infer<typeof GlucoseTrackerInputSchema>;
