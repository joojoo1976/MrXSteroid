/** Tool #046 — TRT Lifetime Calculator — input schema (zod). */
import { z } from 'zod';

export const TrtLifetimeInputSchema = z.object({
  weekly_dose_mg: z.number().min(10).max(600),
  ester: z.enum(['cypionate', 'enanthate', 'propionate', 'undecanoate']),
  injection_interval_days: z.number().min(0.5).max(90),
  planned_years: z.number().min(0.1).max(40),
  age: z.number().int().min(16).max(100),
  baseline_hematocrit_pct: z.number().min(30).max(60),
  cardiovascular_risk_factors: z.number().int().min(0).max(6).optional(),
});

export type TrtLifetimeInput = z.infer<typeof TrtLifetimeInputSchema>;
