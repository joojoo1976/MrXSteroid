import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle from './MeasurementToggle';
import i18nData from '@/i18n/tool-017-drug-interaction.json';

export default function Tool017DrugInteraction() {
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [compounds, setCompounds] = useState<any[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [age, setAge] = useState(30);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (savedState?.drug_interaction) setResult(savedState.drug_interaction);
  }, [savedState]);

  const check = () => {
    const input = {
      compounds,
      medications,
      health_conditions,
      age,
    };
    const r = checkDrugInteractions(input);
    setResult(r);
    debouncedSave({ ...savedState, drug_interaction: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Age:</label> <input type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value))} min="14" max="80" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Compounds:</label> <input type="text" value={compounds.length > 0 ? compounds.map(c => c.name_en).join(', ') : 'No compounds selected'} readOnly className="w-full rounded border p-2 border-dashed text-zinc-500" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Current Medications (comma-separated):</label> <input type="text" value={medications.join(', ')} onChange={(e) => setMedications(e.target.value.split(',').map(m => m.trim()).filter(m => m.length > 0))} className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Health Conditions (comma-separated):</label> <input type="text" value={healthConditions.join(', ')} onChange={(e) => setHealthConditions(e.target.value.split(',').map(c => c.trim()).filter(c => c.length > 0))} className="w-full rounded border p-2" dir="ltr" /></div>
        <button onClick={check} className="mt-4 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending}> {isPending ? 'Checking...' : 'Check Interactions'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.overall_safety}: {result.overall_safety}</p>
          {result.requires_medical_approval && <p className="text-red-500 font-medium">⚠️ {i18nData.requires_medical_approval}</p>}
          <p className="text-zinc-500">{i18nData.summary}: {result.summary}</p>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            {result.flags.map((f, i) => (
              <div key={i} className={f.severity === 'contraindicated' ? 'text-red-500' : f.severity === 'warning' ? 'text-yellow-500' : 'text-green-500'}>
                <strong>{f.severity}:</strong> {f.description} - {f.recommendation}
              </div>
            ))}
          </div>
        </div>)}
      </div>
    </div>
  );
}