import { z } from 'zod';
import { calculatePhysiqueScenarioBase, PhysiqueScenarioBaseSchema } from './shared/physique-scenario-kernel';
export const PhysiqueTrajectoryV7Schema = PhysiqueScenarioBaseSchema.extend({ weekly_rates_kg_per_week: z.array(z.number().finite().positive().max(2)).min(1).max(3) }).strict();
export type PhysiqueTrajectoryV7Input = z.infer<typeof PhysiqueTrajectoryV7Schema>;
export function inspectPhysiqueTrajectoryV7(raw: unknown) {
  const value = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const required = ['current_weight_kg', 'current_body_fat_pct', 'target_body_fat_pct', 'weekly_rates_kg_per_week'];
  const missingFields = required.filter((field) => {
    const fieldValue = value[field];
    return fieldValue === undefined || fieldValue === null || fieldValue === '' ||
      (field === 'weekly_rates_kg_per_week' && Array.isArray(fieldValue) && fieldValue.length === 0);
  });
  if (missingFields.length) return { status: 'PARTIAL' as const, missingFields };

  const parsed = PhysiqueTrajectoryV7Schema.safeParse(value);
  return parsed.success
    ? { status: 'FULL' as const, input: parsed.data }
    : {
        status: 'INVALID_INPUT' as const,
        errors: parsed.error.issues.map((issue) => ({ field: String(issue.path[0] ?? 'input'), message: issue.message })),
      };
}
export function calculatePhysiqueTrajectoryV7(input: PhysiqueTrajectoryV7Input) { const parsed = PhysiqueTrajectoryV7Schema.parse(input); const assumptions = ['constant lean mass','each rate is user-selected and held constant for arithmetic only','body-fat values are user-reported']; const disclaimer = 'CALCULATED arithmetic scenario only. Duration is not a prediction, promise, health assessment, or recommendation.'; try { const base = calculatePhysiqueScenarioBase(parsed); const scenarios = parsed.weekly_rates_kg_per_week.map((rate,index) => { const weeks = Math.abs(base.unrounded_scenario_target_weight_kg - parsed.current_weight_kg) / rate; if (!Number.isFinite(weeks) || weeks > 100000) throw new RangeError('Scenario duration is outside the supported numeric range.'); return { id: `v7_scenario_${index+1}`, weekly_weight_change_kg: rate, scenario_target_weight_kg: base.scenario_target_weight_kg, scenario_duration_weeks: Number(weeks.toFixed(1)), scenario_weight_change_kg: base.scenario_weight_change_kg, direction: base.direction }; }); return { status: 'CALCULATED' as const, resultType: 'CALCULATED' as const, current_lean_mass_kg: base.current_lean_mass_kg, scenarios, assumptions, disclaimer }; } catch (error) { return { status: 'NOT_AVAILABLE' as const, resultType: 'NOT_AVAILABLE' as const, scenarios: [], reason: error instanceof Error ? error.message : 'Scenario could not be calculated.', assumptions, disclaimer }; } }
