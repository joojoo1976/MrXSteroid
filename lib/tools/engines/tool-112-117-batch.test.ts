import { describe, expect, it } from 'vitest';
import { calcFoodQualityScore } from './tool-112-food-quality-micronutrient-diversity-score';
import { calcGroceryOptimization } from './tool-113-ai-grocery-basket-meal-cost-optimizer';
import { calcRestaurantMacros } from './tool-114-restaurant-macro-navigator';
import { calcSupplementStack } from './tool-115-supplement-evidence-bio-stack-navigator';
import { calcNutritionGap } from './tool-116-nutrition-gap-fasting-window-optimizer';
import { calcIntraWorkout } from './tool-117-intra-workout-nutrient-volumizer';
import { buildFoodQualityOutput } from '../adapters/tool-112-food-quality-micronutrient-diversity-score';
import { buildGroceryOutput } from '../adapters/tool-113-ai-grocery-basket-meal-cost-optimizer';
import { buildRestaurantOutput } from '../adapters/tool-114-restaurant-macro-navigator';
import { buildSupplementOutput } from '../adapters/tool-115-supplement-evidence-bio-stack-navigator';
import { buildNutritionGapOutput } from '../adapters/tool-116-nutrition-gap-fasting-window-optimizer';
import { buildIntraWorkoutOutput } from '../adapters/tool-117-intra-workout-nutrient-volumizer';

describe('SmartTools batch 8 engines', () => {
  it('marks uncalibrated provenance honestly for tools 112–117', () => {
    const options = { locale: 'en' as const, unitSystem: 'metric' as const, snapshotType: 'draft' as const, calculatedAt: '2026-10-24T12:00:00.000Z', recordedAt: '2026-10-24T12:00:00.000Z' };
    const outputs = [
      buildFoodQualityOutput({ days_tracked: 1, foods: [] }, options),
      buildGroceryOutput({ items: [{ id: 'x', name: 'Beans', price_per_unit: 1, unit: 'can', unit_size_g: 400, macros_per_100g: { protein: 20, carbs: 5, fat: 3, calories: 130 }, min_quantity: 1, max_quantity: 2, category: 'protein' }], daily_targets: { calories: 500, protein_g: 20, carbs_g: 20, fat_g: 10 }, budget_usd: 10, days: 1 }, options),
      buildRestaurantOutput({ items: [] }, options),
      buildSupplementOutput({ supplements: [], goals: [] }, options),
      buildNutritionGapOutput({ food_log: [], days_tracked: 1, sex: 'female', fasting_goal: 'general_wellness', chronotype: 'intermediate', typical_wake_time: '07:00', typical_sleep_time: '23:00' }, options),
      buildIntraWorkoutOutput({ training_type: 'resistance', duration_min: 60, intensity: 'moderate', climate: 'moderate', goal: 'performance', current_intake: { carbs_g_per_h: 30, sodium_mg_per_h: 300, fluid_ml_per_h: 500, eaa_g_per_h: 5 } }, options),
    ];

    expect(outputs.map((output) => output.provenance.confidence)).toEqual([null, null, null, null, null, null]);
    expect(outputs.every((output) => output.provenance.dataQuality === 'not_assessed')).toBe(true);
    expect(outputs.every((output) => output.seoLinks.prevTool.slug && output.seoLinks.nextTool.slug)).toBe(true);
  });

  it('normalizes food processing distribution by serving mass', () => {
    const result = calcFoodQualityScore({
      days_tracked: 3,
      foods: [
        { name: 'Apple', group: 'fruits', processing_level: 'unprocessed', serving_size_g: 100, calories_per_serving: 95, micronutrients: ['vitamin_c'] },
        { name: 'Snack', group: 'ultra_processed', processing_level: 'ultra_processed', serving_size_g: 300, calories_per_serving: 95, micronutrients: [] },
      ],
    });
    expect(result.processing_distribution.unprocessed).toBe(0.25);
    expect(result.processing_distribution.ultra_processed).toBe(0.75);
  });

  it('allows a grocery unit that consumes the exact remaining budget', () => {
    const result = calcGroceryOptimization({
      items: [{
        id: 'beans', name: 'Beans', price_per_unit: 10, unit: 'can', unit_size_g: 400,
        macros_per_100g: { protein: 20, carbs: 5, fat: 3, calories: 130 },
        min_quantity: 1, max_quantity: 1, category: 'protein',
      }],
      daily_targets: { calories: 500, protein_g: 20, carbs_g: 20, fat_g: 10 },
      budget_usd: 10,
      days: 1,
    });
    expect(result.selected_items).toHaveLength(1);
    expect(result.total_cost_usd).toBe(10);
  });

  it('marks meals with unrecognized ingredients as incomplete estimates', () => {
    const result = calcRestaurantMacros({ items: [{
      id: 'meal', name: 'Unknown dish', cuisine: 'other', meal_type: 'lunch', portion_size: 'regular',
      ingredients: [{ name: 'unlisted ingredient', estimated_weight_g: 120 }],
    }] });
    expect(result.items[0].incomplete_ingredients).toBe(true);
    expect(result.flags).toContain('some_ingredients_unrecognized');
  });

  it('does not infer supplement interactions without a reviewed source', () => {
    const result = calcSupplementStack({
      supplements: [
        { id: 'a', name: 'Creatine', category: 'other', studies: [], claimed_benefits: [], typical_dose: '' },
        { id: 'b', name: 'Caffeine', category: 'other', studies: [], claimed_benefits: [], typical_dose: '' },
      ],
      goals: [],
    });
    expect(result.stack_analysis.pairwise_interactions[0].effect).toBe('unknown');
    expect(result.stack_analysis.overall_synergy).toBe('unknown');
    expect(result.supplements.every((supplement) => supplement.interaction_risk === 'none')).toBe(true);
  });

  it('marks omitted nutrients as not reported instead of zero intake', () => {
    const result = calcNutritionGap({
      food_log: [{ name: 'Food log entry', amount_g: 100, nutrients: { vitamin_c: 90 } }],
      days_tracked: 1, sex: 'female', fasting_goal: 'general_wellness', chronotype: 'intermediate',
      typical_wake_time: '07:00', typical_sleep_time: '23:00',
    });
    expect(result.nutrient_analysis.find((entry) => entry.nutrient === 'vitamin_a')?.status).toBe('not_reported');
    expect(result.identified_gaps).not.toContain('vitamin_a');
    expect(result.nutrient_analysis.find((entry) => entry.nutrient === 'vitamin_c')?.status).toBe('adequate');
  });

  it('uses entered EAA intake and rejects invalid direct engine inputs', () => {
    const result = calcIntraWorkout({
      training_type: 'resistance', duration_min: 90, intensity: 'moderate', climate: 'moderate',
      goal: 'performance', current_intake: { carbs_g_per_h: 30, sodium_mg_per_h: 300, fluid_ml_per_h: 500, eaa_g_per_h: 0 },
    });
    expect(result.flags).toContain('current_eaa_intake_below_target');
    expect(() => calcIntraWorkout({
      training_type: 'resistance', duration_min: 90, intensity: 'invalid' as 'moderate', climate: 'moderate', goal: 'performance',
    })).toThrow('Invalid intra-workout inputs');
  });
});
