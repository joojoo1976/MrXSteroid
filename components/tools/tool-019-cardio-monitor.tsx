import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle from './MeasurementToggle';
import i18nData from '@/i18n/tool-019-cardio-monitor.json';

export default function Tool019CardioMonitor() {
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [heartRate, setHeartRate] = useState(70);
  const [cholesterolTotal, setCholesterolTotal] = useState(180);
  const [hdlCholesterol, setHdlCholesterol] = useState(50);
  const [ldlCholesterol, setLdlCholesterol] = useState(100);
  const [triglycerides, setTriglycerides] = useState(150);
  const [compounds, setCompounds] = useState<any[]>([]);
  const [cycleLength, setCycleLength] = useState(8);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (savedState?.cardio_risk) setResult(savedState.cardio_risk);
  }, [savedState]);

  const check = () => {
    const input = {
      systolic_bp: systolic,
      diastolic_bp: diastolic,
      heart_rate: heartRate,
      cholesterol_total: cholesterolTotal,
      hdl_cholesterol: hdlCholesterol,
      ldl_cholesterol: ldlCholesterol,
      triglycerides: triglycerides,
      compounds,
      cycle_length_weeks: cycleLength,
    };
    const r = calculateCardioRisk(input);
    setResult(r);
    debouncedSave({ ...savedState, cardio_risk: r });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Systolic BP (mmHg):</label> <input type="number" value={systolic} onChange={(e) => setSystolic(parseInt(e.target.value))} min="60" max="250" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Diastolic BP (mmHg):</label> <input type="number" value={diastolic} onChange={(e) => setDiastolic(parseInt(e.target.value))} min="40" max="150" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Heart Rate (bpm):</label> <input type="number" value={heartRate} onChange={(e) => setHeartRate(parseInt(e.target.value))} min="40" max="200" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Total Cholesterol (mg/dL):</label> <input type="number" value={cholesterolTotal} onChange={(e) => setCholesterolTotal(parseInt(e.target.value))} min="50" max="500" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">HDL Cholesterol (mg/dL):</label> <input type="number" value={hdlCholesterol} onChange={(e) => setHdlCholesterol(parseInt(e.target.value))} min="20" max="200" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">LDL Cholesterol (mg/dL):</label> <input type="number" value={ldlCholesterol} onChange={(e) => setLdlCholesterol(parseInt(e.target.value))} min="20" max="300" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Triglycerides (mg/dL):</label> <input type="number" value={triglycerides} onChange={(e) => setTriglycerides(parseInt(e.target.value))} min="20" max="1000" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Cycle Length (weeks):</label> <input type="number" value={cycleLength} onChange={(e) => setCycleLength(parseInt(e.target.value))} min="1" max="52" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Compound Stack:</label> <input type="text" value={compounds.length > 0 ? compounds.map(c => c.name_en).join(', ') : 'No compounds selected'} readOnly className="w-full rounded border p-2 border-dashed text-zinc-500" dir="ltr" /></div>
        <button onClick={check} className="mt-4 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending}> {isPending ? 'Checking...' : 'Calculate Risk'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        {result && <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <p className="text-zinc-600 font-bold">{i18nData.overall_risk}: {result.overall_risk}</p>
          <p className="text-zinc-500">{i18nData.risk_score}: {result.risk_score}/100</p>
          <p className="text-zinc-500">{i18nData.cholesterol_ratio}: {result.cholesterol_ratio}</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.risk_factors.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.compound_warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>)}
      </div>
    </div>
  );
}