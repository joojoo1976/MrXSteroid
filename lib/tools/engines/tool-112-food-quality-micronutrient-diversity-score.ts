/**
 * Tool #112 - Food Quality & Micronutrient Diversity Score
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY: This model computes a dietary quality index from user-reported
 * food intake. It does not diagnose deficiencies, prescribe diets, or replace
 * clinical nutrition assessment. Results are reference calculations only.
 *
 * Model
 * -----
 * Food Quality Score: Weighted composite of whole-food ratio, processing level,
 * nutrient density, and variety. Range 0-100.
 *
 * Micronutrient Diversity Score: Count of unique micronutrient sources across
 * food groups, normalized to 0-100.
 *
 * Both scores are educational references from self-reported data.
 */

export type FoodGroup =
  | 'vegetables'
  | 'fruits'
  | 'whole_grains'
  | 'legumes'
  | 'nuts_seeds'
  | 'lean_protein'
  | 'dairy'
  | 'healthy_fats'
  | 'processed_meats'
  | 'refined_grains'
  | 'added_sugars'
  | 'fried_foods'
  | 'ultra_processed';

export type ProcessingLevel = 'unprocessed' | 'minimally_processed' | 'processed' | 'ultra_processed';

export interface FoodItem {
  name: string;
  group: FoodGroup;
  processing_level: ProcessingLevel;
  serving_size_g: number;
  calories_per_serving: number;
  micronutrients: string[]; // e.g., ['vitamin_c', 'potassium', 'magnesium']
}

export interface FoodQualityInput {
  foods: FoodItem[];
  days_tracked: number;
}

export interface FoodQualityResult {
  food_quality_score: number; // 0-100
  micronutrient_diversity_score: number; // 0-100
  whole_food_ratio: number; // 0-1
  processing_distribution: Record<ProcessingLevel, number>;
  food_group_coverage: number; // 0-1 (8 core groups)
  unique_micronutrients: number;
  total_micronutrient_instances: number;
  flags: string[];
  education_flags: string[];
  scope_notice: string;
}

const CORE_FOOD_GROUPS: FoodGroup[] = [
  'vegetables',
  'fruits',
  'whole_grains',
  'legumes',
  'nuts_seeds',
  'lean_protein',
  'dairy',
  'healthy_fats',
];

const MICRONUTRIENT_LIST = [
  'vitamin_a',
  'vitamin_c',
  'vitamin_d',
  'vitamin_e',
  'vitamin_k',
  'thiamin',
  'riboflavin',
  'niacin',
  'vitamin_b6',
  'folate',
  'vitamin_b12',
  'calcium',
  'iron',
  'magnesium',
  'phosphorus',
  'potassium',
  'zinc',
  'copper',
  'manganese',
  'selenium',
];

export function calcFoodQualityScore(input: FoodQualityInput): FoodQualityResult {
  const { foods, days_tracked } = input;

  if (foods.length === 0) {
    return {
      food_quality_score: 0,
      micronutrient_diversity_score: 0,
      whole_food_ratio: 0,
      processing_distribution: {
        unprocessed: 0,
        minimally_processed: 0,
        processed: 0,
        ultra_processed: 0,
      },
      food_group_coverage: 0,
      unique_micronutrients: 0,
      total_micronutrient_instances: 0,
      flags: ['no_food_data_provided'],
      education_flags: ['insufficient_data_for_meaningful_score'],
      scope_notice: 'educational_dietary_quality_reference_not_a_clinical_assessment',
    };
  }

  // Processing distribution
  const processingCounts: Record<ProcessingLevel, number> = {
    unprocessed: 0,
    minimally_processed: 0,
    processed: 0,
    ultra_processed: 0,
  };

  let totalServingGrams = 0;

  for (const food of foods) {
    processingCounts[food.processing_level] += food.serving_size_g;
    totalServingGrams += food.serving_size_g;
  }

  const processingDistribution: Record<ProcessingLevel, number> = {
    unprocessed: totalServingGrams > 0 ? processingCounts.unprocessed / totalServingGrams : 0,
    minimally_processed: totalServingGrams > 0 ? processingCounts.minimally_processed / totalServingGrams : 0,
    processed: totalServingGrams > 0 ? processingCounts.processed / totalServingGrams : 0,
    ultra_processed: totalServingGrams > 0 ? processingCounts.ultra_processed / totalServingGrams : 0,
  };

  // Whole food ratio (unprocessed + minimally processed)
  const wholeFoodRatio = processingDistribution.unprocessed + processingDistribution.minimally_processed;

  // Food group coverage
  const groupsPresent = new Set(foods.map((f) => f.group).filter((g) => CORE_FOOD_GROUPS.includes(g)));
  const foodGroupCoverage = groupsPresent.size / CORE_FOOD_GROUPS.length;

  // Micronutrient diversity
  const allMicronutrients = new Set<string>();
  let totalMicronutrientInstances = 0;
  for (const food of foods) {
    for (const micro of food.micronutrients) {
      allMicronutrients.add(micro.toLowerCase());
      totalMicronutrientInstances++;
    }
  }
  const uniqueMicronutrients = allMicronutrients.size;
  const micronutrientDiversityScore = Math.min(100, Math.round((uniqueMicronutrients / MICRONUTRIENT_LIST.length) * 100));

  // Food quality score: weighted composite
  // 40% whole food ratio, 30% food group coverage, 30% micronutrient diversity
  const foodQualityScore = Math.round(
    wholeFoodRatio * 40 + foodGroupCoverage * 30 + (micronutrientDiversityScore / 100) * 30
  );

  // Flags
  const flags: string[] = [];
  if (processingDistribution.ultra_processed > 0.3) {
    flags.push('high_ultra_processed_intake');
  }
  if (foodGroupCoverage < 0.5) {
    flags.push('low_food_group_variety');
  }
  if (uniqueMicronutrients < 10) {
    flags.push('low_micronutrient_diversity');
  }
  if (days_tracked < 3) {
    flags.push('short_tracking_period_limits_reliability');
  }

  return {
    food_quality_score: Math.max(0, Math.min(100, foodQualityScore)),
    micronutrient_diversity_score: micronutrientDiversityScore,
    whole_food_ratio: Math.round(wholeFoodRatio * 100) / 100,
    processing_distribution: Object.fromEntries(
      Object.entries(processingDistribution).map(([k, v]) => [k, Math.round(v * 100) / 100])
    ) as Record<ProcessingLevel, number>,
    food_group_coverage: Math.round(foodGroupCoverage * 100) / 100,
    unique_micronutrients: uniqueMicronutrients,
    total_micronutrient_instances: totalMicronutrientInstances,
    flags,
    education_flags: [
      'scores_are_educational_references_from_self_reported_data',
      'not_a_substitute_for_clinical_nutrition_assessment',
      'micronutrient_data_based_on_user_input_not_lab_analysis',
      'processing_classification_user_defined_may_vary',
    ],
    scope_notice: 'educational_dietary_quality_reference_not_a_diagnosis_or_prescription',
  };
}
