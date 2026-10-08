'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { calculateInjectionPainMinimizer } from '@/lib/tools/engines/tool-026-injection-pain';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-026-injection-pain.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool026InjectionPainMinimizer() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [viscosity, setViscosity] = useState('medium' as 'low' | 'medium' | 'high');
  const [concentration, setConcentration] = useState(250);
  const [dose, setDose] = useState(500);
  const [site, setSite] = useState('glutes' as 'deltoid' | 'glutes' | 'quads' | 'pectorals' | 'triceps' | 'biceps');
  const [currentSites, setCurrentSites] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (savedState?.injection_pain_result) setResult(savedState.injection_pain_result);
  }, [savedState]);

  const addSite = () => {
    const newSite: any = {
      id: Date.now(),
      name_en: 'glutes',
      name_ar: 'الأرداف',
      muscle_group: 'glutes',
      pain_level: 'none',
    };
    setCurrentSites(prev => [...prev, newSite]);
  };

  const calculate = () => {
    const input = {
      compound_viscosity: viscosity,
      concentration_mg_ml: concentration,
      desired_dose_mg: dose,
      current_sites: currentSites,
      injection_site: site,
    };
    const r = calculateInjectionPainMinimizer(input);
    setResult(r);
    debouncedSave({ ...savedState, injection_pain_result: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Compound Viscosity:</label> <select value={viscosity} onChange={(e) => setViscosity(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Concentration (mg/mL):</label> <input type="number" value={concentration} onChange={(e) => setConcentration(parseInt(e.target.value as any))} min="1" max="500" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Desired Dose (mg):</label> <input type="number" value={dose} onChange={(e) => setDose(parseInt(e.target.value as any))} min="1" max="1000" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Injection Site:</label> <select value={site} onChange={(e) => setSite(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="deltoid">Deltoid</option><option value="glutes">Glutes</option><option value="quads">Quads</option><option value="pectorals">Pectorals</option><option value="triceps">Triceps</option><option value="biceps">Biceps</option></select></div>
        <button onClick={addSite} className="mt-2 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}> Add Site </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        <button onClick={calculate} className="mt-6 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending}> {isPending ? 'Calculating...' : 'Minimize Pain'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.desired_dose_ml}: {result.desired_dose_ml}mL</p>
          <p className="text-zinc-500">{i18nData.max_safe_volume_ml}: {result.max_safe_volume_ml}mL</p>
          <p className="text-zinc-500">{i18nData.pain_minimization_score}: {result.pain_minimization_score}/100</p>
          <p className="text-zinc-500">{i18nData.recommended_site}: {result.recommended_site}</p>
          <p className="text-zinc-500">{i18nData.solvent_ratio}: {result.solvent_ratio}</p>
          <p className="text-zinc-500">{i18nData.temperature_recommendation}: {result.temperature_recommendation}</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.warnings.map((w: any, i: any) => <li key={i}>{w}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.rotation_schedule.map((r: any, i: any) => <li key={i}>{r}</li>)}
          </ul>
        </div>}
      </div>
    </div>
  );
}

