/**
 * Tool #010 — Compound Stack Builder
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const StackCompoundSchema = z.object({
  id: z.number(),
  name_en: z.string(),
  name_ar: z.string(),
  family: z.string(),
  weekly_dose_mg: z.number().min(0),
  duration_weeks: z.number().int().min(1),
  synergy_score: z.number().min(-100).max(100),
  primary_effect: z.enum(['mass', 'cutting', 'recovery', 'performance']),
  aromatization_factor: z.number().min(0).max(1),
});

export type StackCompound = z.infer<typeof StackCompoundSchema>;

export const CompoundStackSchema = z.object({
  name: z.string(),
  compounds: z.array(StackCompoundSchema),
  total_weekly_dose: z.number().min(0),
  estimated_suppression: z.number().min(0).max(100),
  synergy_rating: z.enum(['negative', 'neutral', 'positive']),
  recommendations: z.array(z.string()),
});

export type CompoundStack = z.infer<typeof CompoundStackSchema>;