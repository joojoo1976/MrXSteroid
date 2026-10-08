/**
 * Tool #020 — Genetic Potential Calculator
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const GeneticPotentialInputSchema = z.object({
  age: z.number().min(14).max(80),
  trainingYears: z.number().min(0).max(50),
  priorCycles: z.number().min(0).max(20),
  familyHistory: z.enum(['baldness', 'heart_disease', 'liver_disease', 'none', 'other']),
  bodyType: z.enum(['ectomorph', 'mesomorph', 'endomorph', 'mixed']),
  goal: z.enum(['bulk', 'cut', 'recomp', 'strength']),
  currentWeight: z.number().min(30).max(200),
  height: z.number().min(100).max(250),
});

export type GeneticPotentialInput = z.infer<typeof GeneticPotentialInputSchema>;

export const GeneticPotentialResultSchema = z.object({
  potential_score: z.number().min(0).max(100),
  body_type_assessment: z.string(),
  recommended_cycle_length: z.number().min(1).max(52),
  recommended_dosage_multiplier: z.number().min(0.5).max(2),
  risk_factors: z.array(z.string()),
  recommended_compounds: z.array(z.string()),
  avoided_compounds: z.array(z.string()),
  personalized_tips: z.array(z.string()),
});

export type GeneticPotentialResult = z.infer<typeof GeneticPotentialResultSchema>;