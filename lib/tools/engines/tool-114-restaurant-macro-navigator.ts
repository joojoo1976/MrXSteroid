/**
 * Tool #114 - Restaurant Macro Navigator & Fast-Food Estimator
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY: This tool estimates macros for restaurant meals from
 * user-provided data or common reference values. It does not access live
 * restaurant APIs, guarantee accuracy, or replace nutrition labels.
 * All estimates carry uncertainty ranges.
 *
 * Model
 * -----
 * Uses values supplied by the user, a small built-in ingredient table, or a
 * generic cuisine placeholder. Displayed ranges are illustrative model bounds,
 * not statistical confidence intervals or restaurant nutrition data.
 */

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type CuisineType = 'american' | 'mexican' | 'italian' | 'chinese' | 'japanese' | 'indian' | 'mediterranean' | 'fast_food' | 'other';

export interface RestaurantItem {
  id: string;
  name: string;
  restaurant?: string;
  cuisine: CuisineType;
  meal_type: MealType;
  // User can provide known values or leave blank for estimation
  known_calories?: number;
  known_protein_g?: number;
  known_carbs_g?: number;
  known_fat_g?: number;
  // Ingredients for estimation (if known values not provided)
  ingredients?: Array<{
    name: string;
    estimated_weight_g: number;
    macros_per_100g?: { protein: number; carbs: number; fat: number; calories: number };
  }>;
  // Portion size modifier
  portion_size: 'small' | 'regular' | 'large' | 'extra_large';
}

export interface RestaurantInput {
  items: RestaurantItem[];
  date?: string; // optional tracking date
}

export interface RestaurantResult {
  items: Array<{
    id: string;
    name: string;
    estimated_calories: number;
    estimated_protein_g: number;
    estimated_carbs_g: number;
    estimated_fat_g: number;
    uncertainty_range: {
      calories: [number, number];
      protein: [number, number];
      carbs: [number, number];
      fat: [number, number];
    };
    data_source: 'user_provided' | 'reference_estimate' | 'ingredient_estimate';
    confidence: 'high' | 'medium' | 'low';
    incomplete_ingredients: boolean;
  }>;
  daily_totals: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  daily_uncertainty: {
    calories: [number, number];
    protein: [number, number];
    carbs: [number, number];
    fat: [number, number];
  };
  flags: string[];
  education_flags: string[];
  scope_notice: string;
}

// Reference macros per 100g for common ingredients (USDA-based approximations)
const INGREDIENT_REFERENCES: Record<string, { protein: number; carbs: number; fat: number; calories: number }> = {
  // Proteins
  'chicken breast': { protein: 31, carbs: 0, fat: 3.6, calories: 165 },
  'chicken thigh': { protein: 24, carbs: 0, fat: 9, calories: 179 },
  'ground beef 80/20': { protein: 17, carbs: 0, fat: 20, calories: 254 },
  'ground beef 90/10': { protein: 20, carbs: 0, fat: 10, calories: 176 },
  'salmon': { protein: 22, carbs: 0, fat: 12, calories: 206 },
  'tuna': { protein: 26, carbs: 0, fat: 1, calories: 116 },
  'eggs': { protein: 13, carbs: 1, fat: 10, calories: 143 },
  'tofu': { protein: 8, carbs: 2, fat: 4, calories: 76 },
  // Carbs
  'white rice': { protein: 2.7, carbs: 28, fat: 0.3, calories: 130 },
  'brown rice': { protein: 2.6, carbs: 23, fat: 0.9, calories: 111 },
  'pasta': { protein: 5, carbs: 25, fat: 1.1, calories: 131 },
  'bread': { protein: 9, carbs: 49, fat: 3, calories: 265 },
  'tortilla flour': { protein: 7, carbs: 46, fat: 8, calories: 297 },
  'tortilla corn': { protein: 5.7, carbs: 44, fat: 2.9, calories: 218 },
  'potato': { protein: 2, carbs: 17, fat: 0.1, calories: 77 },
  'french fries': { protein: 3.4, carbs: 41, fat: 15, calories: 312 },
  // Vegetables
  'lettuce': { protein: 1.4, carbs: 2.9, fat: 0.2, calories: 15 },
  'tomato': { protein: 0.9, carbs: 3.9, fat: 0.2, calories: 18 },
  'onion': { protein: 1.1, carbs: 9.3, fat: 0.1, calories: 40 },
  'pepper': { protein: 1, carbs: 6, fat: 0.3, calories: 31 },
  'broccoli': { protein: 2.8, carbs: 7, fat: 0.4, calories: 34 },
  // Fats/Sauces
  'olive oil': { protein: 0, carbs: 0, fat: 100, calories: 884 },
  'butter': { protein: 0.9, carbs: 0.1, fat: 81, calories: 717 },
  'cheese cheddar': { protein: 25, carbs: 1.3, fat: 33, calories: 402 },
  'cheese mozzarella': { protein: 22, carbs: 2.2, fat: 22, calories: 280 },
  'mayo': { protein: 1, carbs: 0.6, fat: 75, calories: 680 },
  'ketchup': { protein: 1.6, carbs: 27, fat: 0.1, calories: 112 },
  'bbq sauce': { protein: 1, carbs: 35, fat: 0.5, calories: 150 },
  // Fast food components
  'burger bun': { protein: 9, carbs: 49, fat: 3, calories: 265 },
  'burger patty': { protein: 17, carbs: 0, fat: 20, calories: 254 },
  'bacon': { protein: 13, carbs: 1.5, fat: 42, calories: 541 },
};

const PORTION_MULTIPLIERS: Record<RestaurantItem['portion_size'], number> = {
  small: 0.75,
  regular: 1.0,
  large: 1.35,
  extra_large: 1.6,
};

const CUISINE_DEFAULTS: Record<CuisineType, { protein: number; carbs: number; fat: number; calories: number }> = {
  american: { protein: 35, carbs: 55, fat: 30, calories: 600 },
  mexican: { protein: 28, carbs: 65, fat: 25, calories: 550 },
  italian: { protein: 25, carbs: 70, fat: 22, calories: 550 },
  chinese: { protein: 25, carbs: 60, fat: 28, calories: 550 },
  japanese: { protein: 30, carbs: 50, fat: 18, calories: 450 },
  indian: { protein: 20, carbs: 65, fat: 25, calories: 520 },
  mediterranean: { protein: 30, carbs: 45, fat: 25, calories: 500 },
  fast_food: { protein: 25, carbs: 55, fat: 35, calories: 600 },
  other: { protein: 25, carbs: 55, fat: 25, calories: 500 },
};

function estimateFromIngredients(ingredients: RestaurantItem['ingredients'], portionSize: RestaurantItem['portion_size']) {
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalCalories = 0;

  let matchedIngredients = 0;
  for (const ing of ingredients ?? []) {
    let macros = ing.macros_per_100g;
    if (!macros) {
      // Try to find in reference database
      const key = ing.name.toLowerCase().trim();
      macros = INGREDIENT_REFERENCES[key];
    }
    if (macros) {
      matchedIngredients += 1;
      const factor = (ing.estimated_weight_g / 100) * PORTION_MULTIPLIERS[portionSize];
      totalProtein += macros.protein * factor;
      totalCarbs += macros.carbs * factor;
      totalFat += macros.fat * factor;
      totalCalories += macros.calories * factor;
    }
  }

  return { protein: totalProtein, carbs: totalCarbs, fat: totalFat, calories: totalCalories, matchedIngredients, totalIngredients: ingredients?.length ?? 0 };
}

function estimateFromCuisine(cuisine: CuisineType, portionSize: RestaurantItem['portion_size']) {
  const base = CUISINE_DEFAULTS[cuisine] ?? CUISINE_DEFAULTS.other;
  const mult = PORTION_MULTIPLIERS[portionSize];
  return {
    protein: base.protein * mult,
    carbs: base.carbs * mult,
    fat: base.fat * mult,
    calories: base.calories * mult,
  };
}

export function calcRestaurantMacros(input: RestaurantInput): RestaurantResult {
  const { items } = input;

  if (items.length === 0) {
    return {
      items: [],
      daily_totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
      daily_uncertainty: { calories: [0, 0], protein: [0, 0], carbs: [0, 0], fat: [0, 0] },
      flags: ['no_items_provided'],
      education_flags: ['insufficient_data_for_estimation'],
      scope_notice: 'educational_restaurant_macro_estimator_not_nutrition_label',
    };
  }

  const processedItems = items.map((item) => {
    let estimated: { protein: number; carbs: number; fat: number; calories: number };
    let dataSource: RestaurantResult['items'][0]['data_source'];
    let confidence: RestaurantResult['items'][0]['confidence'];
    let incompleteIngredients = false;

    // Priority 1: User provided known values
    if (item.known_calories !== undefined && item.known_protein_g !== undefined &&
        item.known_carbs_g !== undefined && item.known_fat_g !== undefined) {
      estimated = {
        protein: item.known_protein_g,
        carbs: item.known_carbs_g,
        fat: item.known_fat_g,
        calories: item.known_calories,
      };
      dataSource = 'user_provided';
      confidence = 'high';
    }
    // Priority 2: Ingredients provided
    else if (item.ingredients && item.ingredients.length > 0) {
      const ingredientEstimate = estimateFromIngredients(item.ingredients, item.portion_size);
      incompleteIngredients = ingredientEstimate.matchedIngredients < ingredientEstimate.totalIngredients;
      estimated = ingredientEstimate.matchedIngredients === 0
        ? estimateFromCuisine(item.cuisine, item.portion_size)
        : ingredientEstimate;
      dataSource = ingredientEstimate.matchedIngredients === 0 ? 'reference_estimate' : 'ingredient_estimate';
      confidence = incompleteIngredients ? 'low' : 'medium';
    }
    // Priority 3: Cuisine-based estimate
    else {
      estimated = estimateFromCuisine(item.cuisine, item.portion_size);
      dataSource = 'reference_estimate';
      confidence = 'low';
    }

    // Apply uncertainty ranges
    const uncertaintyMultiplier = confidence === 'high' ? 0 : confidence === 'medium' ? 0.2 : 0.25;
    const uncertaintyRange = {
      calories: [
        Math.round(estimated.calories * (1 - uncertaintyMultiplier)),
        Math.round(estimated.calories * (1 + uncertaintyMultiplier)),
      ] as [number, number],
      protein: [
        Math.round(estimated.protein * (1 - uncertaintyMultiplier)),
        Math.round(estimated.protein * (1 + uncertaintyMultiplier)),
      ] as [number, number],
      carbs: [
        Math.round(estimated.carbs * (1 - uncertaintyMultiplier)),
        Math.round(estimated.carbs * (1 + uncertaintyMultiplier)),
      ] as [number, number],
      fat: [
        Math.round(estimated.fat * (1 - uncertaintyMultiplier)),
        Math.round(estimated.fat * (1 + uncertaintyMultiplier)),
      ] as [number, number],
    };

    return {
      id: item.id,
      name: item.name,
      estimated_calories: Math.round(estimated.calories),
      estimated_protein_g: Math.round(estimated.protein),
      estimated_carbs_g: Math.round(estimated.carbs),
      estimated_fat_g: Math.round(estimated.fat),
      uncertainty_range: uncertaintyRange,
      data_source: dataSource,
      confidence,
      incomplete_ingredients: incompleteIngredients,
    };
  });

  const dailyTotals = processedItems.reduce(
    (acc, item) => ({
      calories: acc.calories + item.estimated_calories,
      protein_g: acc.protein_g + item.estimated_protein_g,
      carbs_g: acc.carbs_g + item.estimated_carbs_g,
      fat_g: acc.fat_g + item.estimated_fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const dailyUncertainty = processedItems.reduce<
    { calories: [number, number]; protein: [number, number]; carbs: [number, number]; fat: [number, number] }
  >(
    (acc, item) => ({
      calories: [acc.calories[0] + item.uncertainty_range.calories[0], acc.calories[1] + item.uncertainty_range.calories[1]] as [number, number],
      protein: [acc.protein[0] + item.uncertainty_range.protein[0], acc.protein[1] + item.uncertainty_range.protein[1]] as [number, number],
      carbs: [acc.carbs[0] + item.uncertainty_range.carbs[0], acc.carbs[1] + item.uncertainty_range.carbs[1]] as [number, number],
      fat: [acc.fat[0] + item.uncertainty_range.fat[0], acc.fat[1] + item.uncertainty_range.fat[1]] as [number, number],
    }),
    { calories: [0, 0], protein: [0, 0], carbs: [0, 0], fat: [0, 0] }
  );

  const flags: string[] = [];
  const hasLowConfidence = processedItems.some((i) => i.confidence === 'low');
  const hasMediumConfidence = processedItems.some((i) => i.confidence === 'medium');
  if (hasLowConfidence) flags.push('contains_low_confidence_estimates');
  if (hasMediumConfidence) flags.push('contains_medium_confidence_estimates');
  if (processedItems.some((i) => i.incomplete_ingredients)) flags.push('some_ingredients_unrecognized');
  if (dailyTotals.calories > 3500) flags.push('high_calorie_day');
  if (dailyTotals.protein_g < 50) flags.push('low_protein_intake');

  return {
    items: processedItems,
    daily_totals: dailyTotals,
    daily_uncertainty: dailyUncertainty,
    flags,
    education_flags: [
      'estimates_based_on_reference_data_not_live_restaurant_nutrition',
      'uncertainty_ranges_are_illustrative_model_bounds_not_confidence_intervals',
      'built_in_ingredient_values_are_approximations_not_live_restaurant_data',
      'actual_restaurant_nutrition_may_differ_significantly',
      'not_a_substitute_for_official_nutrition_labels',
    ],
    scope_notice: 'educational_restaurant_macro_estimator_not_nutrition_label',
  };
}
