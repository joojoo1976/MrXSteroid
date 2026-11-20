'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { runCardioMonitor, type CardioMonitorBuildOptions } from '@/lib/tools/r6/tool-019-cardio-monitor-pipeline';
import i18nJson from '@/i18n/tool-019-cardio-monitor.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { requireTool } from '@/lib/tools/registry';

export default function Tool019CardioMonitor() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);
  const tool = requireTool('tool-019-cardio-monitor');

  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [heartRate, setHeartRate] = useState(70);
  const [cholesterolTotal, setCholesterolTotal] = useState(180);
  const [hdlCholesterol, setHdlCholesterol] = useState(50);
  const [ldlCholesterol, setLdlCholesterol] = useState(100);
  const [triglycerides, setTriglycerides] = useState(150);
  const [compounds, setCompounds] = useState<any[]>([]);
  const [cycleLength, setCycleLength] = useState(8);

  // R6 Pipeline integration
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'calculating' | 'done' | 'error'>('idle');

  const options: CardioMonitorBuildOptions = {
    calculatedAt: new Date().toISOString(),
    recordedAt: new Date().toISOString(),
    locale: 'en',
    unitSystem: 'metric',
    snapshotType: 'draft',
  };

  useEffect(() => {
    if (savedState?.cardio_risk) {
      const r = savedState.cardio_risk as any;
      setSystolic(r.systolic_bp ?? 120);
      setDiastolic(r.diastolic_bp ?? 80);
      setHeartRate(r.heart_rate ?? 70);
      setCholesterolTotal(r.cholesterol_total ?? 180);
      setHdlCholesterol(r.hdl_cholesterol ?? 50);
      setLdlCholesterol(r.ldl_cholesterol ?? 100);
      setTriglycerides(r.triglycerides ?? 150);
      setCompounds(r.compounds ?? []);
      setCycleLength(r.cycle_length_weeks ?? 8);
    }
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

    setPipelineStatus('calculating');
    const result = runCardioMonitor(input, options);
    if (result.ok) {
      setPipelineResult(result.output);
      setPipelineError(null);
      setPipelineStatus('done');

      const r = result.output.result;
      debouncedSave({ ...savedState, cardio_risk: r });
    } else {
      setPipelineResult(null);
      setPipelineError(String(result.error));
      setPipelineStatus('error');
    }
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <div className="space-y-4">
        {/* R6 Pipeline Result */}
        {pipelineStatus === 'calculating' && (
          <div className="rounded-lg border border-blue-500/50 bg-blue-950/20 p-4">
            <p className="font-semibold">جاري حساب مخاطر القلب عبر R6 Pipeline…</p>
          </div>
        )}
        {pipelineStatus === 'done' && pipelineResult && (
          <div className="rounded-lg border border-green-500/50 bg-green-950/20 p-4">
            <p className="font-semibold text-green-100">✓ تم الحساب عبر R6 Pipeline</p>
            <p className="mt-1 text-sm text-green-200">المخاطر الإجمالية: {pipelineResult.result.overall_risk}</p>
            <p className="mt-1 text-sm text-green-200">نقاط المخاطرة: {pipelineResult.result.risk_score}/100</p>
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
          <div><label className="block text-sm font-medium mb-2" dir="ltr">Systolic BP (mmHg):</label> <input data-r6-slider="true" type="number" value={systolic} onChange={(e) => setSystolic(parseInt(e.target.value as any))} min="60" max="250" className="w-full rounded border p-2" dir="ltr" /></div>
          <div><label className="block text-sm font-medium mb-2" dir="ltr">Diastolic BP (mmHg):</label> <input data-r6-slider="true" type="number" value={diastolic} onChange={(e) => setDiastolic(parseInt(e.target.value as any))} min="40" max="150" className="w-full rounded border p-2" dir="ltr" /></div>
          <div><label className="block text-sm font-medium mb-2" dir="ltr">Heart Rate (bpm):</label> <input data-r6-slider="true" type="number" value={heartRate} onChange={(e) => setHeartRate(parseInt(e.target.value as any))} min="40" max="200" className="w-full rounded border p-2" dir="ltr" /></div>
          <div><label className="block text-sm font-medium mb-2" dir="ltr">Total Cholesterol (mg/dL):</label> <input data-r6-slider="true" type="number" value={cholesterolTotal} onChange={(e) => setCholesterolTotal(parseInt(e.target.value as any))} min="50" max="500" className="w-full rounded border p-2" dir="ltr" /></div>
          <div><label className="block text-sm font-medium mb-2" dir="ltr">HDL Cholesterol (mg/dL):</label> <input data-r6-slider="true" type="number" value={hdlCholesterol} onChange={(e) => setHdlCholesterol(parseInt(e.target.value as any))} min="20" max="200" className="w-full rounded border p-2" dir="ltr" /></div>
          <div><label className="block text-sm font-medium mb-2" dir="ltr">LDL Cholesterol (mg/dL):</label> <input data-r6-slider="true" type="number" value={ldlCholesterol} onChange={(e) => setLdlCholesterol(parseInt(e.target.value as any))} min="20" max="300" className="w-full rounded border p-2" dir="ltr" /></div>
          <div><label className="block text-sm font-medium mb-2" dir="ltr">Triglycerides (mg/dL):</label> <input data-r6-slider="true" type="number" value={triglycerides} onChange={(e) => setTriglycerides(parseInt(e.target.value as any))} min="20" max="1000" className="w-full rounded border p-2" dir="ltr" /></div>
          <div><label className="block text-sm font-medium mb-2" dir="ltr">Cycle Length (weeks):</label> <input data-r6-slider="true" type="number" value={cycleLength} onChange={(e) => setCycleLength(parseInt(e.target.value as any))} min="1" max="52" className="w-full rounded border p-2" dir="ltr" /></div>
          <div><label className="block text-sm font-medium mb-2" dir="ltr">Compound Stack:</label> <input type="text" value={compounds.length > 0 ? compounds.map(c => c.name_en).join(', ') : 'No compounds selected'} readOnly className="w-full rounded border p-2 border-dashed text-zinc-500" dir="ltr" /></div>
          <button onClick={check} className="mt-4 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" disabled={isPending}> {isPending ? 'Checking...' : 'Calculate Risk'} </button>
          {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

          {pipelineStatus === 'done' && pipelineResult && (
            <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
              <p className="text-zinc-600 font-bold">{i18nData.overall_risk}: {pipelineResult.result.overall_risk}</p>
              <p className="text-zinc-500">{i18nData.risk_score}: {pipelineResult.result.risk_score}/100</p>
              <p className="text-zinc-500">{i18nData.cholesterol_ratio}: {pipelineResult.result.cholesterol_ratio}</p>
              <ul className="mt-3 space-y-1 text-sm text-zinc-600">
                {pipelineResult.result.risk_factors.map((f: any, i: any) => <li key={i}>{f}</li>)}
              </ul>
              <ul className="mt-3 space-y-1 text-sm text-zinc-600">
                {pipelineResult.result.compound_warnings.map((w: any, i: any) => <li key={i}>{w}</li>)}
              </ul>
              <ul className="mt-3 space-y-1 text-sm text-zinc-600">
                {pipelineResult.result.recommendations.map((r: any, i: any) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
