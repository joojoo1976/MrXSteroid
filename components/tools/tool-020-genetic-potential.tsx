import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle from './MeasurementToggle';
import i18nData from '@/i18n/tool-020-genetic-potential.json';

export default function Tool020GeneticPotential() {
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
  const [result, setResult] = useState(null);

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

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Age:</label> <input type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value))} min="14" max="80" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Training Experience (years):</label> <input type="number" value={trainingYears} onChange={(e) => setTrainingYears(parseInt(e.target.value))} min="0" max="50" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Prior Cycles:</label> <input type="number" value={priorCycles} onChange={(e) => setPriorCycles(parseInt(e.target.value))} min="0" max="20" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Family History:</label> <select value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value)} className="w-full rounded border p-2" dir="ltr"><option value="none">None</option><option value="baldness">Baldness</option><option value="heart_disease">Heart Disease</option><option value="liver_disease">Liver Disease</option><option value="other">Other</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Body Type:</label> <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className="w-full rounded border p-2" dir="ltr"><option value="ectomorph">Ectomorph</option><option value="mesomorph">Mesomorph</option><option value="endomorph">Endomorph</option><option value="mixed">Mixed</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Goal:</label> <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full rounded border p-2" dir="ltr"><option value="bulk">Bulk</option><option value="cut">Cut</option><option value="recomp">Recomp</option><option value="strength">Strength</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Current Weight (kg):</label> <input type="number" value={currentWeight} onChange={(e) => setCurrentWeight(parseInt(e.target.value))} min="30" max="200" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Height (cm):</label> <input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value))} min="100" max="250" className="w-full rounded border p-2" dir="ltr" /></div>
        <button onClick={calculate} className="mt-4 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending}> {isPending ? 'Calculating...' : 'Calculate Potential'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">Potential Score: {result.potential_score}/100</p>
          <p className="text-zinc-500">{i18nData.body_type_assessment}: {result.body_type_assessment}</p>
          <p className="text-zinc-500">{i18nData.recommended_cycle_length}: {result.recommended_cycle_length} weeks</p>
          <p className="text-zinc-500">{i18nData.recommended_dosage_multiplier}x dosage multiplier</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.risk_factors.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.recommended_compounds.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.avoided_compounds.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.personalized_tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>)}
      </div>
    </div>
  );
}