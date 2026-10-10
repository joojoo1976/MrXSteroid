/**
 * Tool #036 — Injection Schedule Planner
 * Zod input/output contract.
 */
import { z } from 'zod';

export const ScheduledCompoundSchema = z.object({
  name_en: z.string().min(1).max(80),
  weekly_dose_mg: z.number().finite().min(1).max(5000),
  concentration_mg_ml: z.number().finite().min(1).max(500),
  injections_per_week: z.number().int().min(1).max(7),
  max_ml_per_site: z.number().finite().min(0.5).max(10).default(3),
});

export const InjectionScheduleInputSchema = z.object({
  compounds: z.array(ScheduledCompoundSchema).min(1).max(8),
  rotation_sites: z.array(z.string().min(1).max(40)).min(1).max(12),
});

export type InjectionScheduleInput = z.infer<typeof InjectionScheduleInputSchema>;

export const ScheduledShotSchema = z.object({
  day: z.number().int().min(0).max(6),
  compound_name: z.string().min(1).max(80),
  dose_mg: z.number().finite().min(0),
  volume_ml: z.number().finite().min(0),
  site: z.string().min(1).max(40),
  split_warning: z.boolean(),
});

export const InjectionScheduleResultSchema = z.object({
  shots: z.array(ScheduledShotSchema).max(56),
  total_volume_ml_per_week: z.number().finite().min(0),
  busiest_day: z.number().int().min(0).max(6),
  warnings: z.array(z.string()).max(16),
});

