'use client';

import React, { useState, useMemo } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { calculateMacros, type MacroInput, type MacroTargets } from '@/lib/tools/engines/tool-013-macro-optimizer';
import { MacroInputSchema, MacroTargetsSchema } from '@/lib/tools/schemas/tool-013-macro-optimizer';
import { buildMacroOptimizerOutput } from '@/lib/tools/adapters/tool-013-macro-optimizer';
import { useExplicitToolOutput } from '@/lib/tools/useExplicitToolOutput';
import ToolOutputSummary from './ToolOutputSummary';
import i18nJson from '@/i18n/tool-013-macro-optimizer.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const KG_PER_LB = 2.20462;
const INITIAL_INPUT: MacroInput = {
  weight_kg: 85,
  goal: 'bulk',
  protein_per_kg: 2,
  fats_per_kg: 0.8,
  meals_per_day: 4,
};

export default function Tool013MacroOptimizer() {
  const i18nData = useToolI18n(i18nJson);
  const { unitSystem, isRtl, locale } = useToolDisplayPreferences();
  const { data: savedState } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [input, setInput] = useState<MacroInput>(INITIAL_INPUT);
  const [calculatedResult, setCalculatedResult] = useState<MacroTargets | null>(null);
  const [hasEditedInput, setHasEditedInput] = useState(false);
  const [error, setError] = useState<'invalid' | 'infeasible' | null>(null);
  const parsedInput = useMemo(() => MacroInputSchema.safeParse(input), [input]);
  const { output, calculate: createOutput, reset } = useExplicitToolOutput<MacroInput, MacroTargets>(parsedInput.success ? parsedInput.data : null);
  const storedResult = useMemo(() => MacroTargetsSchema.safeParse(savedState?.macro_targets), [savedState]);

  const calculate = () => {
    if (!parsedInput.success) {
      setError('invalid');
      reset();
      return;
    }
    try {
      const r = calculateMacros(parsedInput.data);
      setError(null);
      setCalculatedResult(r);
      createOutput(parsedInput.data, (calculatedInput, options) => buildMacroOptimizerOutput(calculatedInput, r, options), locale, unitSystem);
      debouncedSave({ ...savedState, macro_targets: r });
    } catch (calculationError) {
      if (calculationError instanceof RangeError && calculationError.message === 'MACROS_EXCEED_CALORIE_TARGET') {
        setError('infeasible');
        reset();
        setCalculatedResult(null);
        return;
      }
      throw calculationError;
    }
  };
  const weightUnit = unitSystem === 'imperial' ? 'lb' : 'kg';
  const displayedWeight = unitSystem === 'imperial' ? input.weight_kg * KG_PER_LB : input.weight_kg;
  const result = output?.result ?? calculatedResult ?? (!hasEditedInput && storedResult.success ? storedResult.data : null);
  const parseNumber = (value: string) => value.trim() === '' ? Number.NaN : Number(value);
  const updateInput = <K extends keyof MacroInput>(key: K, value: MacroInput[K]) => {
    reset();
    setCalculatedResult(null);
    setHasEditedInput(true);
    setError(null);
    setInput((previous) => ({ ...previous, [key]: value }));
  };
  const resetInputs = () => {
    reset();
    setInput(INITIAL_INPUT);
    setCalculatedResult(null);
    setHasEditedInput(true);
    setError(null);
  };

  return (
    <div className="pct-timing-tool p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">{i18nData.model_notice}</p>
      <div className="space-y-4">
        <label className="block text-sm font-medium">{i18nData.weight.replace(/\s*\([^)]*\)$/, '')} ({weightUnit}; {unitSystem === 'imperial' ? '66–441 lb' : '30–200 kg'}):<input type="number" min={unitSystem === 'imperial' ? 66.14 : 30} max={unitSystem === 'imperial' ? 440.92 : 200} step="any" value={Number.isFinite(displayedWeight) ? Number(displayedWeight.toFixed(2)) : ''} onChange={(event) => { const value = parseNumber(event.target.value); updateInput('weight_kg', unitSystem === 'imperial' ? value / KG_PER_LB : value); }} className="mt-1 w-full rounded border p-2" dir="ltr" /></label>
        <label className="block text-sm font-medium">{i18nData.goal}<select value={input.goal} onChange={(event) => updateInput('goal', event.target.value as MacroInput['goal'])} className="mt-1 w-full rounded border p-2" dir="ltr"><option value="bulk">{i18nData.bulk} (+10%)</option><option value="cut">{i18nData.cut} (−15%)</option><option value="maintain">{i18nData.maintain}</option></select></label>
        <label className="block text-sm font-medium">{i18nData.protein_per_kg} (g/kg; 1–5)<input type="number" min="1" max="5" step="0.1" value={Number.isFinite(input.protein_per_kg) ? input.protein_per_kg : ''} onChange={(event) => updateInput('protein_per_kg', parseNumber(event.target.value))} className="mt-1 w-full rounded border p-2" dir="ltr" /></label>
        <label className="block text-sm font-medium">{i18nData.fats_per_kg} (g/kg; 0.5–2)<input type="number" min="0.5" max="2" step="0.1" value={Number.isFinite(input.fats_per_kg) ? input.fats_per_kg : ''} onChange={(event) => updateInput('fats_per_kg', parseNumber(event.target.value))} className="mt-1 w-full rounded border p-2" dir="ltr" /></label>
        <label className="block text-sm font-medium">{i18nData.meals_per_day} (1–8)<input type="number" min="1" max="8" step="1" value={Number.isFinite(input.meals_per_day) ? input.meals_per_day : ''} onChange={(event) => updateInput('meals_per_day', parseNumber(event.target.value))} className="mt-1 w-full rounded border p-2" dir="ltr" /></label>
        {error === 'invalid' && <p role="alert" className="text-sm font-semibold text-red-700 dark:text-red-300">{i18nData.validation_error}</p>}
        {error === 'infeasible' && <p role="alert" className="text-sm font-semibold text-red-700 dark:text-red-300">{i18nData.infeasible_error}</p>}
        <div className="flex gap-2"><button type="button" onClick={calculate} className="mt-4 flex-1 rounded bg-green-600 py-2 font-medium text-white hover:bg-green-700 transition-colors" disabled={isPending}>{isPending ? i18nData.calculating : i18nData.calculate_macros}</button><button type="button" onClick={resetInputs} className="mt-4 rounded border px-4 py-2">{isRtl ? 'إعادة الضبط' : 'Reset'}</button></div>
        {isPending && <p className="mt-2 text-sm text-zinc-500">{i18nData.saving_locally}</p>}

        {result && <div className="mt-6 space-y-2 rounded bg-zinc-50 p-4 text-zinc-800" dir={isRtl ? 'rtl' : 'ltr'}><p className="font-bold">{i18nData.protein}: {result.protein_g}g/day ({result.protein_per_meal}g/meal)</p><p>{i18nData.fats}: {result.fats_g}g/day</p><p>{i18nData.carbs}: {result.carbs_g}g/day</p><p>{i18nData.total_calories}: {result.total_calories} kcal</p><p className="text-xs text-zinc-600">{isRtl ? 'تقريب الوجبات يجعل مجموعها قد يختلف قليلًا عن الإجمالي اليومي.' : 'Meal rounding can make summed meal totals differ slightly from daily totals.'}</p></div>}
        {output && <ToolOutputSummary output={output} locale={locale} />}
      </div>
    </div>
  );
}
