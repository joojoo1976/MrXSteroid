/**
 * Tool #014 — Water Retention Calculator
 * Layer 14: Estrogenic Water Weight & Management
 * Platform: MrXSteroid.com | Core: Fluid Balance & Estrogen Management
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Calculate water retention based on compound stack & estrogen levels
 * - Recommend diuretic support (natural & pharmaceutical)
 * - Track progress over time
 * - Full Measurement System Toggle (metric/imperial)
 * - i18n support (Arabic/English)
 * - Debounced state persistence
 */

export interface CompoundItem {
  id: number;
  name_en: string;
  name_ar: string;
  family: string;
  suppression_factor: number;
  half_life_days: number;
  is_lipophilic: boolean;
  bioavailability: number;
  default_dose_mg: number;
  description_text: string;
  aromatization_factor?: number;
}

export interface WaterRetentionInput {
  e2_level: number;        // Estradiol (pg/mL)
  weight_kg: number;
  compound_stack: CompoundItem[]; // Compound items from DB
  sodium_intake_mg?: number; // Daily sodium (mg)
  carb_intake_g?: number;  // Daily carbs (g)
  potassium_intake_mg?: number; // Daily potassium (mg)
}

export interface WaterRetentionResult {
  estimated_retention_liters: number; // Estimated excess water weight
  retention_severity: 'low' | 'moderate' | 'high';
  recommendations: string[];
  diuretic_suggestions: string[];
  target_weight_loss_kg: number;
}

export function calculateWaterRetention(input: WaterRetentionInput): WaterRetentionResult {
  const { e2_level, weight_kg, compound_stack, sodium_intake_mg, carb_intake_g, potassium_intake_mg } = input;
  
  // Estimate aromatization risk from compound stack
  let totalAromatizingDose = 0;
  for (const compound of compound_stack) {
    const dose = (compound as unknown as Record<string, unknown>).default_dose_mg;
    const arom = (compound as unknown as Record<string, unknown>).aromatization_factor;
    totalAromatizingDose += (typeof dose === 'number' ? dose : 0) * (typeof arom === 'number' ? arom : 0);
  }
  
  // Determine retention severity based on E2 and aromatization
  let severity: 'low' | 'moderate' | 'high';
  let retentionLiters: number;
  
  if (e2_level > 80 || totalAromatizingDose > 600) {
    severity = 'high';
    retentionLiters = Math.round(weight_kg * 0.05 * (e2_level / 50)); // 5% body weight factor scaled by E2
  } else if (e2_level > 50 || totalAromatizingDose > 300) {
    severity = 'moderate';
    retentionLiters = Math.round(weight_kg * 0.03 * (e2_level / 40));
  } else {
    severity = 'low';
    retentionLiters = Math.round(weight_kg * 0.01 * (e2_level / 30));
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  const diureticSuggestions: string[] = [];
  
  if (sodium_intake_mg && sodium_intake_mg > 3000) {
    recommendations.push('Reduce sodium intake to < 2300mg/day to minimize water retention');
    diureticSuggestions.push('Increase potassium-rich foods (bananas, spinach, avocados)');
  }
  
  if (carb_intake_g && carb_intake_g > 300) {
    recommendations.push('Carbohydrates bind water: 1g carb ≈ 3g water. Consider cyclical carb approach');
    diureticSuggestions.push('Consider moderate carb cycling during cutting phase');
  }
  
  if (potassium_intake_mg && potassium_intake_mg < 3500) {
    recommendations.push('Increase potassium intake to 3500-4700mg/day to balance fluids');
    diureticSuggestions.push('Add potassium citrate or citramalate supplements');
  }
  
  // General recommendations based on severity
  switch (severity) {
    case 'high':
      recommendations.push('High estrogenic activity detected - consider AI support (see Tool #6)');
      diureticSuggestions.push('Consider pharmaceutical diuretic under medical supervision');
      break;
    case 'moderate':
      recommendations.push('Moderate retention - monitor sodium and carbs closely');
      diureticSuggestions.push('Natural diuretics: dandelion root, caffeine in moderation');
      break;
    case 'low':
      recommendations.push('Mild retention - normal response to training/nutrition');
      diureticSuggestions.push('Ensure adequate hydration; paradoxically, drinking more water reduces retention');
      break;
  }
  
  // Target weight loss (water weight only)
  const targetWeightLossKg = Math.min(retentionLiters * 1, 5); // 1kg per liter max, cap at 5kg
  
  return {
    estimated_retention_liters: retentionLiters,
    retention_severity: severity,
    recommendations,
    diuretic_suggestions: diureticSuggestions,
    target_weight_loss_kg: targetWeightLossKg,
  };
}