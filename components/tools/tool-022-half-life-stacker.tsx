import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle from './MeasurementToggle';
import i18nData from '@/i18n/tool-022-half-life-stacker.json';

export default function Tool022HalfLifeStacker() {
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [cycleLength, setCycleLength] = useState(8);
  const [injectionFrequency, setInjectionFrequency] = useState('every-other-day' as 'daily' | 'every-other-day' | '2x-week' | '1x-week');
  const [userGoal, setUserGoal] = useState('bulk' as 'bulk' | 'cut' | 'recomp' | 'strength');
  const [selectedCompounds, setSelectedCompounds] = useState<any[]>([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (savedState?.half_life_stack_result) setResult(savedState.half_life_stack_result);
  }, [savedState]);

  const addCompound = () => {
    const newCompound: any = {
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
    const input = {
      compounds: selectedCompounds,
      cycle_length_weeks: cycleLength,
      injection_frequency: injectionFrequency,
      user_goal: userGoal,
    };
    const r = calculateStackTiming(input);
    setResult(r);
    debouncedSave({ ...savedState, half_life_stack_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Cycle Length (weeks):</label> <input type="number" value={cycleLength} onChange={(e) => setCycleLength(parseInt(e.target.value))} min="1" max="52" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Injection Frequency:</label> <select value={injectionFrequency} onChange={(e) => setInjectionFrequency(e.target.value)} className="w-full rounded border p-2" dir="ltr"><option value="daily">Daily</option><option value="every-other-day">Every Other Day</option><option value="2x-week">2x Per Week</option><option value="1x-week">Weekly</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">User Goal:</label> <select value={userGoal} onChange={(e) => setUserGoal(e.target.value)} className="w-full rounded border p-2" dir="ltr"><option value="bulk">Bulk</option><option value="cut">Cut</option><option value="recomp">Recomp</option><option value="strength">Strength</option></select></div>
        <button onClick={addCompound} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}> Add Compound </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        <button onClick={calculate} className="mt-6 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending || selectedCompounds.length === 0}> {isPending ? 'Calculating...' : 'Calculate Stack Timing'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.peak_platform_days}: {result.peak_platform_days} days</p>
          <p className="text-zinc-500">{i18nData.total_cycle_half_lives}: {result.total_cycle_half_lives}</p>
          <p className="text-zinc-500">{i18nData.recommended_pct_start_days}: {result.recommended_pct_start_days} days</p>
          <p className="text-zinc-500">{i18nData.washout_complete_days}: {result.washout_complete_days} days</p>
          <p className="text-zinc-500">{i18nData.ester_bottleneck}: {result.ester_bottleneck.name_en} ({result.ester_bottleneck.ester_type})</p>
          <p className="text-zinc-500">{i18nData.confidence_score}: {result.confidence_score}%</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.compound_peak_times && Object.entries(result.compound_peak_times).map(([name, peakDays]) => <li key={name}>{name}: {peakDays} days peak</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.optimal_injection_schedule.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>)}
      </div>
    </div>
  );
}