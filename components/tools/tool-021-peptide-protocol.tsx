'use client';

import React, { useState, useEffect } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import {
  calculatePeptideProtocol,
  isValidPeptideWeightKg,
  type PeptideCompound,
  type PeptideProtocolInput,
  type PeptideProtocolResult,
} from '@/lib/tools/engines/tool-021-peptide-protocol';
import i18nJson from '@/i18n/tool-021-peptide-protocol.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const KG_PER_LB = 0.45359237;

export default function Tool021PeptideProtocolPlanner() {
  const i18nData = useToolI18n(i18nJson);
  const { unitSystem } = useToolDisplayPreferences();
  const { data: savedState } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [userWeight, setUserWeight] = useState(85);
  const [goal, setGoal] = useState<PeptideProtocolInput['goal']>('recovery');
  const [protocolDuration, setProtocolDuration] = useState(8);
  const [injectionFrequency, setInjectionFrequency] = useState<PeptideProtocolInput['injection_frequency']>('every-other-day');
  const [selectedCompounds, setSelectedCompounds] = useState<PeptideCompound[]>([]);
  const [result, setResult] = useState<PeptideProtocolResult | null>(null);
  const [weightError, setWeightError] = useState(false);

  useEffect(() => {
    if (savedState?.peptide_result) setResult(savedState.peptide_result as PeptideProtocolResult);
  }, [savedState]);

  const addCompound = () => {
    const newCompound: PeptideCompound = {
      id: Date.now(),
      name_en: 'BPC-157',
      name_ar: 'BPC-157',
      category: 'bpc-157',
      concentration_mg_ml: 2,
      default_dose_mcg_kg: 0.01,
      half_life_hours: 4,
      administration: 'subcutaneous',
      description_text: 'Body protection compound',
    };
    setSelectedCompounds(prev => [...prev, newCompound]);
  };

  const calculate = () => {
    if (!isValidPeptideWeightKg(userWeight)) {
      setWeightError(true);
      setResult(null);
      return;
    }
    setWeightError(false);
    const input = {
      user_weight_kg: userWeight,
      target_compounds: selectedCompounds,
      goal: goal,
      protocol_duration_weeks: protocolDuration,
      injection_frequency: injectionFrequency,
    };
    const r = calculatePeptideProtocol(input);
    setResult(r);
    debouncedSave({ ...savedState, peptide_result: r });
  };

  const displayedWeight = unitSystem === 'imperial' ? userWeight / KG_PER_LB : userWeight;
  const displayedWeightUnit = unitSystem === 'imperial' ? 'lb' : 'kg';
  const displayToKg = unitSystem === 'imperial' ? KG_PER_LB : 1;
  const minimumWeight = unitSystem === 'imperial' ? 40 / KG_PER_LB : 40;
  const maximumWeight = unitSystem === 'imperial' ? 300 / KG_PER_LB : 300;

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="tool-021-weight" dir={i18nData.dir}>{i18nData.user_weight} ({displayedWeightUnit}):</label>
          <input
            id="tool-021-weight"
            type="number"
            value={Number.isFinite(displayedWeight) ? Number(displayedWeight.toFixed(1)) : ''}
            onChange={(e) => {
              const rawValue = e.target.value;
              setUserWeight(rawValue.trim() ? Number(rawValue) * displayToKg : Number.NaN);
              setWeightError(false);
            }}
            min={minimumWeight}
            max={maximumWeight}
            step="0.1"
            className="w-full rounded border p-2"
            dir="ltr"
            aria-invalid={weightError}
            aria-describedby={weightError ? 'tool-021-weight-error' : undefined}
          />
          {weightError && <p id="tool-021-weight-error" role="alert" className="mt-1 text-sm text-red-700">{i18nData.weight_error}</p>}
        </div>
        <div><label className="block text-sm font-medium mb-2" htmlFor="tool-021-goal" dir={i18nData.dir}>{i18nData.goal}:</label> <select id="tool-021-goal" value={goal} onChange={(e) => setGoal(e.target.value as PeptideProtocolInput['goal'])} className="w-full rounded border p-2" dir={i18nData.dir}><option value="recovery">{i18nData.goal_recovery}</option><option value="muscle_growth">{i18nData.goal_muscle_growth}</option><option value="fat_loss">{i18nData.goal_fat_loss}</option><option value="anti_aging">{i18nData.goal_anti_aging}</option></select></div>
        <div><label className="block text-sm font-medium mb-2" htmlFor="tool-021-duration" dir={i18nData.dir}>{i18nData.protocol_duration}:</label> <input id="tool-021-duration" type="number" value={protocolDuration} onChange={(e) => setProtocolDuration(parseInt(e.target.value, 10))} min="1" max="52" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" htmlFor="tool-021-frequency" dir={i18nData.dir}>{i18nData.injection_frequency}:</label> <select id="tool-021-frequency" value={injectionFrequency} onChange={(e) => setInjectionFrequency(e.target.value as PeptideProtocolInput['injection_frequency'])} className="w-full rounded border p-2" dir={i18nData.dir}><option value="daily">{i18nData.daily}</option><option value="every-other-day">{i18nData.every_other_day}</option><option value="3x-week">{i18nData.three_times_weekly}</option><option value="weekly">{i18nData.weekly}</option></select></div>
        <button onClick={addCompound} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}>{i18nData.add_compound}</button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">{i18nData.saving}</p>}

        <button onClick={calculate} className="mt-6 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending || selectedCompounds.length === 0}>{isPending ? i18nData.calculating : i18nData.calculate_protocol}</button>

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir={i18nData.dir}>
          <p className="text-zinc-600 font-bold">{i18nData.daily_dose_mcg}: {result.daily_dose_mcg}mcg</p>
          <p className="text-zinc-500">{i18nData.total_cycle_dose_mg}: {result.total_cycle_dose_mg}mg</p>
          <p className="text-zinc-500">{i18nData.injection_frequency_days}: {i18nData.every} {result.injection_frequency_days} {i18nData.days}</p>
          <p className="text-zinc-500">{i18nData.total_injections}: {result.total_injections}</p>
          <p className="text-zinc-500">{i18nData.protocol_weeks}: {result.protocol_weeks}</p>
          <p className="mt-3 font-semibold">{i18nData.timing_recommendations}</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.timing_recommendations.map((recommendation, index) => <li key={`${index}-${recommendation}`}>{recommendation}</li>)}
          </ul>
          <p className="mt-3 font-semibold">{i18nData.storage_requirements}</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.storage_requirements.map((requirement, index) => <li key={`${index}-${requirement}`}>{requirement}</li>)}
          </ul>
          <p className="mt-3 font-semibold">{i18nData.side_effect_warnings}</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.side_effect_warnings.map((warning, index) => <li key={`${index}-${warning}`}>{warning}</li>)}
          </ul>
          <p className="text-zinc-500 mt-2">{i18nData.post_protocol_therapy}: {result.post_protocol_therapy ? i18nData.yes : i18nData.no}</p>
        </div>}
      </div>
    </div>
  );
}

