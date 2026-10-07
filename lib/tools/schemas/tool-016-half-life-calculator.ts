/**
 * Tool #016 — Half-Life Calculator
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const HalfLifeCompoundSchema = z.object({
  id: z.number(),
  name_en: z.string(),
  name_ar: z.string(),
  family: z.string(),
  half_life_days: z.number().min(0.5).max(30),
  is_lipophilic: z.boolean(),
  bioavailability: z.number().min(0).max(1),
  default_dose_mg: z.number().min(0).max(1000),
  description_text: z.string(),
  ester_type: z.string().optional(),
});

export type HalfLifeCompound = z.infer<typeof HalfLifeCompoundSchema>;

export const HalfLifeInputSchema = z.object({
  compounds: z.array(HalfLifeCompoundSchema).min(1).max(10),
  body_fat_percentage: z.number().optional().min(5).max(50),
  organ_health: z.enum(['optimal', 'normal', 'compromised']),
  clearance_threshold: z.number().optional().min(1).max(99),
});

export type HalfLifeInput = z.infer<typeof HalfLifeInputSchema>;

export const HalfLifeResultSchema = z.object({
  total_half_lives: z.number().min(1).max(10),
  effective_half_life_days: z.number().min(1).max(365),
  washout_days: z.number().min(1).max(365),
  washout_weeks: z.number().min(1).max(52),
  bottleneck_compound: HalfLifeCompoundSchema,
  confidence_score: z.number().min(0).max(100),
  recommendations: z.array(z.string()).min(0).max(10),
});

export type HalfLifeResult = z.infer<typeof HalfLifeResultSchema>;