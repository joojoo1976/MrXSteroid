/**
 * Tool #013 — deterministic macro scenario calculator.
 * Existing weight × 24 baseline and goal multipliers are preserved as
 * explicitly unvalidated scenario assumptions, not energy-needs advice.
 */
import { MacroInputSchema, MacroTargetsSchema, type MacroInput, type MacroMeal, type MacroTargets } from '../schemas/tool-013-macro-optimizer';

export type { MacroInput, MacroMeal, MacroTargets } from '../schemas/tool-013-macro-optimizer';

export function calculateMacros(input: MacroInput): MacroTargets {
  const data = MacroInputSchema.parse(input);
  const { weight_kg, goal, protein_per_kg, fats_per_kg, meals_per_day } = data;

  const protein_g = Math.round(weight_kg * protein_per_kg);
  const fats_g = Math.round(weight_kg * fats_per_kg);

  const proteinCalories = protein_g * 4;
  const fatsCalories = fats_g * 9;

  // Existing rough estimate retained as a labeled model assumption.
  const maintenanceBase = weight_kg * 24; // Rough estimate
  const goalMultiplier: Record<MacroInput['goal'], number> = { bulk: 1.1, cut: 0.85, maintain: 1 };
  const totalCalories = Math.round(maintenanceBase * goalMultiplier[goal]);
  const remainingCalories = totalCalories - proteinCalories - fatsCalories;
  if (remainingCalories < 0) throw new RangeError('MACROS_EXCEED_CALORIE_TARGET');

  const carbsCalories = remainingCalories;
  const carbs_g = Math.round(carbsCalories / 4);

  // Per-meal grams are rounded up; meal calories are approximate after rounding.
  const mealBreakdown: MacroMeal[] = [];
  const proteinPerMeal = Math.ceil(protein_g / meals_per_day);
  const fatsPerMeal = Math.ceil(fats_g / meals_per_day);
  const carbsPerMeal = Math.ceil(carbs_g / meals_per_day);

  for (let i = 1; i <= meals_per_day; i++) {
    const mealCalories = proteinPerMeal * 4 + fatsPerMeal * 9 + carbsPerMeal * 4;
    mealBreakdown.push({
      meal_number: i,
      protein_g: proteinPerMeal,
      carbs_g: carbsPerMeal,
      fats_g: fatsPerMeal,
      calories: mealCalories,
    });
  }

  return MacroTargetsSchema.parse({
    protein_g,
    protein_per_meal: proteinPerMeal,
    fats_g,
    carbs_g,
    total_calories: totalCalories,
    meal_breakdown: mealBreakdown,
  });
}
