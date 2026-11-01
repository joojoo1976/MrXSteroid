import {
  StackComparisonInputSchema,
  StackComparisonResultSchema,
  type StackComparisonInput,
  type StackComparisonResult,
} from '../schemas/tool-028-stacking-synergy';

/** Carries two user-authored lists without claiming compatibility or synergy. */
export function buildStackComparisonWorksheetV7(input: StackComparisonInput): StackComparisonResult {
  const validated = StackComparisonInputSchema.parse(input);
  return StackComparisonResultSchema.parse({
    resultOrigin: 'USER_PROVIDED',
    assessment: 'NOT_AVAILABLE',
    reason: 'NO_VALIDATED_COMPATIBILITY_SOURCE_CONFIGURED',
    scenarioA: { ...validated.scenarioA, items: [...validated.scenarioA.items] },
    scenarioB: { ...validated.scenarioB, items: [...validated.scenarioB.items] },
  });
}
