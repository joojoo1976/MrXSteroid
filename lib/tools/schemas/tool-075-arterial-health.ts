/** Tool #075 — Arterial Health Manager — input schema (zod). */
import { z } from 'zod';

export const ArterialInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  systolic: z.number().min(40).max(320),
  diastolic: z.number().min(20).max(220),
  ldl_mg_dl: z.number().min(30).max(400),
  hdl_mg_dl: z.number().min(10).max(120),
  triglycerides_mg_dl: z.number().min(20).max(1000),
  exercise_days: z.number().int().min(0).max(7),
  smoker: z.boolean(),
  diabetes: z.boolean(),
  family_history_cvd: z.boolean(),
});

export type ArterialInput = z.infer<typeof ArterialInputSchema>;
