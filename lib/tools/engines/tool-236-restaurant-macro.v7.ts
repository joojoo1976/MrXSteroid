import { RestaurantMacroInputV7Schema, type RestaurantMacroInputV7 } from '@/lib/tools/schemas/tool-236-restaurant-macro-navigator.v7';

const roundToTwo = (value: number): number => Number(value.toFixed(2));

export function calculateRestaurantLabelTotals(raw: unknown) {
  const input: RestaurantMacroInputV7 = RestaurantMacroInputV7Schema.parse(raw);
  const items = input.items.map((item) => {
    const labelCalories = roundToTwo(item.caloriesPerServing * item.servings);
    const proteinGrams = roundToTwo(item.proteinGramsPerServing * item.servings);
    const carbohydrateGrams = roundToTwo(item.carbohydrateGramsPerServing * item.servings);
    const fatGrams = roundToTwo(item.fatGramsPerServing * item.servings);
    const macroEnergyPerServing = item.proteinGramsPerServing * 4
      + item.carbohydrateGramsPerServing * 4
      + item.fatGramsPerServing * 9;

    return {
      itemName: item.itemName,
      restaurantName: item.restaurantName || null,
      servings: item.servings,
      sourceReference: item.sourceReference,
      userProvidedPerServing: {
        calories: item.caloriesPerServing,
        proteinGrams: item.proteinGramsPerServing,
        carbohydrateGrams: item.carbohydrateGramsPerServing,
        fatGrams: item.fatGramsPerServing,
      },
      calculatedTotals: {
        calories: labelCalories,
        proteinGrams,
        carbohydrateGrams,
        fatGrams,
      },
      labelCaloriesMinusMacroEnergyPerServing: roundToTwo(item.caloriesPerServing - macroEnergyPerServing),
    };
  });

  return {
    status: 'CALCULATED' as const,
    resultType: 'CALCULATED' as const,
    inputClassification: 'USER_PROVIDED' as const,
    items,
    totals: {
      calories: roundToTwo(items.reduce((sum, item) => sum + item.calculatedTotals.calories, 0)),
      proteinGrams: roundToTwo(items.reduce((sum, item) => sum + item.calculatedTotals.proteinGrams, 0)),
      carbohydrateGrams: roundToTwo(items.reduce((sum, item) => sum + item.calculatedTotals.carbohydrateGrams, 0)),
      fatGrams: roundToTwo(items.reduce((sum, item) => sum + item.calculatedTotals.fatGrams, 0)),
    },
    limitations: [
      'Nutrition values and source references are entered by the user and are not independently verified.',
      'Calories multiplied by servings are arithmetic; label-vs-macronutrient differences do not establish which value is correct.',
      'This tool does not estimate missing restaurant data or recommend meals.',
    ],
  };
}
