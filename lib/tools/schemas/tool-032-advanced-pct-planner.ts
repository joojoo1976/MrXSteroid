/**
 * Tool #032 — Advanced PCT Planner
 * Zod input/output contract. Reuses the engine's TypeScript types.
 */
import { z } from 'zod';

const isoDate = z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
  message: 'must be an ISO-8601 date',
});

export const PctCompoundSchema = z.object({
  name_en: z.string().min(1).max(80),
  ester_half_life_days: z.number().finite().min(0.5).max(60),
  weekly_dose_mg: z.number().finite().min(1).max(5000),
  last_dose_date: isoDate,
  suppression_factor: z.number().finite().min(0).max(5),
});

export const PctPlannerInputSchema = z.object({
  compounds: z.array(PctCompoundSchema).min(1).max(8),
  hcg_used_on_cycle: z.boolean(),
  clearance_threshold: z.number().finite().min(0.01).max(0.2).optional(),
});

export type PctPlannerInput = z.infer<typeof PctPlannerInputSchema>;

export const SermPhaseSchema = z.object({
  drug: z.enum(['nolvadex', 'clomid', 'nolvadex+clomid']),
  daily_dose_mg: z.string().min(1).max(60),
  weeks: z.number().int().min(1).max(12),
  note: z.string().min(1).max(240),
});

export const PctPlannerResultSchema = z.object({
  washout_days: z.number().int().min(0).max(365),
  pct_start_date: isoDate,
  suppression_load: z.number().finite().min(0),
  serm_protocol: z.array(SermPhaseSchema).max(4),
  hcg_bridge: z
    .object({
      dose_iu: z.number().int().min(100).max(5000),
      per_week: z.number().int().min(1).max(7),
      weeks: z.number().int().min(1).max(6),
    })
    .nullable(),
  warnings: z.array(z.string()).max(12),
});

export type PctPlannerResult = z.infer<typeof PctPlannerResultSchema>;
