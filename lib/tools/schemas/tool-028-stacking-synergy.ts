/**
 * Tool #028 — Compound Stacking Synergy
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const StackingCompoundSchema = z.object({
  id: z.number(),
  name_en: z.string(),
  name_ar: z.string(),
  family: z.string(),
  anabolic_score: z.number().min(0).max(500),
  androgenic_score: z.number().min(0).max(500),
  primary_action: z.enum(['mass', 'definition', 'strength', 'recovery', 'fat_loss']),
  liver_toxicity: z.enum(['low', 'moderate', 'high']),
  estrogenic: z.enum(['none', 'mild', 'moderate', 'high']),
  description_text: z.string(),
});

export type StackingCompound = z.infer<typeof StackingCompoundSchema>;

export const StackingGoalSchema = z.object({
  id: z.number(),
  name_en: z.string(),
  name_ar: z.string(),
  target: z.enum(['bulk', 'cut', 'recomp', 'strength']),
  min_score: z.number().min(0).max(100),
  preferred_compounds: z.array(z.string()).min(0).max(10),
  avoided_compounds: z.array(z.string()).min(0).max(10),
});

export type StackingGoal = z.infer<typeof StackingGoalSchema>;

export const StackingSynergyInputSchema = z.object({
  compounds: z.array(StackingCompoundSchema).min(2).max(6),
  goal: z.enum(['bulk', 'cut', 'recomp', 'strength']),
  user_experience: z.enum(['beginner', 'intermediate', 'advanced', 'pro']),
});

export type StackingSynergyInput = z.infer<typeof StackingSynergyInputSchema>;

export const StackingSynergyResultSchema = z.object({
  synergy_score: z.number().min(0).max(100),
  overall_assessment: z.enum(['poor', 'fair', 'good', 'excellent']),
  compound_pair_interactions: z.array(z.string()).min(0).max(30),
  recommended_additions: z.array(z.string()).min(0).max(10),
  avoided_pairs: z.array(z.string()).min(0).max(10),
  protocol_tips: z.array(z.string()).min(0).max(10),
  best_for_goal: z.string(),
});

export type StackingSynergyResult = z.infer<typeof StackingSynergyResultSchema>;