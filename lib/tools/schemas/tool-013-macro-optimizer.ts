import { z } from 'zod';

export const MacroInputSchema = z.object({
  weight_kg: z.number().finite().min(30).max(200),
  goal: z.enum(['bulk', 'cut', 'maintain']),
  protein_per_kg: z.number().finite().min(1).max(5),
  fats_per_kg: z.number().finite().min(0.5).max(2),
  meals_per_day: z.number().finite().int().min(1).max(8),
}).strict();

export type MacroInput = z.infer<typeof MacroInputSchema>;

export const MacroMealSchema = z.object({
  meal_number: z.number().int().min(1).max(8),
  protein_g: z.number().finite().nonnegative(),
  carbs_g: z.number().finite().nonnegative(),
  fats_g: z.number().finite().nonnegative(),
  calories: z.number().finite().nonnegative(),
}).strict();

export type MacroMeal = z.infer<typeof MacroMealSchema>;

export const MacroTargetsSchema = z.object({
  protein_g: z.number().finite().nonnegative(),
  protein_per_meal: z.number().finite().nonnegative(),
  fats_g: z.number().finite().nonnegative(),
  carbs_g: z.number().finite().nonnegative(),
  total_calories: z.number().finite().nonnegative(),
  meal_breakdown: z.array(MacroMealSchema).min(1).max(8),
}).strict();

export type MacroTargets = z.infer<typeof MacroTargetsSchema>;
