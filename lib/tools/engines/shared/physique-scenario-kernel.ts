import { z } from 'zod';

/** Shared input contract and math kernel for body-composition scenario tools. */
export const PhysiqueScenarioBaseSchema = z.object({
  current_weight_kg: z.number().finite().positive().max(500),
  current_body_fat_pct: z.number().finite().min(3).max(70),
  target_body_fat_pct: z.number().finite().min(3).max(70),
});

export type PhysiqueScenarioBaseInput = z.infer<typeof PhysiqueScenarioBaseSchema>;

export interface PhysiqueScenarioBaseResult {
  current_lean_mass_kg: number;
  scenario_target_weight_kg: number;
  scenario_weight_change_kg: number;
  unrounded_scenario_target_weight_kg: number;
  direction: 'loss' | 'gain' | 'no_change';
  assumptions: string[];
}

/**
 * Deterministic arithmetic under a constant-lean-mass assumption. This shared
 * kernel is intentionally not a physiological forecast or recommendation.
 */
export function calculatePhysiqueScenarioBase(input: PhysiqueScenarioBaseInput): PhysiqueScenarioBaseResult {
  const parsed = PhysiqueScenarioBaseSchema.parse(input);
  const currentLeanMass = parsed.current_weight_kg * (1 - parsed.current_body_fat_pct / 100);
  const denominator = 1 - parsed.target_body_fat_pct / 100;
  if (!Number.isFinite(denominator) || denominator <= 0) {
    throw new RangeError('Target body-fat percentage does not produce a defined target weight.');
  }

  const targetWeight = currentLeanMass / denominator;
  const change = targetWeight - parsed.current_weight_kg;
  if (![currentLeanMass, targetWeight, change].every(Number.isFinite) || currentLeanMass <= 0 || targetWeight <= 0) {
    throw new RangeError('Scenario arithmetic is outside the supported numeric domain.');
  }

  return {
    current_lean_mass_kg: Number(currentLeanMass.toFixed(1)),
    scenario_target_weight_kg: Number(targetWeight.toFixed(1)),
    scenario_weight_change_kg: Number(change.toFixed(1)),
    unrounded_scenario_target_weight_kg: targetWeight,
    direction: change < -0.05 ? 'loss' : change > 0.05 ? 'gain' : 'no_change',
    assumptions: ['constant lean mass', 'body-fat measurements are user-reported'],
  };
}
