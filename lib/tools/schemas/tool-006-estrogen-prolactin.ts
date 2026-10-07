/**
 * Tool #006 — Estrogen & Prolactin Control
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const CompoundItemSchema = z.object({
  id: z.number(),
  name_en: z.string(),
  name_ar: z.string(),
  family: z.string(),
  suppression_factor: z.number(),
  half_life_days: z.number(),
  is_lipophilic: z.boolean(),
  bioavailability: z.number(),
  default_dose_mg: z.number(),
  description_text: z.string(),
  aromatization_factor: z.number(),
});

export const EstrogenProlactinInputSchema = z.object({
  e2Level: z.number().min(0).max(500),
  prolactinLevel: z.number().min(0).max(500),
  measurementSystem: z.enum(['metric', 'imperial']),
  currentAI: z.string().optional(),
  currentDA: z.string().optional(),
  compoundStack: z.array(CompoundItemSchema),
});

export const AromatizationScoreSchema = z.object({
  riskLevel: z.enum(['LOW', 'MODERATE', 'HIGH']),
  riskPercentage: z.number().min(0).max(100),
  recommendedAIMg: z.number().min(0),
  recommendedDAMg: z.number().min(0),
  keyFindings: z.array(z.string()),
});

export type CompoundItem = z.infer<typeof CompoundItemSchema>;
export type EstrogenProlactinInput = z.infer<typeof EstrogenProlactinInputSchema>;
export type AromatizationScore = z.infer<typeof AromatizationScoreSchema>;