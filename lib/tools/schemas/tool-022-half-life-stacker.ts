/**
 * Tool #022 — Compound Half-Life Stacker
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const EsterCompoundSchema = z.object({
  id: z.number(),
  name_en: z.string(),
  name_ar: z.string(),
  family: z.string(),
  ester_type: z.enum(['acetate', 'phenylpropionate', 'propionate', 'decanoate', 'undecanoate', 'enanthate', 'cypionate', 'heptanoate', 'other']),
  half_life_days: z.number().min(0.5).max(60),
  release_rate: z.enum(['slow', 'medium', 'fast']),
  anabolic_score: z.number().min(0).max(500),
  androgenic_score: z.number().min(0).max(500),
  description_text: z.string(),
});

export type EsterCompound = z.infer<typeof EsterCompoundSchema>;

export const StackTimingInputSchema = z.object({
  compounds: z.array(EsterCompoundSchema).min(1).max(6),
  cycle_length_weeks: z.number().min(1).max(52),
  injection_frequency: z.enum(['daily', 'every-other-day', '2x-week', '1x-week']),
  user_goal: z.enum(['bulk', 'cut', 'recomp', 'strength']),
});

export type StackTimingInput = z.infer<typeof StackTimingInputSchema>;

export const StackTimingResultSchema = z.object({
  peak_platform_days: z.number().min(1).max(365),
  total_cycle_half_lives: z.number().min(0.1).max(100),
  recommended_pct_start_days: z.number().min(1).max(365),
  washout_complete_days: z.number().min(1).max(365),
  ester_bottleneck: EsterCompoundSchema,
  optimal_injection_schedule: z.array(z.string()).min(0).max(52),
  compound_peak_times: z.record(z.string(), z.number()),
  confidence_score: z.number().min(0).max(100),
});

export type StackTimingResult = z.infer<typeof StackTimingResultSchema>;