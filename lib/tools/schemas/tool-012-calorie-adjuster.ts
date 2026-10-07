/**
 * Tool #012 — Calorie Adjuster
 * Schema Validation using Zod
 */

import { z } from 'zod';

export const CalorieInputSchema = z.object({
  age: z.number().min(14).max(80),
  gender: z.enum(['male', 'female']),
  height_cm: z.number().optional().min(100).max(250),
  height_in: z.number().optional().min(40).max(80),
  current_weight_kg: z.number().optional().min(30).max(200),
  current_weight_lbs: z.number().optional().min(70).max(440),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['bulk', 'cut', 'maintain']),
  weeks_per_phase: z.number().optional().min(1).max(52},
});

export type CalorieInput = z.infer<typeof CalorieInputSchema>;

export const CalorieResultSchema = z.object({
  tdee: z.number().min(1000).max(5000),
  tdee_range: z.tuple([z.number(), z.number()]),
  maintenance_calories: z.number(),
  target_calories: z.number(),
  weekly_adjustment: z.number(),
  phase_duration_weeks: z.number().min(1).max(52),
  recommendations: z.array(z.string()),
});

export type CalorieResult = z.infer<typeof CalorieResultSchema>;