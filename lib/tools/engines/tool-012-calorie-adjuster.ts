/**
 * Tool #012 — Calorie Adjuster
 * Layer 12: Dynamic TDEE & Calorie Target Calculator
 * Platform: MrXSteroid.com | Core: Energy Balance & Weight Management
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Deterministic estimate engine. Formula and fixed ±500 kcal goal offsets are
 * preserved from the existing implementation; the offsets are assumptions,
 * not individualized nutrition prescriptions.
 */
import { CalorieInputSchema, CalorieResultSchema, type CalorieInput, type CalorieResult } from '../schemas/tool-012-calorie-adjuster';

export type { CalorieInput, CalorieResult } from '../schemas/tool-012-calorie-adjuster';

const ACTIVITY_MULTIPLIERS: Record<CalorieInput['activity_level'], number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(input: CalorieInput): CalorieResult {
  const data = CalorieInputSchema.parse(input);
  const { age, gender, height_cm: heightCm, current_weight_kg: weightKg, activity_level, goal, weeks_per_phase } = data;

  // Mifflin-St Jeor Equation
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const multiplier = ACTIVITY_MULTIPLIERS[activity_level];
  const tdee = Math.round(bmr * multiplier);

  // Calculate target calories based on goal
  const maintenanceCalories = tdee;
  let targetCalories: number;
  let weeklyAdjustment: number;
  
  switch (goal) {
    case 'bulk':
      targetCalories = tdee + 500; // 500 cal surplus for muscle gain
      weeklyAdjustment = 3500 / 7; // ~500g per week
      break;
    case 'cut':
      targetCalories = tdee - 500; // 500 cal deficit for fat loss
      weeklyAdjustment = -3500 / 7; // ~500g per week loss
      break;
    case 'maintain':
      targetCalories = tdee;
      weeklyAdjustment = 0;
      break;
  }

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (goal === 'bulk') {
    recommendations.push(`Target: +${(targetCalories - maintenanceCalories)}cal daily surplus for lean bulk`);
    recommendations.push('Focus on protein intake: 1.6-2.2g per kg bodyweight');
    recommendations.push('Monitor weight gain: aim for 0.25-0.5kg per week');
  }
  
  if (goal === 'cut') {
    recommendations.push(`Target: ${Math.abs(targetCalories - maintenanceCalories)}cal daily deficit for fat loss`);
    recommendations.push('Maintain protein: 2.0-2.4g per kg bodyweight to preserve muscle');
    recommendations.push('Monitor weight loss: aim for 0.5-1kg per week maximum');
  }
  
  if (goal === 'maintain') {
    recommendations.push('Maintain current weight with balanced nutrition');
    recommendations.push('Focus on performance in the gym rather than scale weight');
  }

  return CalorieResultSchema.parse({
    tdee,
    tdee_range: [tdee - 100, tdee + 100],
    maintenance_calories: maintenanceCalories,
    target_calories: targetCalories,
    weekly_adjustment: weeklyAdjustment,
    phase_duration_weeks: weeks_per_phase,
    recommendations,
  });
}
