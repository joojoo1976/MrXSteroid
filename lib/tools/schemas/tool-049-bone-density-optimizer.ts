/** Tool #049 — Bone Density Optimizer — input schema (zod). */
import { z } from 'zod';

export const BoneInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  sex: z.enum(['male', 'female']),
  weight_kg: z.number().min(35).max(250),
  calcium_intake_mg: z.number().min(0).max(4000),
  vitamin_d_ng_ml: z.number().min(0).max(120),
  resistance_training_days: z.number().int().min(0).max(7),
  smoker: z.boolean(),
  androgen_exposure: z.boolean(),
  prior_fracture: z.boolean(),
  family_history_osteoporosis: z.boolean(),
});

export type BoneInput = z.infer<typeof BoneInputSchema>;
