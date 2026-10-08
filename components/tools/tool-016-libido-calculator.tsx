'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { assessLibido } from '@/lib/tools/engines/tool-016-libido-calculator';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-016-libido-calculator.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool016LibidoCalculator() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [age, setAge] = useState(30);
  const [symptoms, setSymptoms] = useState<'low' | 'normal' | 'high' | 'hyper'>('normal');
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [compoundStack, setCompoundStack] = useState<any[]>([]);
  const [testLevel, setTestLevel] = useState<number | null>(null);
  const [shbg, setSHBG] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (savedState?.libido_result) setResult(savedState.libido_result);
  }, [savedState]);

  const calculate = () => {
    const input = {
      age,
      compound_stack: compoundStack,
      test_level_ng_dL: testLevel ?? undefined,
      shbg_nmol_L: shbg ?? undefined,
      symptoms,
      duration_weeks: durationWeeks,
    };
    const r = assessLibido(input);
    setResult(r);
    debouncedSave({ ...savedState, libido_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Age:</label> <input type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value as any))} min="14" max="80" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Current Symptoms:</label> <select value={symptoms} onChange={(e) => setSymptoms(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="hyper">Hyper</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Test Level (ng/dL):</label> <input type="number" value={testLevel ?? ''} onChange={(e) => setTestLevel(testLevel ? parseFloat(e.target.value as any) : null)} min="50" max="2000" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">SHBG (nmol/L):</label> <input type="number" value={shbg ?? ''} onChange={(e) => setSHBG(shbg ? parseFloat(e.target.value as any) : null)} min="1" max="200" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Duration (weeks):</label> <input type="number" value={durationWeeks} onChange={(e) => setDurationWeeks(parseInt(e.target.value as any))} min="1" max="52" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Compound Stack:</label> <input type="text" value={compoundStack.length > 0 ? compoundStack.map(c => c.name_en).join(', ') : 'No compounds selected'} readOnly className="w-full rounded border p-2 border-dashed text-zinc-500" dir="ltr" /></div>
        <button onClick={calculate} className="mt-4 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending}> {isPending ? 'Calculating...' : 'Assess Libido'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.libido_level}: {result.libido_level}</p>
          <p className="text-zinc-500">{i18nData.libido_score}: {result.libido_score}/100</p>
          <p className="text-zinc-500">{i18nData.symptom_severity}: {result.symptom_severity}</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.recommendations.map((r: any, i: any) => <li key={i}>{r}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.compound_adjustments.map((r: any, i: any) => <li key={i}>{r}</li>)}
          </ul>
          <p className="text-zinc-500">{i18nData.timeline}: {result.timeline}</p>
        </div>}
      </div>
    </div>
  );
}

