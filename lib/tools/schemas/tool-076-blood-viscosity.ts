/** Tool #076 — Blood Viscosity — input schema (zod). */
import { z } from 'zod';

export const ViscosityInputSchema = z.object({
  age: z.number().int().min(16).max(100),
  sex: z.enum(['male', 'female']),
  hematocrit_pct: z.number().min(20).max(70),
  water_liters: z.number().min(0).max(6),
  ldl_mg_dl: z.number().min(30).max(400),
  triglycerides_mg_dl: z.number().min(20).max(1000),
  fibrinogen_mg_dl: z.number().min(50).max(1000).nullable(),
  smoker: z.boolean(),
});

export type ViscosityInput = z.infer<typeof ViscosityInputSchema>;
