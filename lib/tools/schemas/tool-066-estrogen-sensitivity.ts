/** Tool #066 — Estrogen Sensitivity Manager — input schema (zod). */
import { z } from 'zod';

const symptom = z.number().int().min(0).max(3);

export const EstrogenSensitivityInputSchema = z.object({
  water_retention: symptom,
  nipple_sensitivity: symptom,
  mood_swings: symptom,
  libido_change: symptom,
  bloating: symptom,
  joint_aches: symptom,
  estradiol_pg_ml: z.number().min(0).max(500),
  body_fat_pct: z.number().min(3).max(60),
  painful_breast_changes: z.boolean(),
});

export type EstrogenSensitivityInput = z.infer<typeof EstrogenSensitivityInputSchema>;
