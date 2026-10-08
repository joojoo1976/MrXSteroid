/**
 * Tool #025 — Drug Interaction Checker Pro
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const DrugCompoundSchema = z.object({
  id: z.number(),
  name_en: z.string(),
  name_ar: z.string(),
  family: z.string(),
  dosage_mg: z.number().min(1),
  is_lipophilic: z.boolean(),
  primary_target: z.enum(['androgen', 'estrogen', 'cortisol', 'other']),
  half_life_hours: z.number().min(0.5).max(720),
});

export type DrugCompound = z.infer<typeof DrugCompoundSchema>;

export const DrugInteractionInputSchema = z.object({
  compounds: z.array(DrugCompoundSchema).min(2).max(6),
  user_age: z.number().min(18).max(80),
  user_weight_kg: z.number().min(40).max(300),
  health_conditions: z.array(z.enum(['liver', 'heart', 'prostate', 'high_bp'])),
  current_medications: z.array(z.string()).min(0).max(10),
});

export type DrugInteractionInput = z.infer<typeof DrugInteractionInputSchema>;

export const DrugInteractionSchema = z.object({
  compound1: z.string(),
  compound2: z.string(),
  interaction_type: z.enum(['additive', 'antagonist', 'enhanced_side_effect', 'contraindicated']),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']),
  description: z.string(),
  recommendation: z.string(),
});

export type DrugInteraction = z.infer<typeof DrugInteractionSchema>;

export const DrugInteractionResultSchema = z.object({
  total_interactions: z.number().min(0).max(50),
  critical_interactions: z.number().min(0).max(20),
  moderate_interactions: z.number().min(0).max(50),
  interactions: z.array(DrugInteractionSchema).min(0).max(50),
  safety_score: z.number().min(0).max(100),
  recommendations: z.array(z.string()).min(0).max(15),
});

export type DrugInteractionResult = z.infer<typeof DrugInteractionResultSchema>;