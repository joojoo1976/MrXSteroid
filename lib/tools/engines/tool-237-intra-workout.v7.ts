import { IntraWorkoutLabelInputV7Schema, type IntraWorkoutLabelInputV7 } from '@/lib/tools/schemas/tool-237-intra-workout-volumizer.v7';

const roundToTwo = (value: number): number => Number(value.toFixed(2));

export function calculateIntraWorkoutLabelTotals(raw: unknown) {
  const input: IntraWorkoutLabelInputV7 = IntraWorkoutLabelInputV7Schema.parse(raw);
  const servings = input.servingsConsumed;

  return {
    status: 'CALCULATED' as const,
    resultType: 'CALCULATED' as const,
    inputClassification: 'USER_PROVIDED' as const,
    productName: input.productName,
    sourceReference: input.sourceReference,
    servingsConsumed: servings,
    calculatedTotals: {
      volumeMl: roundToTwo(input.servingVolumeMl * servings),
      calories: roundToTwo(input.caloriesPerServing * servings),
      proteinGrams: roundToTwo(input.proteinGramsPerServing * servings),
      carbohydrateGrams: roundToTwo(input.carbohydrateGramsPerServing * servings),
      fatGrams: roundToTwo(input.fatGramsPerServing * servings),
    },
    limitations: [
      'Product values and servings are user-provided; the source has not been independently checked.',
      'This is label arithmetic only. It does not determine an optimal drink, hydration plan, or nutrient requirement.',
    ],
  };
}
