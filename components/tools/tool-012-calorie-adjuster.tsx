'use client';

import React, { useState, useMemo } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { runCalorieAdjuster, type CalorieInput, type CalorieResult } from '@/lib/tools/r6/tool-012-calorie-adjuster-pipeline';
import { CalorieInputSchema, CalorieResultSchema } from '@/lib/tools/schemas/tool-012-calorie-adjuster';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import i18nJson from '@/i18n/tool-012-calorie-adjuster.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const KG_PER_LB = 2.20462;
const CM_PER_IN = 2.54;

export default function Tool012CalorieAdjuster() {
  const t = useToolI18n(i18nJson);
  const { unitSystem, isRtl, locale } = useToolDisplayPreferences();
  const { data: savedState } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [input, setInput] = useState<CalorieInput>({
    age: 25, gender: 'male' as 'male' | 'female',
    height_cm: 180,
    current_weight_kg: 80,
    activity_level: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    goal: 'bulk' as 'bulk' | 'cut' | 'maintain',
    weeks_per_phase: 8,
  });
  const [calculatedResult, setCalculatedResult] = useState<CalorieResult | null>(null);
  const [hasEditedInput, setHasEditedInput] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  const parsedInput = useMemo(() => CalorieInputSchema.safeParse(input), [input]);
  const { output, calculate: publishOutput, reset: resetOutput } = useExplicitToolOutput<CalorieInput, CalorieResult>(parsedInput.success ? parsedInput.data : null);
  const storedResult = useMemo(() => CalorieResultSchema.safeParse(savedState?.calorie_target), [savedState]);

  const calculate = () => {
    if (!parsedInput.success) {
      setShowValidationError(true);
      resetOutput();
      return;
    }
    setShowValidationError(false);
    const pipelineResult = runCalorieAdjuster(parsedInput.data, {
      calculatedAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
      locale,
      unitSystem,
      snapshotType: 'draft',
    });
    if (!pipelineResult.ok) {
      setShowValidationError(true);
      resetOutput();
      return;
    }
    const r = pipelineResult.output.result;
    setCalculatedResult(r);
    publishOutput(parsedInput.data, (_input, _options) => pipelineResult.output, locale, unitSystem);
    debouncedSave({ ...savedState, calorie_target: r });
  };
  const weightUnit = unitSystem === 'imperial' ? 'lb' : 'kg';
  const heightUnit = unitSystem === 'imperial' ? 'in' : 'cm';
  const displayedWeight = unitSystem === 'imperial' ? input.current_weight_kg * KG_PER_LB : input.current_weight_kg;
  const displayedHeight = unitSystem === 'imperial' ? input.height_cm / CM_PER_IN : input.height_cm;
  const result = output?.result ?? calculatedResult ?? (!hasEditedInput && storedResult.success ? storedResult.data : null);
  const updateInput = <K extends keyof CalorieInput>(key: K, value: CalorieInput[K]) => {
    resetOutput();
    setCalculatedResult(null);
    setHasEditedInput(true);
    setShowValidationError(false);
    setInput((previous) => ({ ...previous, [key]: value }));
  };
  const parseNumber = (value: string) => value.trim() === '' ? Number.NaN : Number(value);

  return (
    <div className="pct-timing-tool p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-2xl font-bold mb-6">{t.tool_name}</h2>
      <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">{t.model_notice}</p>
      <p className="mb-4 text-xs text-zinc-500">
        {isRtl ? 'معادلة الإنفاق أثناء الراحة: 10×الوزن(كجم) + 6.25×الطول(سم) − 5×العمر + معامل الجنس. يُضرب الناتج في معامل النشاط المختار.' : 'Resting-energy equation: 10×weight(kg) + 6.25×height(cm) − 5×age + sex constant. The result is multiplied by the selected activity factor.'}{' '}
        <a href="https://pubmed.ncbi.nlm.nih.gov/2305711/" target="_blank" rel="noreferrer" className="underline">{isRtl ? 'مصدر المعادلة (PubMed)' : 'Equation source (PubMed)'}</a>
      </p>
      <div className="space-y-4">
        <label className="block text-sm font-medium">{t.age} ({i18nJson.en.age_range})<input data-r6-slider="true" type="number" min="19" max="78" step="1" value={Number.isFinite(input.age) ? input.age : ''} onChange={(event) => updateInput('age', parseNumber(event.target.value))} className="mt-1 w-full rounded border p-2" dir="ltr" /></label>
        <label className="block text-sm font-medium">{t.gender}<select value={input.gender} onChange={(event) => updateInput('gender', event.target.value as CalorieInput['gender'])} className="mt-1 w-full rounded border p-2" dir="ltr"><option value="male">{t.male}</option><option value="female">{t.female}</option></select></label>
        <label className="block text-sm font-medium">{t.weight} ({weightUnit}; {unitSystem === 'imperial' ? '66–441 lb' : '30–200 kg'})<input data-r6-slider="true" type="number" min={unitSystem === 'imperial' ? 66.14 : 30} max={unitSystem === 'imperial' ? 440.92 : 200} step="any" value={Number.isFinite(displayedWeight) ? Number(displayedWeight.toFixed(2)) : ''} onChange={(event) => { const value = parseNumber(event.target.value); updateInput('current_weight_kg', unitSystem === 'imperial' ? value / KG_PER_LB : value); }} className="mt-1 w-full rounded border p-2" dir="ltr" /></label>
        <label className="block text-sm font-medium">{t.height} ({heightUnit}; {unitSystem === 'imperial' ? '39.38–98.43 in' : '100–250 cm'})<input data-r6-slider="true" type="number" min={unitSystem === 'imperial' ? 39.38 : 100} max={unitSystem === 'imperial' ? 98.43 : 250} step="any" value={Number.isFinite(displayedHeight) ? Number(displayedHeight.toFixed(2)) : ''} onChange={(event) => { const value = parseNumber(event.target.value); updateInput('height_cm', unitSystem === 'imperial' ? value * CM_PER_IN : value); }} className="mt-1 w-full rounded border p-2" dir="ltr" /></label>
        <label className="block text-sm font-medium">{t.activity_level}<select value={input.activity_level} onChange={(event) => updateInput('activity_level', event.target.value as CalorieInput['activity_level'])} className="mt-1 w-full rounded border p-2" dir="ltr"><option value="sedentary">{i18nJson.en.sedentary} (1.2)</option><option value="light">{i18nJson.en.light} (1.375)</option><option value="moderate">{i18nJson.en.moderate} (1.55)</option><option value="active">{i18nJson.en.active} (1.725)</option><option value="very_active">{i18nJson.en.very_active} (1.9)</option></select></label>
        <label className="block text-sm font-medium">{t.goal}<select value={input.goal} onChange={(event) => updateInput('goal', event.target.value as CalorieInput['goal'])} className="mt-1 w-full rounded border p-2" dir="ltr"><option value="bulk">{t.bulk}</option><option value="cut">{t.cut}</option><option value="maintain">{t.maintain}</option></select></label>
        <label className="block text-sm font-medium">{t.phase_duration} (1–52)<input data-r6-slider="true" type="number" min="1" max="52" step="1" value={Number.isFinite(input.weeks_per_phase) ? input.weeks_per_phase : ''} onChange={(event) => updateInput('weeks_per_phase', parseNumber(event.target.value))} className="mt-1 w-full rounded border p-2" dir="ltr" /></label>
        {showValidationError && <p role="alert" className="text-sm font-semibold text-red-700 dark:text-red-300">{t.validation_error}</p>}
        <button type="button" onClick={calculate} className="mt-4 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending}>{isPending ? i18nJson.en.calculating : i18nJson.en.calculate_target}</button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">{i18nJson.en.saving_locally}</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50 text-zinc-800" dir={isRtl ? 'rtl' : 'ltr'}><p className="font-bold">{i18nJson.en.tdee}: {result.tdee} kcal/day</p><p>{i18nJson.en.maintenance}: {result.maintenance_calories} kcal/day</p><p>{i18nJson.en.target}: {result.target_calories} kcal/day</p><p className="text-sm text-zinc-600">{isRtl ? 'نطاق النموذج الثابت (±100)' : 'Fixed model range (±100)'}</p></div>}
        {output && <ToolOutputSummary output={output} locale={locale} />}
      </div>
    </div>
  );
}
