/** Tool #074 — Blood Pressure Tracker — input schema (zod). */
import { z } from 'zod';

export const BpReadingSchema = z.object({
  systolic: z.number().min(40).max(320),
  diastolic: z.number().min(20).max(220),
  pulse: z.number().min(20).max(250).nullable(),
});

export const BpInputSchema = z.object({
  readings: z.array(BpReadingSchema).min(1).max(200),
  chest_pain: z.boolean(),
  breathing_difficulty: z.boolean(),
  severe_headache: z.boolean(),
  vision_changes: z.boolean(),
  dizziness_on_standing: z.boolean(),
});

export type BpReading = z.infer<typeof BpReadingSchema>;
export type BpInput = z.infer<typeof BpInputSchema>;
