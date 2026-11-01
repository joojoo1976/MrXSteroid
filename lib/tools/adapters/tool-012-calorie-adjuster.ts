import type { KeyFinding } from '../contracts';
import type { CalorieInput, CalorieResult } from '../engines/tool-012-calorie-adjuster';
import { heuristicProvenance, registeredHeuristicOutput, type HeuristicOutputOptions } from './tool-126-130-common';

/** Exposes only calculated values and formula assumptions to the shared result summary. */
export function buildCalorieAdjusterOutput(
  input: CalorieInput,
  result: CalorieResult,
  options: HeuristicOutputOptions,
) {
  const adjustment = input.goal === 'bulk' ? 500 : input.goal === 'cut' ? -500 : 0;
  const findings: KeyFinding[] = [
    {
      code: 'ESTIMATED_TDEE',
      labelAr: 'إنفاق الطاقة اليومي التقديري',
      labelEn: 'Estimated daily energy expenditure',
      value: `${result.tdee} kcal/day`,
      severity: 'info',
    },
    {
      code: 'ESTIMATED_TARGET',
      labelAr: 'الهدف الحسابي',
      labelEn: 'Calculated target',
      value: `${result.target_calories} kcal/day`,
      severity: 'info',
    },
    {
      code: 'FIXED_GOAL_OFFSET',
      labelAr: 'افتراض فرق الهدف',
      labelEn: 'Goal offset assumption',
      value: `${adjustment > 0 ? '+' : ''}${adjustment} kcal/day; fixed scenario assumption, not a personalized prescription`,
      severity: 'important',
    },
    {
      code: 'ESTIMATE_RANGE',
      labelAr: 'نطاق النموذج',
      labelEn: 'Model range',
      value: `${result.tdee_range[0]}–${result.tdee_range[1]} kcal/day; fixed ±100 model range, not a confidence interval`,
      severity: 'info',
    },
    {
      code: 'PHASE_DURATION',
      labelAr: 'مدة السيناريو المدخلة',
      labelEn: 'Entered scenario duration',
      value: `${result.phase_duration_weeks} weeks`,
      severity: 'info',
    },
  ];
  const provenance = heuristicProvenance(
    options,
    'kcal/day',
    'Mifflin–St Jeor resting-energy estimate × selected activity multiplier; fixed goal offset of +500/−500/0 kcal/day. Activity multipliers and offsets are scenario assumptions, not individualized prescriptions.',
  );

  return registeredHeuristicOutput('tool-012-calorie-adjuster', result, findings, provenance, options);
}
