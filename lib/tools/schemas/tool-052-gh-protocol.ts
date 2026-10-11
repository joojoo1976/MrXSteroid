/** Tool #052 — GH Protocol Planner — input schema (zod). */
import { z } from 'zod';

export const GhProtocolInputSchema = z.object({
  weekly_iu: z.number().min(0).max(200),
  injections_per_week: z.number().int().min(1).max(21),
  age: z.number().int().min(16).max(90),
  baseline_igf1_ng_ml: z.number().min(20).max(600),
  fasting_glucose_mg_dl: z.number().min(50).max(400),
  hypothyroid: z.boolean(),
});

export type GhProtocolInput = z.infer<typeof GhProtocolInputSchema>;
