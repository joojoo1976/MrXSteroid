'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { predictSideEffects } from '@/lib/tools/engines/tool-029-side-effect-early-warning';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-029-side-effect-early-warning.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool029SideEffectEarlyWarning() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [compounds, setCompounds] = useState(['testosterone']);
  const [cycleDay, setCycleDay] = useState(8);
  const [userAge, setUserAge] = useState(35);
  const [experience, setExperience] = useState('intermediate');
  const [bloodPressure, setBloodPressure] = useState(120);
  const [heartRate, setHeartRate] = useState(75);
  const [recentWeight, setRecentWeight] = useState(85);
  const [libido, setLibido] = useState('normal');
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (savedState?.side_effect_result) setResult(savedState.side_effect_result);
  }, [savedState]);

  const analyze = () => {
    const input = {
      compounds,
      cycle_day: cycleDay,
      user_age: userAge,
      experience_level: experience,
      health_markers: {
        blood_pressure: bloodPressure,
        heart_rate: heartRate,
        recent_weight: recentWeight,
        libido: libido as any,
      },
    };
    const r = predictSideEffects(input as any);
    setResult(r);
    debouncedSave({ ...savedState, side_effect_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Compounds:</label> <input type="text" value={compounds.join(', ')} onChange={(e) => setCompounds((e.target.value as any).split(',').map((s: any) => s.trim()).filter((s: any) => s))} className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Cycle Day:</label> <input type="number" value={cycleDay} onChange={(e) => setCycleDay(parseInt(e.target.value as any))} min="1" max="365" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Age:</label> <input type="number" value={userAge} onChange={(e) => setUserAge(parseInt(e.target.value as any))} min="18" max="80" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Experience:</label> <select value={experience} onChange={(e) => setExperience(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option><option value="pro">Pro</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Blood Pressure:</label> <input type="number" value={bloodPressure} onChange={(e) => setBloodPressure(parseInt(e.target.value as any))} min="60" max="200" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Heart Rate:</label> <input type="number" value={heartRate} onChange={(e) => setHeartRate(parseInt(e.target.value as any))} min="40" max="200" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Recent Weight:</label> <input type="number" value={recentWeight} onChange={(e) => setRecentWeight(parseInt(e.target.value as any))} min="30" max="300" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Libido:</label> <select value={libido} onChange={(e) => setLibido(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="increased">Increased</option><option value="normal">Normal</option><option value="decreased">Decreased</option></select></div>
        <button onClick={analyze} className="mt-6 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending}> {isPending ? 'Analyzing...' : 'Predict Side Effects'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.overall_risk_level}: {result.overall_risk_level}</p>
          <p className="text-zinc-500">{i18nData.risk_score}: {result.risk_score}/100</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.predicted_side_effects.map((s: any, i: any) => <li key={i}>{s.name_en} ({s.severity})</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.immediate_actions.map((a: any, i: any) => <li key={i}>{a}</li>)}
          </ul>
          <p className="text-zinc-500 mt-2">{i18nData.when_to_concerned}: {result.when_to_concerned}</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.monitoring_recommendations.map((r: any, i: any) => <li key={i}>{r}</li>)}
          </ul>
        </div>}
      </div>
    </div>
  );
}

