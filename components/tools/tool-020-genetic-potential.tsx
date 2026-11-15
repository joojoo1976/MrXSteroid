'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { calculateGeneticPotential } from '@/lib/tools/engines/tool-020-genetic-potential';
import i18nJson from '@/i18n/tool-020-genetic-potential.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const KG_PER_LB = 2.20462;
const CM_PER_IN = 2.54;

export default function Tool020GeneticPotential() {
  const i18nData = useToolI18n(i18nJson);
  const { unitSystem, isRtl } = useToolDisplayPreferences();
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [age, setAge] = useState(30);
  const [trainingYears, setTrainingYears] = useState(3);
  const [priorCycles, setPriorCycles] = useState(0);
  const [familyHistory, setFamilyHistory] = useState('none' as 'baldness' | 'heart_disease' | 'liver_disease' | 'none' | 'other');
  const [bodyType, setBodyType] = useState('ectomorph' as 'ectomorph' | 'mesomorph' | 'endomorph' | 'mixed');
  const [goal, setGoal] = useState('bulk' as 'bulk' | 'cut' | 'recomp' | 'strength');
  const [currentWeight, setCurrentWeight] = useState(85);
  const [height, setHeight] = useState(180);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (savedState?.genetic_potential) setResult(savedState.genetic_potential);
  }, [savedState]);

  const calculate = () => {
    const input = {
      age, trainingYears, priorCycles, familyHistory, bodyType, goal, currentWeight, height,
    };
    const r = calculateGeneticPotential(input);
    setResult(r);
    debouncedSave({ ...savedState, genetic_potential: r });
  };
  const weightUnit = unitSystem === 'imperial' ? 'lb' : 'kg';
  const heightUnit = unitSystem === 'imperial' ? 'in' : 'cm';
  const displayedWeight = unitSystem === 'imperial' ? currentWeight * KG_PER_LB : currentWeight;
  const displayedHeight = unitSystem === 'imperial' ? height / CM_PER_IN : height;
  const parseDisplayedWeight = (value: string) => {
    const displayed = Number(value);
    return Number.isFinite(displayed) ? (unitSystem === 'imperial' ? displayed / KG_PER_LB : displayed) : 0;
  };
  const parseDisplayedHeight = (value: string) => {
    const displayed = Number(value);
    return Number.isFinite(displayed) ? (unitSystem === 'imperial' ? displayed * CM_PER_IN : displayed) : 0;
  };

  return (
    <div className="pct-timing-tool p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <p className="mb-4 text-sm text-amber-700">{i18nData.disclaimer}</p>
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir={isRtl ? 'rtl' : 'ltr'}>{i18nData.age}:</label> <input data-r6-slider="true" type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value as any))} min="14" max="80" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir={isRtl ? 'rtl' : 'ltr'}>{i18nData.training_experience}:</label> <input data-r6-slider="true" type="number" value={trainingYears} onChange={(e) => setTrainingYears(parseInt(e.target.value as any))} min="0" max="50" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir={isRtl ? 'rtl' : 'ltr'}>{i18nData.prior_cycles}:</label> <input data-r6-slider="true" type="number" value={priorCycles} onChange={(e) => setPriorCycles(parseInt(e.target.value as any))} min="0" max="20" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir={isRtl ? 'rtl' : 'ltr'}>{i18nData.family_history}:</label> <select value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="none">{i18nData.none}</option><option value="baldness">{i18nData.baldness}</option><option value="heart_disease">{i18nData.heart_disease}</option><option value="liver_disease">{i18nData.liver_disease}</option><option value="other">{i18nData.other}</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir={isRtl ? 'rtl' : 'ltr'}>{i18nData.body_type}:</label> <select value={bodyType} onChange={(e) => setBodyType(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="ectomorph">{i18nData.ectomorph}</option><option value="mesomorph">{i18nData.mesomorph}</option><option value="endomorph">{i18nData.endomorph}</option><option value="mixed">{i18nData.mixed}</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir={isRtl ? 'rtl' : 'ltr'}>{i18nData.goal}:</label> <select value={goal} onChange={(e) => setGoal(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="bulk">{i18nData.bulk}</option><option value="cut">{i18nData.cut}</option><option value="recomp">{i18nData.recomp}</option><option value="strength">{i18nData.strength}</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir={isRtl ? 'rtl' : 'ltr'}>{i18nData.current_weight} ({weightUnit}):</label> <input data-r6-slider="true" type="number" value={Number(displayedWeight.toFixed(2))} onChange={(e) => setCurrentWeight(parseDisplayedWeight(e.target.value))} min={unitSystem === 'imperial' ? 66.14 : 30} max={unitSystem === 'imperial' ? 440.92 : 200} step="any" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir={isRtl ? 'rtl' : 'ltr'}>{i18nData.height} ({heightUnit}):</label> <input data-r6-slider="true" type="number" value={Number(displayedHeight.toFixed(2))} onChange={(e) => setHeight(parseDisplayedHeight(e.target.value))} min={unitSystem === 'imperial' ? 39.37 : 100} max={unitSystem === 'imperial' ? 98.43 : 250} step="any" className="w-full rounded border p-2" dir="ltr" /></div>
        <button onClick={calculate} className="mt-4 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending}> {isPending ? i18nData.calculating : i18nData.calculate_indicator} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">{i18nData.saving_to_account}</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir={isRtl ? 'rtl' : 'ltr'}>
          <p className="text-zinc-600 font-bold">{i18nData.indicator_score}: {result.potential_score}/100</p>
          <p className="text-zinc-500">{i18nData.body_type_assessment}: {i18nData.score_context}</p>
        </div>}
      </div>
    </div>
  );
}

