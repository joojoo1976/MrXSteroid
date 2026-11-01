import { z } from 'zod';
import { calculatePhysiqueScenarioBase, PhysiqueScenarioBaseSchema } from './shared/physique-scenario-kernel';

export const TransformationScenarioSchema = PhysiqueScenarioBaseSchema.extend({
  weekly_weight_change_kg: z.number().finite().positive().max(2),
});
export type TransformationScenarioInput = z.infer<typeof TransformationScenarioSchema>;

export interface TransformationScenarioResult {
  current_lean_mass_kg: number;
  scenario_target_weight_kg: number;
  estimated_scenario_weeks: number;
  scenario_weight_change_kg: number;
  direction: 'loss' | 'gain' | 'no_change';
  assumptions: string[];
  disclaimer: string;
}

/** Constant-rate arithmetic scenario only; this is not an outcome prediction. */
export function calculateTransformationScenario(input: TransformationScenarioInput): TransformationScenarioResult {
  const parsed = TransformationScenarioSchema.parse(input);
  const base = calculatePhysiqueScenarioBase(parsed);
  return {
    current_lean_mass_kg: base.current_lean_mass_kg,
    scenario_target_weight_kg: base.scenario_target_weight_kg,
    estimated_scenario_weeks: Number((Math.abs(base.unrounded_scenario_target_weight_kg - parsed.current_weight_kg) / parsed.weekly_weight_change_kg).toFixed(1)),
    scenario_weight_change_kg: base.scenario_weight_change_kg,
    direction: base.direction,
    assumptions: [...base.assumptions, 'constant user-selected weekly rate'],
    disclaimer: 'Mathematical scenario only; real body composition and pace change over time. Not an AI prediction or medical plan.',
  };
}

