import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle from './MeasurementToggle';
import i18nData from '@/i18n/tool-017-injection-volume.json';

export default function Tool017InjectionVolumeCalculator() {
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [targetMuscle, setTargetMuscle] = useState('glutes' as 'deltoid' | 'glutes' | 'quads' | 'pectorals' | 'triceps' | 'biceps');
  const [compoundViscosity, setCompoundViscosity] = useState('medium' as 'low' | 'medium' | 'high');
  const [concentration, setConcentration] = useState(250);
  const [desiredDose, setDesiredDose] = useState(500);
  const [bodyWeight, setBodyWeight] = useState(85);
  const [currentSites, setCurrentSites] = useState<any[]>([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (savedState?.injection_result) setResult(savedState.injection_result);
  }, [savedState]);

  const addSite = () => {
    const newSite: any = {
      id: Date.now(),
      name_en: 'glutes',
      name_ar: 'الأرداف',
      muscle_group: 'glutes',
      is_lipophilic_preference: true,
    };
    setCurrentSites(prev => [...prev, newSite]);
  };

  const calculate = () => {
    const input = {
      target_muscle: targetMuscle,
      compound_viscosity: compoundViscosity,
      concentration_mg_ml: concentration,
      desired_dose_mg: desiredDose,
      current_sites: currentSites,
      user_body_weight_kg: bodyWeight,
    };
    const r = calculateInjectionVolume(input);
    setResult(r);
    debouncedSave({ ...savedState, injection_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Target Muscle:</label> <select value={targetMuscle} onChange={(e) => setTargetMuscle(e.target.value)} className="w-full rounded border p-2" dir="ltr"><option value="deltoid">Deltoid</option><option value="glutes">Glutes</option><option value="quads">Quads</option><option value="pectorals">Pectorals</option><option value="triceps">Triceps</option><option value="biceps">Biceps</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Compound Viscosity:</label> <select value={compoundViscosity} onChange={(e) => setCompoundViscosity(e.target.value)} className="w-full rounded border p-2" dir="ltr"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Concentration (mg/mL):</label> <input type="number" value={concentration} onChange={(e) => setConcentration(parseInt(e.target.value))} min="1" max="500" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Desired Dose (mg):</label> <input type="number" value={desiredDose} onChange={(e) => setDesiredDose(parseInt(e.target.value))} min="1" max="1000" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Body Weight (kg):</label> <input type="number" value={bodyWeight} onChange={(e) => setBodyWeight(parseInt(e.target.value))} min="40" max="300" className="w-full rounded border p-2" dir="ltr" /></div>
        <button onClick={addSite} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}> Add Injection Site </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        <button onClick={calculate} className="mt-6 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending || currentSites.length === 0}> {isPending ? 'Calculating...' : 'Calculate Volume'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.desired_dose_ml}: {result.desired_dose_ml}mL</p>
          <p className="text-zinc-500">{i18nData.max_recommended_ml}: {result.max_recommended_ml}mL</p>
          <p className="text-zinc-500">{i18nData.measurement_system}: {result.measurement_system}</p>
          <p className="text-zinc-500">{i18nData.imperial_conversion}: {result.imperial_conversion}oz</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.injection_sites.map((s, i) => <li key={i}>{s.name_en}: {s.current_volume_ml?.toFixed(1) || '0'}mL</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.rotation_schedule.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>)}
      </div>
    </div>
  );
}