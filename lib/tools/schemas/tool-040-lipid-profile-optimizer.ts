/**
 * Tool #040 — Lipid Profile Optimizer
 * Zod input/output contract.
 */
import { z } from 'zod';

export const LipidPanelSchema = z.object({
  ldl_mg_dl: z.number().finite().min(0).max(600),
  hdl_mg_dl: z.number().finite().min(0).max(200),
  triglycerides_mg_dl: z.number().finite().min(0).max(2000),
  total_cholesterol_mg_dl: z.number().finite().min(0).max(800).optional(),
});

export const LipidOptimizerInputSchema = z.object({
  panel: LipidPanelSchema,
  age: z.number().int().min(18).max(90),
  smoker: z.boolean(),
  systolic_bp: z.number().int().min(80).max(260),
  on_cycle: z.boolean(),
  weeks_remaining: z.number().int().min(0).max(52),
});

export type LipidOptimizerInput = z.infer<typeof LipidOptimizerInputSchema>;

const band = z.enum(['optimal', 'borderline', 'high', 'very-high']);

export const LipidOptimizerResultSchema = z.object({
  ldl_status: band,
  hdl_status: band,
  tg_status: band,
  non_hdl: z.number().finite().min(0),
  overall_band: band,
  interventions: z.array(z.string()).max(16),
});

export type LipidOptimizerResult = z.infer<typeof LipidOptimizerResultSchema>;

