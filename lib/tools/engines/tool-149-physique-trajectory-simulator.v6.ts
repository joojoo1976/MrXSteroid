import { z } from 'zod';
import { calculatePhysiqueScenarioBase, PhysiqueScenarioBaseSchema, type PhysiqueScenarioBaseInput } from './shared/physique-scenario-kernel';

export const PhysiqueTrajectoryInputSchema = PhysiqueScenarioBaseSchema.extend({
  weekly_rates_kg_per_week: z.array(z.number().finite().positive().max(2)).min(1).max(3),
});

export type PhysiqueTrajectoryInput = z.infer<typeof PhysiqueTrajectoryInputSchema>;

export type PhysiqueTrajectoryDraftState =
  | { status: 'PARTIAL'; missingFields: string[] }
  | { status: 'INVALID_INPUT'; errors: Array<{ field: string; message: string }> }
  | { status: 'FULL'; input: PhysiqueTrajectoryInput };

export interface PhysiqueTrajectoryScenario {
  id: string;
  weekly_weight_change_kg: number;
  scenario_target_weight_kg: number;
  scenario_duration_weeks: number;
  scenario_weight_change_kg: number;
  direction: 'loss' | 'gain' | 'no_change';
  assumptions: string[];
}

export type PhysiqueTrajectoryResult =
  | {
      status: 'CALCULATED';
      calculationType: 'CALCULATED';
      current_lean_mass_kg: number;
      scenarios: PhysiqueTrajectoryScenario[];
      assumptions: string[];
      disclaimer: string;
    }
  | {
      status: 'NOT_AVAILABLE';
      calculationType: 'NOT_AVAILABLE';
      scenarios: [];
      reason: string;
      assumptions: string[];
      disclaimer: string;
    };

const FIELD_NAMES: Record<string, string> = {
  current_weight_kg: 'current_weight_kg',
  current_body_fat_pct: 'current_body_fat_pct',
  target_body_fat_pct: 'target_body_fat_pct',
  weekly_rates_kg_per_week: 'weekly_rates_kg_per_week',
};

/** Distinguishes absent values from invalid values before any calculation. */
export function inspectPhysiqueTrajectoryDraft(raw: unknown): PhysiqueTrajectoryDraftState {
  const value = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const missingFields = ['current_weight_kg', 'current_body_fat_pct', 'target_body_fat_pct']
    .filter((field) => value[field] === undefined || value[field] === null || value[field] === '');
  const rates = value.weekly_rates_kg_per_week;
  if (rates === undefined || rates === null || rates === '' || (Array.isArray(rates) && (rates.length === 0 || rates.some((rate) => rate === undefined || rate === null || rate === '')))) {
    missingFields.push('weekly_rates_kg_per_week');
  }
  if (missingFields.length > 0) return { status: 'PARTIAL', missingFields };

  const parsed = PhysiqueTrajectoryInputSchema.safeParse(value);
  if (!parsed.success) {
    return {
      status: 'INVALID_INPUT',
      errors: parsed.error.issues.map((issue) => ({
        field: FIELD_NAMES[String(issue.path[0])] ?? String(issue.path[0] ?? 'input'),
        message: issue.message,
      })),
    };
  }
  return { status: 'FULL', input: parsed.data };
}

/**
 * Calculates up to three explicitly user-entered rates using the same pure
 * constant-lean-mass kernel as Tool 131. No rate is ranked or recommended.
 */
export function calculatePhysiqueTrajectoryScenarios(input: PhysiqueTrajectoryInput): PhysiqueTrajectoryResult {
  const parsed = PhysiqueTrajectoryInputSchema.parse(input);
  const baseInput: PhysiqueScenarioBaseInput = {
    current_weight_kg: parsed.current_weight_kg,
    current_body_fat_pct: parsed.current_body_fat_pct,
    target_body_fat_pct: parsed.target_body_fat_pct,
  };
  const assumptions = [
    'constant lean mass',
    'each weekly rate is user-selected and held constant for arithmetic only',
    'body-fat measurements are user-reported',
  ];
  const disclaimer = 'Deterministic arithmetic scenarios only. Scenario duration is not a real-world prediction, promise, training plan, nutrition plan, medication recommendation, or health assessment.';

  try {
    const base = calculatePhysiqueScenarioBase(baseInput);
    if (base.unrounded_scenario_target_weight_kg > 500) {
      return {
        status: 'NOT_AVAILABLE', calculationType: 'NOT_AVAILABLE', scenarios: [],
        reason: 'The calculated target weight is above the supported 500 kg result bound.', assumptions, disclaimer,
      };
    }

    const scenarios = parsed.weekly_rates_kg_per_week.map((rate, index) => {
      const rawWeeks = Math.abs(base.unrounded_scenario_target_weight_kg - parsed.current_weight_kg) / rate;
      if (!Number.isFinite(rawWeeks) || rawWeeks > 100_000) {
        throw new RangeError('Scenario duration is outside the supported numeric range.');
      }
      return {
        id: `scenario_${index + 1}`,
        weekly_weight_change_kg: rate,
        scenario_target_weight_kg: base.scenario_target_weight_kg,
        scenario_duration_weeks: Number(rawWeeks.toFixed(1)),
        scenario_weight_change_kg: base.scenario_weight_change_kg,
        direction: base.direction,
        assumptions,
      } satisfies PhysiqueTrajectoryScenario;
    });

    return {
      status: 'CALCULATED', calculationType: 'CALCULATED',
      current_lean_mass_kg: base.current_lean_mass_kg, scenarios, assumptions, disclaimer,
    };
  } catch (error) {
    return {
      status: 'NOT_AVAILABLE', calculationType: 'NOT_AVAILABLE', scenarios: [],
      reason: error instanceof Error ? error.message : 'Scenario arithmetic could not be calculated.', assumptions, disclaimer,
    };
  }
}
