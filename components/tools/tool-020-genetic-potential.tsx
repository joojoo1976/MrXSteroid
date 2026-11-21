'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { runGeneticPotential, type GeneticPotentialBuildOptions } from '@/lib/tools/r6/tool-020-genetic-potential-pipeline';
import i18nJson from '@/i18n/tool-020-genetic-potential.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';
import { requireTool } from '@/lib/tools/registry';

const KG_PER_LB = 2.20462;
const CM_PER_IN = 2.54;

export default function Tool020GeneticPotential() {
  const i18nData = useToolI18n(i18nJson);
  const { unitSystem, isRtl } = useToolDisplayPreferences();
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);
  const tool = requireTool('tool-020-genetic-potential');

  const [age, setAge] = useState(30);
  const [trainingYears, setTrainingYears] = useState(3);
  const [priorCycles, setPriorCycles] = useState(0);
  const [familyHistory, setFamilyHistory] = useState('none' as 'baldness' | 'heart_disease' | 'liver_disease' | 'none' | 'other');
  const [bodyType, setBodyType] = useState('ectomorph' as 'ectomorph' | 'mesomorph' | 'endomorph' | 'mixed');
  const [goal, setGoal] = useState('bulk' as 'bulk' | 'cut' | 'recomp' | 'strength');
  const [currentWeight, setCurrentWeight] = useState(85);
  const [height, setHeight] = useState(180);

  // R6 Pipeline integration
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'calculating' | 'done' | 'error'>('idle');

  const options: GeneticPotentialBuildOptions = {
    calculatedAt: new Date().toISOString(),
    recordedAt: new Date().toISOString(),
    locale: 'en',
    unitSystem,
    snapshotType: 'draft',
  };

  useEffect(() => {
    if (savedState?.genetic_potential) {
      const r = savedState.genetic_potential;
      setPipelineResult({ result: r });
      setPipelineStatus('done');
    }
  }, [savedState]);

  useEffect(() => {
    const input = {
      age, trainingYears, priorCycles, familyHistory, bodyType, goal, currentWeight, height,
    };

    setPipelineStatus('calculating');
    const result = runGeneticPotential(input, options);
    if (result.ok) {
      setPipelineResult(result.output);
      setPipelineError(null);
      setPipelineStatus('done');

      const r = result.output.result;
      debouncedSave({ ...savedState, genetic_potential: r });
    } else {
      setPipelineResult(null);
      setPipelineError(String(result.error));
      setPipelineStatus('error');
    }
  }, [age, trainingYears, priorCycles, familyHistory, bodyType, goal, currentWeight, height, options.locale, options.unitSystem, options.snapshotType]);

  const calculate = () => {
    // Pipeline auto-runs via useEffect when inputs change
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
        {/* R6 Pipeline Result */}
        {pipelineStatus === 'calculating' && (
          <div className="rounded-lg border border-blue-500/50 bg-blue-950/20 p-4">
            <p className="font-semibold">جاري حساب الإمكانات الوراثية عبر R6 Pipeline…</p>
          </div>
        )}
        {pipelineStatus === 'done' && pipelineResult && (
          <div className="rounded-lg border border-green-500/50 bg-green-950/20 p-4">
            <p className="font-semibold text-green-100">✓ تم الحساب عبر R6 Pipeline</p>
            <p className="mt-1 text-sm text-green-200">النقاط الإجمالية: {pipelineResult.result.potential_score}/100</p>
            <p className="mt-1 text-sm text-green-200">تقييم نوع الجسد: {pipelineResult.result.body_type_assessment}</p>
            <p className="mt-1 text-sm text-green-200">مصدر البيانات: {pipelineResult.provenance.source}</p>
          </div>
        )}
        {pipelineStatus === 'error' && pipelineError && (
          <div className="rounded-lg border border-red-500/50 bg-red-950/20 p-4 text-red-100">
            <p className="font-semibold">خطأ في الحساب</p>
            <p className="mt-1 text-sm">{pipelineError}</p>
          </div>
        )}
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

          {pipelineStatus === 'done' && pipelineResult && (
            <div className="mt-6 p-4 rounded bg-zinc-50" dir={isRtl ? 'rtl' : 'ltr'}>
              <p className="text-zinc-600 font-bold">{i18nData.indicator_score}: {pipelineResult.result.potential_score}/100</p>
              <p className="text-zinc-500">{i18nData.body_type_assessment}: {i18nData.score_context}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
