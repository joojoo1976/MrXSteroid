/** Tool #078 — Endothelial Health Manager — input schema (zod). */
import { z } from 'zod';

export const EndothelialInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  systolic: z.number().min(40).max(320),
  diastolic: z.number().min(20).max(220),
  ldl_mg_dl: z.number().min(30).max(400),
  hdl_mg_dl: z.number().min(10).max(120),
  fasting_glucose_mg_dl: z.number().min(40).max(500),
  hba1c_pct: z.number().min(3).max(20).nullable(),
  exercise_days: z.number().int().min(0).max(7),
  sleep_hours: z.number().min(0).max(14),
  smoker: z.boolean(),
});

export type EndothelialInput = z.infer<typeof EndothelialInputSchema>;
