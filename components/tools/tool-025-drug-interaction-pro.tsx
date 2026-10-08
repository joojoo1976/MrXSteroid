'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { checkDrugInteractions } from '@/lib/tools/engines/tool-025-drug-interaction-pro';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-025-drug-interaction-pro.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool025DrugInteractionCheckerPro() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [compounds, setCompounds] = useState<any[]>([]);
  const [age, setAge] = useState(35);
  const [weight, setWeight] = useState(85);
  const [healthConditions, setHealthConditions] = useState<Array<'liver' | 'heart' | 'prostate' | 'high_bp'>>([]);
  const [medications, setMedications] = useState([]);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (savedState?.drug_interaction_result) setResult(savedState.drug_interaction_result);
  }, [savedState]);

  const addCompound = () => {
    const newCompound: any = {
      id: Date.now(),
      name_en: 'Testosterone',
      name_ar: 'Ø§Ø®ØªØ¨Ø§Ø±ÙˆÙ†',
      family: 'testosterone',
      dosage_mg: 500,
      is_lipophilic: false,
      primary_target: 'androgen',
      half_life_hours: 168,
    };
    setCompounds(prev => [...prev, newCompound]);
  };

  const check = () => {
    const input = {
      compounds,
      user_age: age,
      user_weight_kg: weight,
      health_conditions: healthConditions,
      current_medications: medications,
    };
    const r = checkDrugInteractions(input);
    setResult(r);
    debouncedSave({ ...savedState, drug_interaction_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Compound Stack:</label> <p className="text-zinc-500 text-sm" dir="ltr">{compounds.length} compounds</p></div>
        <button onClick={addCompound} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}> Add Compound </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        <div><label className="block text-sm font-medium mb-2" dir="ltr">Age:</label> <input type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value as any))} min="18" max="80" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Weight (kg):</label> <input type="number" value={weight} onChange={(e) => setWeight(parseInt(e.target.value as any))} min="40" max="300" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Health Conditions:</label> <p className="text-zinc-500 text-sm" dir="ltr">{healthConditions.length > 0 ? healthConditions.join(', ') : 'None'}</p></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Current Medications:</label> <input type="text" value={medications.join(', ') || 'None'} readOnly className="w-full rounded border p-2 border-dashed text-zinc-500" dir="ltr" /></div>

        <button onClick={check} className="mt-6 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending || compounds.length < 2}> {isPending ? 'Checking...' : 'Check Interactions'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.total_interactions}: {result.total_interactions}</p>
          <p className="text-zinc-500">{i18nData.critical_interactions}: {result.critical_interactions}</p>
          <p className="text-zinc-500">{i18nData.moderate_interactions}: {result.moderate_interactions}</p>
          <p className="text-zinc-500">{i18nData.safety_score}: {result.safety_score}%</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.interactions.map((i: any, idx: any) => <li key={idx}>{i.compound1} + {i.compound2}: {i.severity} ({i.interaction_type})</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.recommendations.map((r: any, i: any) => <li key={i}>{r}</li>)}
          </ul>
        </div>}
      </div>
    </div>
  );
}


