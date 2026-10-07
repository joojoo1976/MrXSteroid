/**
 * Tool #013 — Macro Optimizer
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const MacroInputSchema = z.object({
  weight_kg: z.number().min(30).max(200),
  goal: z.enum(['bulk', 'cut', 'maintain']),
  protein_per_kg: z.number().optional().min(1).max(5),
  fats_per_kg: z.number().optional().min(0.5).max(2),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  meals_per_day: z.number().optional().min(1).max(8),
});

export type MacroInput = z.infer<typeof MacroInputSchema>;

export const MacroTargetsSchema = z.object({
  protein_g: z.number(),
  protein_per_meal: z.number(),
  fats_g: z.number(),
  carbs_g: z.number(),
  total_calories: z.number(),
  meal_breakdown: z.array(z.object({
    meal_number: z.number(),
    protein_g: z.number(),
    carbs_g: z.number(),
    fats_g: z.number(),
    calories: z.number(),
  })),
});

export type MacroTargets = z.infer<typeof MacroTargetsSchema>;