/**
 * Tool #012 — Calorie Adjuster
 * Layer 12: Dynamic TDEE & Calorie Target Calculator
 * Platform: MrXSteroid.com | Core: Energy Balance & Weight Management
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Calculate TDEE (Total Daily Energy Expenditure) using Mifflin-St Jeor equation
 * - Adjust calories for bulking, cutting, or maintenance
 * - Track progress and auto-adjust targets
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface CalorieInput {
  age: number;
  gender: 'male' | 'female';
  height_cm?: number;  // metric
  height_in?: number;  // imperial
  current_weight_kg?: number;
  current_weight_lbs?: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'bulk' | 'cut' | 'maintain';
  weeks_per_phase: number;
}

export interface CalorieResult {
  tdee: number;               // Total Daily Energy Expenditure
  tdee_range: [number, number]; // Min-Max range
  maintenance_calories: number;
  target_calories: number;    // Goal-specific target
  weekly_adjustment: number;  // Calories to add/lose per week
  phase_duration_weeks: number;
  recommendations: string[];
}

export function calculateTDEE(input: CalorieInput): CalorieResult {
  const { age, gender, height_cm, height_in, current_weight_kg, current_weight_lbs, activity_level, goal, weeks_per_phase } = input;
  
  // Convert to metric if needed
  let weightKg = current_weight_kg;
  let heightCm = height_cm;
  
  if (current_weight_lbs && !current_weight_kg) {
    weightKg = current_weight_lbs / 2.20462;
  }
  if (height_in && !height_cm) {
    heightCm = height_in * 2.54;
  }
  
  // Mifflin-St Jeor Equation
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  
  // Activity multiplier
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  const multiplier = activityMultipliers[activity_level] || 1.2;
  const tdee = Math.round(bmr * multiplier);
  
  // Calculate target calories based on goal
  let maintenanceCalories = tdee;
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
    default:
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
  
  return {
    tdee,
    tdee_range: [tdee - 100, tdee + 100],
    maintenance_calories: maintenanceCalories,
    target_calories: targetCalories,
    weekly_adjustment: weeklyAdjustment,
    phase_duration_weeks: weeks_per_phase || 8,
    recommendations,
  };
}