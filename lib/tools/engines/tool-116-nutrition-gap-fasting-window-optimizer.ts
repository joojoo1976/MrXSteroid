/**
 * Tool #116 - Nutrition Gap & Fasting Window Optimizer
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY: This tool identifies potential micronutrient gaps from
 * user-reported dietary intake and suggests fasting windows. It does not
 * diagnose deficiencies, prescribe supplements, or provide medical nutrition
 * therapy. Results are educational references only.
 *
 * Model
 * -----
 * Micronutrient Gap Analysis: Compares reported intake (from food log)
 * against RDA/AI values. Flags nutrients below 70% RDA as potential gaps.
 *
 * Fasting Window: Suggests time-restricted eating windows based on
 * user schedule, goals, and chronotype. Educational reference only.
 */

export type Nutrient =
  | 'vitamin_a' | 'vitamin_c' | 'vitamin_d' | 'vitamin_e' | 'vitamin_k'
  | 'thiamin' | 'riboflavin' | 'niacin' | 'vitamin_b6' | 'folate' | 'vitamin_b12'
  | 'calcium' | 'iron' | 'magnesium' | 'phosphorus' | 'potassium' | 'zinc' | 'copper' | 'manganese' | 'selenium' | 'iodine' | 'chromium' | 'molybdenum';

export type FastingGoal = 'weight_loss' | 'metabolic_health' | 'longevity' | 'muscle_retention' | 'general_wellness';
export type Chronotype = 'early' | 'intermediate' | 'late';

export interface FoodLogEntry {
  name: string;
  amount_g: number;
  nutrients: Partial<Record<Nutrient, number>>; // per entry
}

export interface NutritionGapInput {
  food_log: FoodLogEntry[];
  days_tracked: number;
  sex: 'male' | 'female';
  fasting_goal?: FastingGoal;
  chronotype?: Chronotype;
  typical_wake_time?: string; // HH:MM
  typical_sleep_time?: string; // HH:MM
  current_fasting_window?: number; // hours
}

export interface NutritionGapResult {
  nutrient_analysis: Array<{
    nutrient: Nutrient;
    rda: number; // per day
    avg_intake: number; // per day from log
    pct_rda: number;
    status: 'adequate' | 'low' | 'very_low' | 'excessive' | 'not_reported';
    gap_amount?: number;
    unit: string;
    food_sources: string[];
  }>;
  identified_gaps: Nutrient[];
  fasting_recommendation: {
    suggested_window_hours: number;
    eating_window_start: string; // HH:MM
    eating_window_end: string; // HH:MM
    rationale: string;
    chronotype_alignment: number; // 0-1
  };
  flags: string[];
  education_flags: string[];
  scope_notice: string;
}

// RDA values (simplified, adult averages)
const RDA: Record<Nutrient, { male: number; female: number; unit: string }> = {
  vitamin_a: { male: 900, female: 700, unit: 'mcg RAE' },
  vitamin_c: { male: 90, female: 75, unit: 'mg' },
  vitamin_d: { male: 15, female: 15, unit: 'mcg' },
  vitamin_e: { male: 15, female: 15, unit: 'mg' },
  vitamin_k: { male: 120, female: 90, unit: 'mcg' },
  thiamin: { male: 1.2, female: 1.1, unit: 'mg' },
  riboflavin: { male: 1.3, female: 1.1, unit: 'mg' },
  niacin: { male: 16, female: 14, unit: 'mg NE' },
  vitamin_b6: { male: 1.7, female: 1.5, unit: 'mg' },
  folate: { male: 400, female: 400, unit: 'mcg DFE' },
  vitamin_b12: { male: 2.4, female: 2.4, unit: 'mcg' },
  calcium: { male: 1000, female: 1000, unit: 'mg' },
  iron: { male: 8, female: 18, unit: 'mg' },
  magnesium: { male: 420, female: 320, unit: 'mg' },
  phosphorus: { male: 700, female: 700, unit: 'mg' },
  potassium: { male: 3400, female: 2600, unit: 'mg' },
  zinc: { male: 11, female: 8, unit: 'mg' },
  copper: { male: 900, female: 900, unit: 'mcg' },
  manganese: { male: 2.3, female: 1.8, unit: 'mg' },
  selenium: { male: 55, female: 55, unit: 'mcg' },
  iodine: { male: 150, female: 150, unit: 'mcg' },
  chromium: { male: 35, female: 25, unit: 'mcg' },
  molybdenum: { male: 45, female: 45, unit: 'mcg' },
};

// Common food sources per nutrient
const NUTRIENT_SOURCES: Record<Nutrient, string[]> = {
  vitamin_a: ['Liver', 'Sweet potato', 'Carrots', 'Spinach', 'Pumpkin'],
  vitamin_c: ['Bell peppers', 'Citrus fruits', 'Strawberries', 'Broccoli', 'Kiwi'],
  vitamin_d: ['Fatty fish', 'Egg yolks', 'Fortified dairy', 'Mushrooms (UV)', 'Sunlight'],
  vitamin_e: ['Almonds', 'Sunflower seeds', 'Avocado', 'Spinach', 'Olive oil'],
  vitamin_k: ['Kale', 'Spinach', 'Broccoli', 'Brussels sprouts', 'Natto'],
  thiamin: ['Pork', 'Sunflower seeds', 'Legumes', 'Whole grains', 'Nuts'],
  riboflavin: ['Eggs', 'Lean meat', 'Milk', 'Mushrooms', 'Spinach'],
  niacin: ['Chicken', 'Tuna', 'Turkey', 'Peanuts', 'Mushrooms'],
  vitamin_b6: ['Chickpeas', 'Salmon', 'Chicken', 'Potatoes', 'Bananas'],
  folate: ['Dark leafy greens', 'Legumes', 'Asparagus', 'Avocado', 'Liver'],
  vitamin_b12: ['Shellfish', 'Liver', 'Fish', 'Meat', 'Eggs', 'Fortified foods'],
  calcium: ['Dairy', 'Sardines', 'Tofu', 'Kale', 'Fortified plant milk'],
  iron: ['Red meat', 'Liver', 'Lentils', 'Spinach', 'Pumpkin seeds'],
  magnesium: ['Pumpkin seeds', 'Almonds', 'Spinach', 'Cashews', 'Dark chocolate'],
  phosphorus: ['Meat', 'Fish', 'Dairy', 'Nuts', 'Legumes'],
  potassium: ['Potatoes', 'Bananas', 'Avocado', 'Spinach', 'Beans'],
  zinc: ['Oysters', 'Beef', 'Pumpkin seeds', 'Crab', 'Chicken'],
  copper: ['Liver', 'Oysters', 'Nuts', 'Seeds', 'Dark chocolate'],
  manganese: ['Mussels', 'Hazelnuts', 'Brown rice', 'Spinach', 'Pineapple'],
  selenium: ['Brazil nuts', 'Tuna', 'Sardines', 'Eggs', 'Chicken'],
  iodine: ['Seaweed', 'Cod', 'Dairy', 'Iodized salt', 'Shrimp'],
  chromium: ['Broccoli', 'Grape juice', 'Meat', 'Whole grains', 'Nuts'],
  molybdenum: ['Legumes', 'Nuts', 'Leafy vegetables', 'Liver', 'Dairy'],
};

function parseTime(timeStr: string): { hours: number; minutes: number } | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

function timeToMinutes(timeStr: string): number {
  const parsed = parseTime(timeStr);
  return parsed ? parsed.hours * 60 + parsed.minutes : 7 * 60; // default 7:00
}

export function calcNutritionGap(input: NutritionGapInput): NutritionGapResult {
  const { food_log, days_tracked, sex, fasting_goal, chronotype, typical_wake_time, typical_sleep_time, current_fasting_window } = input;

  if (food_log.length === 0 || days_tracked === 0) {
    return {
      nutrient_analysis: [],
      identified_gaps: [],
      fasting_recommendation: {
        suggested_window_hours: 16,
        eating_window_start: '12:00',
        eating_window_end: '20:00',
        rationale: 'Default 16:8 protocol',
        chronotype_alignment: 0.5,
      },
      flags: ['no_food_data_provided'],
      education_flags: ['insufficient_data_for_nutrient_analysis'],
      scope_notice: 'educational_nutrient_gap_analysis_not_medical_diagnosis',
    };
  }

  // Aggregate nutrient intake
  const nutrientTotals: Partial<Record<Nutrient, number>> = {};
  for (const entry of food_log) {
    for (const [nutrient, amount] of Object.entries(entry.nutrients)) {
      nutrientTotals[nutrient as Nutrient] = (nutrientTotals[nutrient as Nutrient] ?? 0) + (amount as number);
    }
  }

  // Average daily intake
  const avgIntake: Partial<Record<Nutrient, number>> = {};
  for (const [nutrient, total] of Object.entries(nutrientTotals)) {
    avgIntake[nutrient as Nutrient] = total / days_tracked;
  }

  // Analyze each nutrient
  const nutrientList: Nutrient[] = [
    'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
    'thiamin', 'riboflavin', 'niacin', 'vitamin_b6', 'folate', 'vitamin_b12',
    'calcium', 'iron', 'magnesium', 'phosphorus', 'potassium', 'zinc',
    'copper', 'manganese', 'selenium', 'iodine', 'chromium', 'molybdenum',
  ];

  const nutrientAnalysis = nutrientList.map((nutrient) => {
    const rda = RDA[nutrient][sex];
    const intake = avgIntake[nutrient];
    if (intake === undefined) {
      return { nutrient, rda, avg_intake: 0, pct_rda: 0, status: 'not_reported' as const, unit: RDA[nutrient].unit, food_sources: NUTRIENT_SOURCES[nutrient] ?? [] };
    }
    const pctRDA = rda > 0 ? Math.round((intake / rda) * 100) : 0;

    let status: 'adequate' | 'low' | 'very_low' | 'excessive';
    if (pctRDA >= 100 && pctRDA <= 200) status = 'adequate';
    else if (pctRDA >= 70) status = 'low';
    else if (pctRDA < 70) status = 'very_low';
    else status = 'excessive';

    const gapAmount = status === 'low' || status === 'very_low' ? Math.max(0, rda - intake) : undefined;

    return {
      nutrient,
      rda,
      avg_intake: Math.round(intake * 100) / 100,
      pct_rda: pctRDA,
      status,
      gap_amount: gapAmount === undefined ? undefined : Math.round(gapAmount * 100) / 100,
      unit: RDA[nutrient].unit,
      food_sources: NUTRIENT_SOURCES[nutrient] ?? [],
    };
  });

  const identifiedGaps = nutrientAnalysis
    .filter((n) => n.status === 'low' || n.status === 'very_low')
    .map((n) => n.nutrient);

  // Fasting window recommendation
  const wakeTime = typical_wake_time ? timeToMinutes(typical_wake_time) : 7 * 60;
  const sleepTime = typical_sleep_time ? timeToMinutes(typical_sleep_time) : 23 * 60;

  let suggestedWindow = 16; // default 16:8
  let rationale = 'Standard 16:8 time-restricted eating';

  switch (fasting_goal) {
    case 'weight_loss':
      suggestedWindow = 16;
      rationale = 'Example 16:8 schedule selected for this goal; not an individualized recommendation';
      break;
    case 'metabolic_health':
      suggestedWindow = 14;
      rationale = 'Example 14:10 schedule selected for this goal; not an individualized recommendation';
      break;
    case 'longevity':
      suggestedWindow = 16;
      rationale = 'Example 16:8 schedule selected for this goal; benefits are not assessed by this tool';
      break;
    case 'muscle_retention':
      suggestedWindow = 12;
      rationale = 'Example 12:12 schedule selected for this goal; protein adequacy is not assessed here';
      break;
    default:
      suggestedWindow = 14;
      rationale = 'Example 14:10 schedule selected as a planning reference; not an individualized recommendation';
  }

  // Adjust for chronotype
  let chronotypeAlignment = 0.7;
  if (chronotype === 'early') {
    // Early birds: earlier eating window
    chronotypeAlignment = 0.9;
  } else if (chronotype === 'late') {
    // Night owls: later eating window
    chronotypeAlignment = 0.9;
  }

  // Calculate eating window times
  let eatingStart, eatingEnd;
  if (chronotype === 'early') {
    eatingStart = `${String(Math.floor(wakeTime / 60)).padStart(2, '0')}:${String(wakeTime % 60).padStart(2, '0')}`;
    const endMins = wakeTime + (24 - suggestedWindow) * 60;
    eatingEnd = `${String(Math.floor(endMins / 60) % 24).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`;
  } else if (chronotype === 'late') {
    const startMins = sleepTime - (24 - suggestedWindow) * 60;
    eatingStart = `${String(Math.floor(startMins / 60) % 24).padStart(2, '0')}:${String(startMins % 60).padStart(2, '0')}`;
    eatingEnd = `${String(Math.floor(sleepTime / 60) % 24).padStart(2, '0')}:${String(sleepTime % 60).padStart(2, '0')}`;
  } else {
    // Intermediate: center around midday
    const midDay = 12 * 60;
    const halfWindow = ((24 - suggestedWindow) / 2) * 60;
    eatingStart = `${String(Math.floor(midDay - halfWindow) / 60 % 24).padStart(2, '0')}:${String(Math.floor(midDay - halfWindow) % 60).padStart(2, '0')}`;
    eatingEnd = `${String(Math.floor(midDay + halfWindow) / 60 % 24).padStart(2, '0')}:${String(Math.floor(midDay + halfWindow) % 60).padStart(2, '0')}`;
  }

  const flags: string[] = [];
  if (identifiedGaps.length > 5) flags.push('multiple_micronutrient_gaps_detected');
  if (identifiedGaps.some((n) => ['vitamin_d', 'vitamin_b12', 'iron', 'calcium'].includes(n))) {
    flags.push('critical_nutrient_gap_detected');
  }
  if (days_tracked < 3) flags.push('short_tracking_period_limits_accuracy');
  if (current_fasting_window && Math.abs(current_fasting_window - suggestedWindow) > 2) {
    flags.push('current_fasting_differs_from_recommendation');
  }

  return {
    nutrient_analysis: nutrientAnalysis,
    identified_gaps: identifiedGaps,
    fasting_recommendation: {
      suggested_window_hours: suggestedWindow,
      eating_window_start: eatingStart,
      eating_window_end: eatingEnd,
      rationale,
      chronotype_alignment: Math.round(chronotypeAlignment * 100) / 100,
    },
    flags,
    education_flags: [
      'intake_based_on_self_reported_food_log_not_biomarkers',
      'rda_values_are_population_averages_individual_needs_vary',
      'fasting_recommendations_are_educational_not_medical_prescriptions',
      'consult_healthcare_provider_before_starting_fasting_protocol',
      'nutrient_gaps_indicate_potential_insufficiency_not_deficiency',
    ],
    scope_notice: 'educational_nutrient_gap_and_fasting_reference_not_medical_diagnosis_or_prescription',
  };
}
