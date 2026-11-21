import {
  calculateProteinNeedsV6,
  type ProteinNeedsInput,
} from '@/lib/tools/engines/protein-needs.v6';

export type ProteinGoal = ProteinNeedsInput['goal'];

export interface ProteinScenario {
  goal: ProteinGoal;
  grams: number;
}

export const PROTEIN_GOALS: readonly ProteinGoal[] = ['maintain', 'bulk', 'cut'];

/**
 * Recalculate every supported goal through the real protein engine.
 * No coefficient is duplicated here; the engine remains authoritative.
 */
export function buildProteinScenarios(input: {
  weightKg: number;
  activityLevel: number;
}): ProteinScenario[] {
  return PROTEIN_GOALS.map((goal) => ({
    goal,
    grams: calculateProteinNeedsV6({ ...input, goal }).dailyProteinGrams,
  }));
}

/** Return the goal whose advice copy must be shown. */
export function proteinGoalAdviceKey(goal: ProteinGoal): ProteinGoal {
  return goal;
}
