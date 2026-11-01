import type { KeyFinding } from '../contracts';
import type { MacroInput, MacroTargets } from '../engines/tool-013-macro-optimizer';
import { heuristicProvenance, registeredHeuristicOutput, type HeuristicOutputOptions } from './tool-126-130-common';

/** Publishes only calculated macro totals and the explicit model assumptions. */
export function buildMacroOptimizerOutput(input: MacroInput, result: MacroTargets, options: HeuristicOutputOptions) {
  const goalMultiplier = input.goal === 'bulk' ? 1.1 : input.goal === 'cut' ? 0.85 : 1;
  const macroCalories = result.protein_g * 4 + result.fats_g * 9 + result.carbs_g * 4;
  const findings: KeyFinding[] = [
    { code: 'PROTEIN_TARGET', labelAr: 'هدف البروتين الحسابي', labelEn: 'Calculated protein target', value: `${result.protein_g} g/day (${input.protein_per_kg} g/kg input)`, severity: 'info' },
    { code: 'FAT_TARGET', labelAr: 'هدف الدهون الحسابي', labelEn: 'Calculated fat target', value: `${result.fats_g} g/day (${input.fats_per_kg} g/kg input)`, severity: 'info' },
    { code: 'CARBOHYDRATE_TARGET', labelAr: 'هدف الكربوهيدرات المتبقي', labelEn: 'Remaining-carbohydrate target', value: `${result.carbs_g} g/day`, severity: 'info' },
    { code: 'CALORIE_TARGET', labelAr: 'إجمالي السعرات الافتراضي', labelEn: 'Estimated calorie target', value: `${result.total_calories} kcal/day`, severity: 'info' },
    { code: 'MACRO_MODEL_ASSUMPTION', labelAr: 'افتراض النموذج', labelEn: 'Model assumption', value: `weight × 24 kcal/kg × ${goalMultiplier} goal multiplier; not a measured or personalized energy requirement`, severity: 'important' },
    { code: 'MACRO_CALORIE_CHECK', labelAr: 'سعرات توزيع الماكروز', labelEn: 'Calories from macro totals', value: `${macroCalories} kcal/day; daily grams rounded to whole numbers`, severity: 'info' },
    { code: 'MEAL_ROUNDING', labelAr: 'تقريب الوجبات', labelEn: 'Meal rounding', value: `${input.meals_per_day} meals; per-meal grams rounded up, so summed meal values may exceed daily totals`, severity: 'info' },
  ];
  const provenance = heuristicProvenance(
    options,
    'g/day; kcal/day',
    'User-entered g/kg values; remaining carbohydrates calculated after 4 kcal/g protein and carbohydrate and 9 kcal/g fat. Energy baseline is the inherited rough weight × 24 heuristic, then the selected fixed goal multiplier. No activity adjustment is applied.',
  );

  return registeredHeuristicOutput('tool-013-macro-optimizer', result, findings, provenance, options);
}
