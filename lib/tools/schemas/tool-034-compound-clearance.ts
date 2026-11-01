/**
 * Tool #034 — Compound Clearance Calculator
 * Zod input/output contract. Reuses the engine's TypeScript types.
 */
import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  // setUTCFullYear avoids Date.UTC's special handling of years 00–99.
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}, { message: 'must be a valid ISO calendar date (YYYY-MM-DD)' });

export const ClearanceInputSchema = z.object({
  compound_name: z.string().trim().min(1).max(80),
  half_life_days: z.number().finite().min(0.5).max(365),
  half_life_source: z.string().trim().min(3).max(500),
  last_dose_date: isoDate,
  as_of_date: isoDate,
  threshold_fraction: z.number().finite().min(0.001).max(0.2).optional(),
}).strict().superRefine((input, context) => {
  const base = new Date(`${input.last_dose_date}T00:00:00.000Z`).getTime();
  const asOf = new Date(`${input.as_of_date}T00:00:00.000Z`).getTime();
  if (asOf < base) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['as_of_date'], message: 'Evaluation date cannot precede the entered dose date.' });
  }
  const threshold = input.threshold_fraction ?? 0.01;
  const daysToThreshold = Math.max(1, Math.ceil(input.half_life_days * (Math.log(1 / threshold) / Math.log(2))));
  const furthestCurveDay = Math.max(daysToThreshold, Math.round(5 * input.half_life_days));
  const targetDate = new Date(base + furthestCurveDay * 86_400_000);
  if (!Number.isFinite(targetDate.getTime()) || targetDate.getUTCFullYear() > 9999) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['last_dose_date'], message: 'The modeled threshold date is outside the supported calendar range.' });
  }
});

export type ClearanceInput = z.infer<typeof ClearanceInputSchema>;

export const ClearancePointSchema = z.object({
  days_after_last_dose: z.number().int().min(0).max(4_000),
  date: isoDate,
  remaining_percent: z.number().finite().min(0).max(100),
}).strict();

export const ClearanceResultSchema = z.object({
  days_to_threshold: z.number().int().min(1).max(4_000),
  threshold_date: isoDate,
  days_elapsed: z.number().int().min(0).max(4_000_000),
  modeled_remaining_percent: z.number().finite().min(0).max(100),
  threshold_reached: z.boolean(),
  threshold_fraction: z.number().finite().min(0.001).max(0.2),
  curve: z.array(ClearancePointSchema).max(12),
  model_note: z.string().min(1).max(500),
}).strict();

export type ClearanceResult = z.infer<typeof ClearanceResultSchema>;
