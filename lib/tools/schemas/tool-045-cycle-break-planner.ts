/**
 * Tool #045 — Cycle Break Planner
 * Zod input/output contract.
 */
import { z } from 'zod';

export const BreakCompoundSchema = z.object({
  name_en: z.string().min(1).max(80),
  half_life_days: z.number().finite().min(0.5).max(30),
  suppression_factor: z.number().int().min(1).max(3),
});

export const CycleBreakInputSchema = z.object({
  cycle_weeks_used: z.number().int().min(4).max(52),
  compounds: z.array(BreakCompoundSchema).min(1).max(8),
  wants_bloodwork: z.boolean(),
});

export type CycleBreakInput = z.infer<typeof CycleBreakInputSchema>;

export const CycleBreakResultSchema = z.object({
  days_to_full_clear: z.number().int().min(1).max(365),
  pct_start_day: z.number().int().min(1).max(365),
  pct_duration_weeks: z.number().int().min(4).max(8),
  recovery_milestones: z
    .array(
      z.object({
        week: z.number().int().min(0).max(104),
        label_en: z.string().max(80),
        label_ar: z.string().max(80),
      }),
    )
    .max(8),
  total_weeks_to_baseline: z.number().int().min(1).max(104),
  warnings: z.array(z.string().max(64)).max(8),
});

export const CycleBreakOutputSchema = z.object({
  toolId: z.string(),
  toolSlug: z.string(),
  locale: z.string(),
  unitSystem: z.string(),
  snapshotType: z.string(),
  calculatedAt: z.string(),
  recordedAt: z.string(),
  timezone: z.string(),
  accessTier: z.string(),
  keyFindings: z.array(z.any()),
  provenance: z.any(),
  seoLinks: z.any(),
  result: CycleBreakResultSchema,
});
