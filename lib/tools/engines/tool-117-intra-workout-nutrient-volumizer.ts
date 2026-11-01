/**
 * Tool #117 - Intra-Workout Nutrient Volumizer & Transport Engine
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY: This tool estimates intra-workout carbohydrate, electrolyte,
 * and amino acid needs from user-provided training parameters. It does not
 * prescribe supplements, guarantee performance enhancement, or replace
 * individualized sport nutrition guidance. Results are educational references.
 *
 * Model
 * -----
 * Carbohydrate: 30-60g/h for sessions >60min, up to 90g/h for >2.5h (multiple transportable carbs)
 * Electrolytes: Sodium 300-600mg/h, Potassium 100-200mg/h, Magnesium 50-100mg/h
 * Amino Acids: EAA 3-6g/h, BCAA 5-10g/h (if protein intake insufficient peri-workout)
 * Fluid: 400-800ml/h adjusted for sweat rate, climate, body weight
 */

export type TrainingType = 'resistance' | 'endurance' | 'mixed' | 'hiit' | 'skill';
export type Climate = 'cool' | 'moderate' | 'hot' | 'humid';
export type Intensity = 'low' | 'moderate' | 'high' | 'very_high';

export interface IntraWorkoutInput {
  training_type: TrainingType;
  duration_min: number;
  intensity: Intensity;
  climate: Climate;
  sweat_rate_ml_per_h?: number; // optional measured sweat rate
  goal: 'performance' | 'hydration' | 'recovery' | 'muscle_protein_synthesis';
  current_intake?: {
    carbs_g_per_h: number;
    sodium_mg_per_h: number;
    fluid_ml_per_h: number;
    eaa_g_per_h: number;
  };
}

export interface IntraWorkoutResult {
  recommendations: {
    carbohydrates: {
      target_g_per_h: number;
      total_g: number;
      type: 'glucose' | 'glucose_fructose' | 'maltodextrin' | 'cluster_dextrin';
      rationale: string;
    };
    electrolytes: {
      sodium_mg_per_h: number;
      potassium_mg_per_h: number;
      magnesium_mg_per_h: number;
      total_sodium_mg: number;
      total_potassium_mg: number;
      total_magnesium_mg: number;
    };
    fluid: {
      target_ml_per_h: number;
      total_ml: number;
      sodium_concentration_mmol_l: number;
    };
    amino_acids: {
      eaa_g_per_h: number;
      bcaa_g_per_h: number;
      total_eaa_g: number;
      rationale: string;
    };
  };
  session_totals: {
    total_carbs_g: number;
    total_sodium_mg: number;
    total_potassium_mg: number;
    total_magnesium_mg: number;
    total_fluid_ml: number;
    total_eaa_g: number;
  };
  flags: string[];
  education_flags: string[];
  scope_notice: string;
}

const CARB_GUIDELINES: Record<string, { min: number; max: number; type: IntraWorkoutResult['recommendations']['carbohydrates']['type'] }> = {
  '<60': { min: 0, max: 0, type: 'glucose' },
  '60-90': { min: 30, max: 60, type: 'glucose' },
  '90-150': { min: 60, max: 90, type: 'glucose_fructose' },
  '>150': { min: 80, max: 90, type: 'cluster_dextrin' },
};

const ELECTROLYTE_BASE = {
  sodium_mg_per_h: 500,
  potassium_mg_per_h: 150,
  magnesium_mg_per_h: 75,
};

const FLUID_BASE_ML_PER_H = 600;

const INTENSITY_MULTIPLIERS: Record<Intensity, { carb: number; fluid: number; electrolyte: number }> = {
  low: { carb: 0.7, fluid: 0.8, electrolyte: 0.8 },
  moderate: { carb: 1.0, fluid: 1.0, electrolyte: 1.0 },
  high: { carb: 1.2, fluid: 1.2, electrolyte: 1.2 },
  very_high: { carb: 1.4, fluid: 1.4, electrolyte: 1.3 },
};

const CLIMATE_MULTIPLIERS: Record<Climate, { fluid: number; electrolyte: number }> = {
  cool: { fluid: 0.85, electrolyte: 0.9 },
  moderate: { fluid: 1.0, electrolyte: 1.0 },
  hot: { fluid: 1.3, electrolyte: 1.2 },
  humid: { fluid: 1.4, electrolyte: 1.3 },
};

const TRAINING_TYPE_ADJUSTMENT: Record<TrainingType, { carb: number; eaa: number }> = {
  resistance: { carb: 0.9, eaa: 1.2 },
  endurance: { carb: 1.1, eaa: 1.0 },
  mixed: { carb: 1.0, eaa: 1.1 },
  hiit: { carb: 1.15, eaa: 1.1 },
  skill: { carb: 0.7, eaa: 0.8 },
};

export function calcIntraWorkout(input: IntraWorkoutInput): IntraWorkoutResult {
  const { training_type, duration_min, intensity, climate, sweat_rate_ml_per_h, goal, current_intake } = input;

  if (!Number.isFinite(duration_min) || duration_min <= 0 ||
      !INTENSITY_MULTIPLIERS[intensity] || !CLIMATE_MULTIPLIERS[climate] ||
      !TRAINING_TYPE_ADJUSTMENT[training_type] ||
      (sweat_rate_ml_per_h !== undefined && (!Number.isFinite(sweat_rate_ml_per_h) || sweat_rate_ml_per_h <= 0))) {
    throw new RangeError('Invalid intra-workout inputs');
  }

  const duration_h = duration_min / 60;

  const intensityMult = INTENSITY_MULTIPLIERS[intensity];
  const climateMult = CLIMATE_MULTIPLIERS[climate];
  const typeAdj = TRAINING_TYPE_ADJUSTMENT[training_type];

  // Electrolytes
  let targetSodiumPerH = Math.round(ELECTROLYTE_BASE.sodium_mg_per_h * intensityMult.electrolyte * climateMult.electrolyte);
  const targetPotassiumPerH = Math.round(ELECTROLYTE_BASE.potassium_mg_per_h * intensityMult.electrolyte * climateMult.electrolyte);
  const targetMagnesiumPerH = Math.round(ELECTROLYTE_BASE.magnesium_mg_per_h * intensityMult.electrolyte);

  // Fluid
  let targetFluidPerH = Math.round(FLUID_BASE_ML_PER_H * intensityMult.fluid * climateMult.fluid);
  if (sweat_rate_ml_per_h !== undefined) {
    targetFluidPerH = Math.round(sweat_rate_ml_per_h * 0.8);
  }

  // Sodium concentration in fluid (mmol/L)
  let sodiumMmolPerL = Math.round((targetSodiumPerH / targetFluidPerH) * 1000 / 23);

  // Carbohydrate recommendation
  let carbRange: { min: number; max: number; type: IntraWorkoutResult['recommendations']['carbohydrates']['type'] };
  if (duration_min < 60) {
    carbRange = CARB_GUIDELINES['<60'];
  } else if (duration_min <= 90) {
    carbRange = CARB_GUIDELINES['60-90'];
  } else if (duration_min <= 150) {
    carbRange = CARB_GUIDELINES['90-150'];
  } else {
    carbRange = CARB_GUIDELINES['>150'];
  }

  let targetCarbPerH = Math.round(
    ((carbRange.min + carbRange.max) / 2) * intensityMult.carb * typeAdj.carb * 10
  ) / 10;

  // Amino acids
  let targetEAAPerH = Math.round(4 * typeAdj.eaa * intensityMult.carb * 10) / 10;
  const targetBCAAPerH = Math.round(targetEAAPerH * 1.5);

  // Goal adjustments
  let goalNote = '';
  if (goal === 'hydration') {
    targetFluidPerH = Math.round(targetFluidPerH * 1.2);
    targetSodiumPerH = Math.round(targetSodiumPerH * 1.1);
    sodiumMmolPerL = Math.round((targetSodiumPerH / targetFluidPerH) * 1000 / 23);
    goalNote = 'Hydration priority: increased fluid and sodium';
  } else if (goal === 'recovery') {
    targetEAAPerH = Math.round(targetEAAPerH * 1.3);
    targetCarbPerH = Math.round(targetCarbPerH * 1.1);
    goalNote = 'Recovery priority: increased EAA and carbs';
  } else if (goal === 'muscle_protein_synthesis') {
    targetEAAPerH = Math.round(targetEAAPerH * 1.4);
    targetCarbPerH = Math.round(targetCarbPerH * 1.05);
    goalNote = 'MPS priority: higher EAA with moderate carbs';
  } else {
    goalNote = 'Performance priority: balanced fueling';
  }

  // Recalculate sodium concentration after goal adjustments
  sodiumMmolPerL = Math.round((targetSodiumPerH / targetFluidPerH) * 1000 / 23);

  const totalCarbs = Math.round(targetCarbPerH * duration_h * 10) / 10;
  const totalSodium = Math.round(targetSodiumPerH * duration_h);
  const totalPotassium = Math.round(targetPotassiumPerH * duration_h);
  const totalMagnesium = Math.round(targetMagnesiumPerH * duration_h);
  const totalFluid = Math.round(targetFluidPerH * duration_h);
  const totalEAA = Math.round(targetEAAPerH * duration_h * 10) / 10;

  const flags: string[] = [];
  if (duration_min < 45 && targetCarbPerH > 0) flags.push('short_session_carbs_optional');
  if (climate === 'hot' || climate === 'humid') flags.push('heat_hydration_priority');
  if (intensity === 'very_high') flags.push('very_high_intensity_gi_risk');
  if (current_intake) {
    if (current_intake.carbs_g_per_h < targetCarbPerH * 0.7) flags.push('current_carb_intake_below_target');
    if (current_intake.sodium_mg_per_h < targetSodiumPerH * 0.7) flags.push('current_sodium_intake_below_target');
    if (current_intake.fluid_ml_per_h < targetFluidPerH * 0.7) flags.push('current_fluid_intake_below_target');
    if (current_intake.eaa_g_per_h < targetEAAPerH * 0.7) flags.push('current_eaa_intake_below_target');
  }
  if (sodiumMmolPerL < 10) flags.push('low_sodium_concentration_consider_adding_salt');
  if (sodiumMmolPerL > 60) flags.push('high_sodium_concentration_gi_risk');

  return {
    recommendations: {
      carbohydrates: {
        target_g_per_h: targetCarbPerH,
        total_g: totalCarbs,
        type: carbRange.type,
        rationale: `Session ${duration_min}min, ${intensity} intensity, ${training_type} training. ${goalNote}`,
      },
      electrolytes: {
        sodium_mg_per_h: targetSodiumPerH,
        potassium_mg_per_h: targetPotassiumPerH,
        magnesium_mg_per_h: targetMagnesiumPerH,
        total_sodium_mg: totalSodium,
        total_potassium_mg: totalPotassium,
        total_magnesium_mg: totalMagnesium,
      },
      fluid: {
        target_ml_per_h: targetFluidPerH,
        total_ml: totalFluid,
        sodium_concentration_mmol_l: sodiumMmolPerL,
      },
      amino_acids: {
        eaa_g_per_h: targetEAAPerH,
        bcaa_g_per_h: targetBCAAPerH,
        total_eaa_g: totalEAA,
        rationale: `Training type: ${training_type}, goal: ${goal}. ${goalNote}`,
      },
    },
    session_totals: {
      total_carbs_g: totalCarbs,
      total_sodium_mg: totalSodium,
      total_potassium_mg: totalPotassium,
      total_magnesium_mg: totalMagnesium,
      total_fluid_ml: totalFluid,
      total_eaa_g: totalEAA,
    },
    flags,
    education_flags: [
      'recommendations_based_on_position_stands_and_research_reviews',
      'individual_sweat_rate_and_gi_tolerance_vary_significantly',
      'not_a_supplement_prescription_or_performance_guarantee',
      'test_strategy_in_training_before_competition',
      'consult_sports_dietitian_for_individualized_plan',
    ],
    scope_notice: 'educational_intra_workout_nutrition_reference_not_prescription',
  };
}
