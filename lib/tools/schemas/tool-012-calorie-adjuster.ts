import { z } from 'zod';

/** Canonical calculation input: body measurements are normalized to kg/cm at the UI boundary. */
export const CalorieInputSchema = z.object({
  age: z.number().finite().int().min(19).max(78),
  gender: z.enum(['male', 'female']),
  height_cm: z.number().finite().min(100).max(250),
  current_weight_kg: z.number().finite().min(30).max(200),
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goal: z.enum(['bulk', 'cut', 'maintain']),
  weeks_per_phase: z.number().finite().int().min(1).max(52),
}).strict();

export type CalorieInput = z.infer<typeof CalorieInputSchema>;

export const CalorieResultSchema = z.object({
  tdee: z.number().finite().nonnegative(),
  tdee_range: z.tuple([z.number().finite().nonnegative(), z.number().finite().nonnegative()]),
  maintenance_calories: z.number().finite().nonnegative(),
  target_calories: z.number().finite().nonnegative(),
  weekly_adjustment: z.number().finite(),
  phase_duration_weeks: z.number().finite().int().min(1).max(52),
  recommendations: z.array(z.string()),
}).strict();

export type CalorieResult = z.infer<typeof CalorieResultSchema>;
