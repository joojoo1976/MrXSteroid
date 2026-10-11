/** Tool #055 — Insulin Sensitivity Optimizer — input schema (zod). */
import { z } from 'zod';

export const InsulinSensitivityInputSchema = z.object({
  fasting_glucose_mg_dl: z.number().min(40).max(400),
  fasting_insulin_uu_ml: z.number().min(0.1).max(300),
  waist_cm: z.number().min(40).max(200).optional(),
  activity_days_per_week: z.number().int().min(0).max(7),
  sleep_hours: z.number().min(0).max(16),
});

export type InsulinSensitivityInput = z.infer<typeof InsulinSensitivityInputSchema>;
