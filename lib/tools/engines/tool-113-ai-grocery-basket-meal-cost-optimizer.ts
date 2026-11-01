/**
 * Tool #113 - AI Grocery Basket & Meal Cost Optimizer
 * Layer 1: Pure TypeScript deterministic education model.
 *
 * SCOPE BOUNDARY: This model optimizes a grocery list for cost and macros
 * from user-provided prices and food data. It does not access live store
 * pricing, generate shopping orders, or guarantee availability. Results are
 * reference calculations from user inputs only.
 *
 * Model
 * -----
 * Greedy heuristic that ranks user-provided items by protein per dollar and
 * adds quantities that improve a capped macro-coverage score. This is not a
 * linear-programming solver and does not guarantee an optimal basket.
 */

export interface GroceryItem {
  id: string;
  name: string;
  price_per_unit: number; // user-provided
  unit: 'g' | 'kg' | 'lb' | 'oz' | 'piece' | 'can' | 'pack';
  unit_size_g: number; // grams per unit
  macros_per_100g: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
  min_quantity: number;
  max_quantity: number;
  category: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit' | 'dairy' | 'pantry';
}

export interface GroceryInput {
  items: GroceryItem[];
  daily_targets: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  budget_usd: number;
  days: number;
}

export interface GroceryResult {
  selected_items: Array<{
    item_id: string;
    name: string;
    quantity: number;
    unit: string;
    cost_usd: number;
    macros: {
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      calories: number;
    };
  }>;
  total_cost_usd: number;
  total_macros: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    calories: number;
  };
  target_achievement: {
    calories_pct: number;
    protein_pct: number;
    carbs_pct: number;
    fat_pct: number;
  };
  budget_utilization_pct: number;
  flags: string[];
  education_flags: string[];
  scope_notice: string;
}

// Rule-based greedy heuristic for educational purposes; not an LP solver.
function solveGroceryOptimization(input: GroceryInput): GroceryResult {
  const { items, daily_targets, budget_usd, days } = input;

  if (items.length === 0) {
    return {
      selected_items: [],
      total_cost_usd: 0,
      total_macros: { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 },
      target_achievement: { calories_pct: 0, protein_pct: 0, carbs_pct: 0, fat_pct: 0 },
      budget_utilization_pct: 0,
      flags: ['no_items_provided'],
      education_flags: ['insufficient_data_for_optimization'],
      scope_notice: 'educational_grocery_optimizer_reference_not_a_shopping_order',
    };
  }

  // Scale targets to total period
  const totalTargets = {
    calories: daily_targets.calories * days,
    protein_g: daily_targets.protein_g * days,
    carbs_g: daily_targets.carbs_g * days,
    fat_g: daily_targets.fat_g * days,
  };

  // Sort by protein per dollar. This ranking is a heuristic, not an optimum.
  const itemsWithEfficiency = items.map((item) => {
    const macrosPerUnit = {
      protein: (item.macros_per_100g.protein * item.unit_size_g) / 100,
      carbs: (item.macros_per_100g.carbs * item.unit_size_g) / 100,
      fat: (item.macros_per_100g.fat * item.unit_size_g) / 100,
      calories: (item.macros_per_100g.calories * item.unit_size_g) / 100,
    };
    const proteinPerDollar = macrosPerUnit.protein / item.price_per_unit;
    return { ...item, macrosPerUnit, proteinPerDollar };
  });

  // Priority: items that provide good macro coverage per dollar
  itemsWithEfficiency.sort((a, b) => b.proteinPerDollar - a.proteinPerDollar);

  const selected: GroceryResult['selected_items'] = [];
  let remainingBudget = budget_usd;
  const currentMacros = { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 };

  for (const item of itemsWithEfficiency) {
    if (remainingBudget < item.price_per_unit) continue;

    // Determine how many units we can buy
    const maxAffordable = Math.floor(remainingBudget / item.price_per_unit);
    const maxByBounds = item.max_quantity;
    let quantity = Math.min(maxAffordable, maxByBounds);

    // Ensure minimum
    if (quantity < item.min_quantity) {
      if (item.min_quantity * item.price_per_unit <= remainingBudget) {
        quantity = item.min_quantity;
      } else {
        continue; // Can't afford minimum
      }
    }

    // Greedy: add units while they improve macro coverage and budget allows
    let bestQuantity = 0;
    let bestScore = -Infinity;

    for (let q = item.min_quantity; q <= quantity; q++) {
      const testMacros = {
        protein_g: currentMacros.protein_g + item.macrosPerUnit.protein * q,
        carbs_g: currentMacros.carbs_g + item.macrosPerUnit.carbs * q,
        fat_g: currentMacros.fat_g + item.macrosPerUnit.fat * q,
        calories: currentMacros.calories + item.macrosPerUnit.calories * q,
      };

      const proteinScore = Math.min(1, testMacros.protein_g / totalTargets.protein_g);
      const carbsScore = Math.min(1, testMacros.carbs_g / totalTargets.carbs_g);
      const fatScore = Math.min(1, testMacros.fat_g / totalTargets.fat_g);
      const calorieScore = Math.min(1, testMacros.calories / totalTargets.calories);

      const score = (proteinScore + carbsScore + fatScore + calorieScore) / 4;
      const cost = q * item.price_per_unit;

      if (cost <= remainingBudget && score > bestScore) {
        bestScore = score;
        bestQuantity = q;
      }
    }

    if (bestQuantity > 0) {
      const cost = bestQuantity * item.price_per_unit;
      selected.push({
        item_id: item.id,
        name: item.name,
        quantity: bestQuantity,
        unit: item.unit,
        cost_usd: Math.round(cost * 100) / 100,
        macros: {
          protein_g: Math.round(item.macrosPerUnit.protein * bestQuantity * 10) / 10,
          carbs_g: Math.round(item.macrosPerUnit.carbs * bestQuantity * 10) / 10,
          fat_g: Math.round(item.macrosPerUnit.fat * bestQuantity * 10) / 10,
          calories: Math.round(item.macrosPerUnit.calories * bestQuantity),
        },
      });
      currentMacros.protein_g += item.macrosPerUnit.protein * bestQuantity;
      currentMacros.carbs_g += item.macrosPerUnit.carbs * bestQuantity;
      currentMacros.fat_g += item.macrosPerUnit.fat * bestQuantity;
      currentMacros.calories += item.macrosPerUnit.calories * bestQuantity;
      remainingBudget -= cost;
    }
  }

  const totalCost = selected.reduce((sum, s) => sum + s.cost_usd, 0);
  const totalMacros = selected.reduce(
    (acc, s) => ({
      protein_g: acc.protein_g + s.macros.protein_g,
      carbs_g: acc.carbs_g + s.macros.carbs_g,
      fat_g: acc.fat_g + s.macros.fat_g,
      calories: acc.calories + s.macros.calories,
    }),
    { protein_g: 0, carbs_g: 0, fat_g: 0, calories: 0 }
  );

  const targetAchievement = {
    calories_pct: totalTargets.calories > 0 ? Math.round((totalMacros.calories / totalTargets.calories) * 100) : 0,
    protein_pct: totalTargets.protein_g > 0 ? Math.round((totalMacros.protein_g / totalTargets.protein_g) * 100) : 0,
    carbs_pct: totalTargets.carbs_g > 0 ? Math.round((totalMacros.carbs_g / totalTargets.carbs_g) * 100) : 0,
    fat_pct: totalTargets.fat_g > 0 ? Math.round((totalMacros.fat_g / totalTargets.fat_g) * 100) : 0,
  };

  const flags: string[] = [];
  if (targetAchievement.calories_pct < 80) flags.push('calorie_target_not_met');
  if (targetAchievement.protein_pct < 80) flags.push('protein_target_not_met');
  if (targetAchievement.carbs_pct < 80) flags.push('carbs_target_not_met');
  if (targetAchievement.fat_pct < 80) flags.push('fat_target_not_met');
  if (totalCost > budget_usd * 0.95) flags.push('budget_near_limit');
  if (selected.length < 3) flags.push('limited_variety_in_selection');

  return {
    selected_items: selected,
    total_cost_usd: Math.round(totalCost * 100) / 100,
    total_macros: {
      protein_g: Math.round(totalMacros.protein_g * 10) / 10,
      carbs_g: Math.round(totalMacros.carbs_g * 10) / 10,
      fat_g: Math.round(totalMacros.fat_g * 10) / 10,
      calories: Math.round(totalMacros.calories),
    },
    target_achievement: targetAchievement,
    budget_utilization_pct: budget_usd > 0 ? Math.round((totalCost / budget_usd) * 100) : 0,
    flags,
    education_flags: [
      'optimization_uses_user_provided_prices_not_live_store_data',
      'results_are_educational_reference_not_a_shopping_order',
      'macro_calculations_assume_accurate_user_input',
      'availability_and_actual_prices_may_differ',
    ],
    scope_notice: 'educational_grocery_cost_optimizer_not_a_shopping_service',
  };
}

export { solveGroceryOptimization as calcGroceryOptimization };
