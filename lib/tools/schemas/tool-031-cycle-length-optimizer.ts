/**
 * Tool #031 — Cycle Length Optimizer
 * Zod input/output contract. Reuses the engine's TypeScript types.
 */
import { z } from 'zod';

export const CycleLengthCompoundSchema = z.object({
  name_en: z.string().min(1).max(80),
  suppression_factor: z.number().finite().min(0).max(5),
  half_life_days: z.number().finite().min(0.5).max(60),
  weekly_dose_mg: z.number().finite().min(1).max(5000),
});

export const CycleLengthInputSchema = z.object({
  goal: z.enum(['bulk', 'cut', 'recomp', 'strength']),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  previous_cycles: z.number().int().min(0).max(30),
  compounds: z.array(CycleLengthCompoundSchema).min(1).max(8),
});

export type CycleLengthInput = z.infer<typeof CycleLengthInputSchema>;

export const CycleLengthResultSchema = z.object({
  min_weeks: z.number().int().min(1).max(52),
  optimal_weeks: z.number().int().min(1).max(52),
  max_weeks: z.number().int().min(1).max(52),
  suppression_load: z.number().finite().min(0),
  ester_bottleneck_days: z.number().finite().min(0),
  rationale: z.array(z.string()).max(12),
});

export type CycleLengthResult = z.infer<typeof CycleLengthResultSchema>;
