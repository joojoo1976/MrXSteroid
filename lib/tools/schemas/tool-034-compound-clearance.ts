/**
 * Tool #034 — Compound Clearance Calculator
 * Zod input/output contract. Reuses the engine's TypeScript types.
 */
import { z } from 'zod';

const isoDate = z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
  message: 'must be an ISO-8601 date',
});

export const ClearanceInputSchema = z.object({
  compound_name: z.string().min(1).max(80),
  half_life_days: z.number().finite().min(0.5).max(60),
  last_dose_mg: z.number().finite().min(1).max(10000),
  last_dose_date: isoDate,
  threshold_fraction: z.number().finite().min(0.001).max(0.2).optional(),
});

export type ClearanceInput = z.infer<typeof ClearanceInputSchema>;

export const ClearancePointSchema = z.object({
  days_after_last_dose: z.number().int().min(0).max(400),
  date: isoDate,
  remaining_mg: z.number().finite().min(0),
  remaining_percent: z.number().finite().min(0).max(100),
});

export const ClearanceResultSchema = z.object({
  days_to_clear: z.number().int().min(1).max(400),
  clearance_date: isoDate,
  days_elapsed: z.number().int().min(0).max(100000),
  current_remaining_mg: z.number().finite().min(0),
  current_remaining_percent: z.number().finite().min(0).max(100),
  already_clear: z.boolean(),
  curve: z.array(ClearancePointSchema).max(12),
  note: z.string().min(1).max(240),
});

export type ClearanceResult = z.infer<typeof ClearanceResultSchema>;
