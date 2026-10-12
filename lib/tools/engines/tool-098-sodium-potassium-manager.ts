/**
 * Tool #098 — Sodium-Potassium Manager
 * Layer 1: Pure TypeScript calculation engine.
 * Evaluates dietary and supplemental Na:K ratio balance.
 * Assesses blood pressure reactivity, intracellular hydration, and cardiac conduction stability.
 */

export interface SodiumPotassiumManagerInput {
  daily_sodium_mg: number; // e.g. 1500..8000
  daily_potassium_mg: number; // e.g. 1500..6000
  aldosterone_stress_or_aas: boolean; // mineralocorticoid water retention tendency
  resting_blood_pressure_systolic: number; // e.g. 110..160
}

export interface SodiumPotassiumManagerResult {
  sodium_to_potassium_ratio: number;
  electrolyte_balance_tier: 'optimal' | 'sodium-dominant' | 'potassium-deficient-high-risk';
  cardiovascular_strain_index: number; // 0..100
  clinical_recommendations: string[];
}

export function manageSodiumPotassium(input: SodiumPotassiumManagerInput): SodiumPotassiumManagerResult {
  const {
    daily_sodium_mg,
    daily_potassium_mg,
    aldosterone_stress_or_aas,
    resting_blood_pressure_systolic,
  } = input;

  const clinical_recommendations: string[] = ['educational_electrolyte_ratio_model'];

  const safePotassium = Math.max(500, daily_potassium_mg);
  const ratio = Math.round((daily_sodium_mg / safePotassium) * 100) / 100;

  let strain = 25;

  if (ratio > 2.0) {
    strain += 35;
    clinical_recommendations.push('excessive_sodium_dominance_promotes_arterial_stiffness_and_intracellular_dehydration');
  } else if (ratio > 1.3) {
    strain += 15;
    clinical_recommendations.push('elevate_dietary_potassium_rich_foods_to_approach_1_to_1_physiological_ratio');
  } else {
    strain -= 10;
  }

  if (aldosterone_stress_or_aas) {
    strain += 20;
    clinical_recommendations.push('mineralocorticoid_or_androgen_activity_blunts_renal_sodium_excretion');
  }

  if (resting_blood_pressure_systolic >= 140) {
    strain += 25;
    clinical_recommendations.push('systolic_hypertension_exacerbated_by_high_sodium_load');
  } else if (resting_blood_pressure_systolic >= 130) {
    strain += 10;
  }

  const cardiovascular_strain_index = Math.min(100, Math.max(0, Math.round(strain)));

  let electrolyte_balance_tier: 'optimal' | 'sodium-dominant' | 'potassium-deficient-high-risk';
  if (ratio <= 1.2 && daily_potassium_mg >= 3500) {
    electrolyte_balance_tier = 'optimal';
  } else if (ratio > 2.0 || daily_potassium_mg < 2500) {
    electrolyte_balance_tier = 'potassium-deficient-high-risk';
  } else {
    electrolyte_balance_tier = 'sodium-dominant';
  }

  return {
    sodium_to_potassium_ratio: ratio,
    electrolyte_balance_tier,
    cardiovascular_strain_index,
    clinical_recommendations,
  };
}
