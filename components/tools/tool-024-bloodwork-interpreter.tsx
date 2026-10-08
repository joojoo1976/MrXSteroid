'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { interpretPostCycleBloodwork } from '@/lib/tools/engines/tool-024-bloodwork-interpreter';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-024-bloodwork-interpreter.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool024PostCycleBloodworkInterpreter() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [markers, setMarkers] = useState<any[]>([]);
  const [cycleWeeks, setCycleWeeks] = useState(8);
  const [pctDuration, setPctDuration] = useState(4);
  const [daysSincePct, setDaysSincePct] = useState(0);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (savedState?.bloodwork_result) setResult(savedState.bloodwork_result);
  }, [savedState]);

  const addMarker = () => {
    const newMarker: any = {
      name_en: 'Total Testosterone',
      name_ar: 'الهورمون الذكري الكلي',
      value: 400,
      reference_low: 250,
      reference_high: 1000,
      unit: 'ng/dL',
      result_status: 'normal',
    };
    setMarkers(prev => [...prev, newMarker]);
  };

  const interpret = () => {
    const input = {
      markers,
      cycle_duration_weeks: cycleWeeks,
      pct_compounds: ['Tamoxifen', 'Clomid'],
      pct_duration_weeks: pctDuration,
      days_since_pct_end: daysSincePct,
    };
    const r = interpretPostCycleBloodwork(input);
    setResult(r);
    debouncedSave({ ...savedState, bloodwork_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Cycle Duration (weeks):</label> <input type="number" value={cycleWeeks} onChange={(e) => setCycleWeeks(parseInt(e.target.value as any))} min="1" max="52" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">PCT Duration (weeks):</label> <input type="number" value={pctDuration} onChange={(e) => setPctDuration(parseInt(e.target.value as any))} min="1" max="26" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Days Since PCT End:</label> <input type="number" value={daysSincePct} onChange={(e) => setDaysSincePct(parseInt(e.target.value as any))} min="0" max="365" className="w-full rounded border p-2" dir="ltr" /></div>
        <button onClick={addMarker} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}> Add Marker </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        <button onClick={interpret} className="mt-6 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending || markers.length === 0}> {isPending ? 'Interpreting...' : 'Interpret Bloodwork'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.overall_recovery_status}: {result.overall_recovery_status}</p>
          <p className="text-zinc-500">{i18nData.hormonal_recovery}: {result.hormonal_recovery}</p>
          <p className="text-zinc-500">{i18nData.liver_function}: {result.liver_function}</p>
          <p className="text-zinc-500">{i18nData.cardiovascular}: {result.cardiovascular}</p>
          <p className="text-zinc-500">{i18nData.estrogen_status}: {result.estrogen_status}</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.recommendations.map((r: any, i: any) => <li key={i}>{r}</li>)}
          </ul>
          <p className="text-zinc-500 mt-2">{i18nData.followup_marker}: {result.followup_marker}</p>
          <p className="text-zinc-500">{i18nData.days_to_next_test}: {result.days_to_next_test} days</p>
        </div>}
      </div>
    </div>
  );
}

