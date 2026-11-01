'use client';

import React, { useState } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { calculateStackTiming, type EsterCompound, type StackTimingInput, type StackTimingResult } from '@/lib/tools/engines/tool-022-half-life-stacker';
import { StackTimingInputSchema, StackTimingResultSchema } from '@/lib/tools/schemas/tool-022-half-life-stacker';
import i18nJson from '@/i18n/tool-022-half-life-stacker.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool022HalfLifeStacker() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [cycleLength, setCycleLength] = useState(8);
  const [injectionFrequency, setInjectionFrequency] = useState<StackTimingInput['injection_frequency']>('every-other-day');
  const [selectedCompounds, setSelectedCompounds] = useState<EsterCompound[]>([]);
  const [calculatedResult, setCalculatedResult] = useState<StackTimingResult | null>(null);
  const [validationError, setValidationError] = useState(false);
  const savedResult = StackTimingResultSchema.safeParse(savedState?.half_life_stack_result);
  const result = calculatedResult ?? (savedResult.success ? savedResult.data : null);

  const addCompound = () => {
    const newCompound: EsterCompound = {
      id: Date.now(),
      name_en: 'Testosterone Enanthate',
      name_ar: 'اختبارون إينانات',
      family: 'testosterone',
      ester_type: 'enanthate',
      half_life_days: 7,
      release_rate: 'slow',
      anabolic_score: 100,
      androgenic_score: 100,
      description_text: 'Testosterone base ester',
    };
    setSelectedCompounds(prev => [...prev, newCompound]);
  };

  const calculate = () => {
    const input: StackTimingInput = {
      compounds: selectedCompounds,
      cycle_length_weeks: cycleLength,
      injection_frequency: injectionFrequency,
    };
    const validation = StackTimingInputSchema.safeParse(input);
    if (!validation.success) {
      setValidationError(true);
      return;
    }
    setValidationError(false);
    const r = calculateStackTiming(validation.data);
    setCalculatedResult(r);
    debouncedSave({ ...savedState, half_life_stack_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <div className="space-y-4">
        <div><label htmlFor="tool-022-cycle-length" className="block text-sm font-medium mb-2" dir={i18nData.dir}>{i18nData.cycle_length_weeks}:</label> <input id="tool-022-cycle-length" type="number" value={cycleLength} onChange={(e) => setCycleLength(parseInt(e.target.value, 10))} min="1" max="52" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label htmlFor="tool-022-injection-frequency" className="block text-sm font-medium mb-2" dir={i18nData.dir}>{i18nData.injection_frequency}:</label> <select id="tool-022-injection-frequency" value={injectionFrequency} onChange={(e) => setInjectionFrequency(e.target.value as StackTimingInput['injection_frequency'])} className="w-full rounded border p-2" dir="ltr"><option value="daily">{i18nData.daily}</option><option value="every-other-day">{i18nData.every_other_day}</option><option value="2x-week">{i18nData.twice_weekly}</option><option value="1x-week">{i18nData.weekly}</option></select></div>
        <button onClick={addCompound} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}>{i18nData.add_compound}</button>
        {validationError && <p role="alert" className="text-sm text-red-700">{i18nData.invalid_input}</p>}
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        <button onClick={calculate} className="mt-6 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending || selectedCompounds.length === 0}> {isPending ? i18nData.calculating : i18nData.calculate} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="mb-3 text-xs text-amber-800">{i18nData.disclaimer}</p>
          <p className="text-zinc-600 font-bold">{i18nData.peak_platform_days}: {result.peak_platform_days} days</p>
          <p className="text-zinc-500">{i18nData.total_cycle_half_lives}: {result.total_cycle_half_lives}</p>
          <p className="text-zinc-500">{i18nData.recommended_pct_start_days}: {result.recommended_pct_start_days} days</p>
          <p className="text-zinc-500">{i18nData.washout_complete_days}: {result.washout_complete_days} days</p>
          <p className="text-zinc-500">{i18nData.ester_bottleneck}: {result.ester_bottleneck.name_en} ({result.ester_bottleneck.ester_type})</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.compound_peak_times && Object.entries(result.compound_peak_times as Record<string, number>).map(([name, peakDays]) => <li key={name}>{name}: {peakDays} days peak</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.optimal_injection_schedule.map((scheduleEntry, index) => <li key={index}>{scheduleEntry}</li>)}
          </ul>
        </div>}
      </div>
    </div>
  );
}

