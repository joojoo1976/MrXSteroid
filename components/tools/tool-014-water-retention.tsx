import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle from './MeasurementToggle';
import i18nData from '@/i18n/tool-014-water-retention.json';

export default function Tool014WaterRetention() {
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [e2Level, setE2Level] = useState<number>(50);
  const [weightKg, setWeightKg] = useState<number>(85);
  const [sodiumIntake, setSodiumIntake] = useState<number>(2300);
  const [carbIntake, setCarbIntake] = useState<number>(300);
  const [potassiumIntake, setPotassiumIntake] = useState<number>(3500);
  const [compoundStack, setCompoundStack] = useState<any[]>([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (savedState?.water_retention) setResult(savedState.water_retention);
  }, [savedState]);

  const calculate = () => {
    const input = {
      e2_level: e2Level,
      weight_kg: weightKg,
      compound_stack: compoundStack,
      sodium_intake_mg: sodiumIntake,
      carb_intake_g: carbIntake,
      potassium_intake_mg: potassiumIntake,
    };
    const r = calculateWaterRetention(input);
    setResult(r);
    debouncedSave({ ...savedState, water_retention: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Estradiol (pg/mL):</label> <input type="number" value={e2Level} onChange={(e) => setE2Level(parseFloat(e.target.value))} min="0" max="500" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Weight (kg):</label> <input type="number" value={weightKg} onChange={(e) => setWeightKg(parseFloat(e.target.value))} min="30" max="200" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Sodium Intake (mg/day):</label> <input type="number" value={sodiumIntake} onChange={(e) => setSodiumIntake(parseFloat(e.target.value))} min="0" max="10000" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Carbs Intake (g/day):</label> <input type="number" value={carbIntake} onChange={(e) => setCarbIntake(parseFloat(e.target.value))} min="0" max="1000" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Potassium Intake (mg/day):</label> <input type="number" value={potassiumIntake} onChange={(e) => setPotassiumIntake(parseFloat(e.target.value))} min="0" max="10000" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Compound Stack:</label> <input type="text" value={compoundStack.length > 0 ? compoundStack.map(c => c.name_en).join(', ') : 'No compounds selected'} readOnly className="w-full rounded border p-2 border-dashed text-zinc-500" dir="ltr" /></div>
        <button onClick={calculate} className="mt-4 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending}> {isPending ? 'Calculating...' : 'Calculate Retention'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.retention_severity}: {result.retention_severity}</p>
          <p className="text-zinc-500">Estimated Retention: {result.estimated_retention_liters} liters</p>
          <p className="text-zinc-500">{i18nData.target_weight_loss}: {result.target_weight_loss_kg} kg</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.diuretic_suggestions.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>)}
      </div>
    </div>
  );
}