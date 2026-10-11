/** Tool #048 — Cardiovascular Risk Assessor — input schema (zod). */
import { z } from 'zod';

export const CardioRedFlagsSchema = z.object({
  chest_pain: z.boolean(),
  breathlessness_at_rest: z.boolean(),
  syncope: z.boolean(),
  unilateral_leg_swelling: z.boolean(),
});

export const CardioInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  sex: z.enum(['male', 'female']),
  systolic_bp: z.number().min(70).max(260),
  total_cholesterol_mg_dl: z.number().min(80).max(500),
  hdl_mg_dl: z.number().min(10).max(150),
  smoker: z.boolean(),
  diabetic: z.boolean(),
  on_antihypertensive: z.boolean(),
  hematocrit_pct: z.number().min(25).max(70),
  androgen_exposure: z.boolean(),
  red_flags: CardioRedFlagsSchema,
});

export type CardioInput = z.infer<typeof CardioInputSchema>;
