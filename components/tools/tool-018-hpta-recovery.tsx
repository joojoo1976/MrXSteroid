'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { runHPTARecovery, type HPTARecoveryBuildOptions } from '@/lib/tools/r6/tool-018-hpta-recovery-pipeline';
import i18nJson from '@/i18n/tool-018-hpta-recovery.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';
import { requireTool } from '@/lib/tools/registry';

export default function Tool018HPTARecovery() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);
  const tool = requireTool('tool-018-hpta-recovery');

  const [markers, setMarkers] = useState<any[]>([]);
  const [stage, setStage] = useState('unknown');
  const [expectedRecovery, setExpectedRecovery] = useState(12);
  const [predictedCompletion, setPredictedCompletion] = useState<any>(null);
  const [improvementRate, setImprovementRate] = useState('slow');
  const [lastAnalysis, setLastAnalysis] = useState('');

  // R6 Pipeline integration
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'calculating' | 'done' | 'error'>('idle');

  const options: HPTARecoveryBuildOptions = {
    calculatedAt: new Date().toISOString(),
    recordedAt: new Date().toISOString(),
    locale: 'en',
    unitSystem: 'metric',
    snapshotType: 'draft',
  };

  useEffect(() => {
    if (savedState?.hpta_markers) {
      setMarkers(savedState.hpta_markers as any);
    }
  }, [savedState]);

  useEffect(() => {
    if (markers.length === 0) {
      setPipelineResult(null);
      setPipelineError(null);
      setPipelineStatus('idle');
      return;
    }

    setPipelineStatus('calculating');
    const result = runHPTARecovery(markers, options);
    if (result.ok) {
      setPipelineResult(result.output);
      setPipelineError(null);
      setPipelineStatus('done');

      const r = result.output.result;
      setStage(r.stage);
      setExpectedRecovery(r.expected_recovery_weeks);
      setPredictedCompletion(r.predicted_completion);
      setImprovementRate(r.improvement_rate);
      setLastAnalysis(new Date().toISOString().split('T')[0]);
    } else {
      setPipelineResult(null);
      setPipelineError(String(result.error));
      setPipelineStatus('error');
    }
  }, [markers, options.locale, options.unitSystem, options.snapshotType]);

  const addMarker = () => {
    const nextMarkers: any[] = [...markers, { date: new Date().toISOString().split('T')[0], symptoms: 'stable' }];
    setMarkers(nextMarkers);
    debouncedSave({ ...savedState, hpta_markers: nextMarkers });
  };

  const recalculate = () => {
    // Pipeline will auto-run via useEffect when markers change
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <div className="space-y-4">
        {/* R6 Pipeline Result */}
        {pipelineStatus === 'calculating' && (
          <div className="rounded-lg border border-blue-500/50 bg-blue-950/20 p-4">
            <p className="font-semibold">جاري التحليل عبر R6 Pipeline…</p>
          </div>
        )}
        {pipelineStatus === 'done' && pipelineResult && (
          <div className="rounded-lg border border-green-500/50 bg-green-950/20 p-4">
            <p className="font-semibold text-green-100">✓ تم التحليل عبر R6 Pipeline</p>
            <p className="mt-1 text-sm text-green-200">المسرح: {pipelineResult.result.stage}</p>
            <p className="mt-1 text-sm text-green-200">معدل التحسن: {pipelineResult.result.improvement_rate}</p>
            <p className="mt-1 text-sm text-green-200">مصدر البيانات: {pipelineResult.provenance.source}</p>
          </div>
        )}
        {pipelineStatus === 'error' && pipelineError && (
          <div className="rounded-lg border border-red-500/50 bg-red-950/20 p-4 text-red-100">
            <p className="font-semibold">خطأ في التحليل</p>
            <p className="mt-1 text-sm">{pipelineError}</p>
          </div>
        )}
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Stage:</label> <select value={stage} onChange={(e) => setStage(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="suppressed">Suppressed</option><option value="partial">Partial Recovery</option><option value="fully_recovered">Fully Recovered</option><option value="unknown">Unknown</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Expected Recovery (weeks):</label> <input type="number" value={expectedRecovery} onChange={(e) => setExpectedRecovery(parseInt(e.target.value as any))} min="1" max="52" className="w-full rounded border p-2" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Predicted Completion:</label> <input type="text" value={predictedCompletion || 'Not calculated'} readOnly className="w-full rounded border p-2 bg-zinc-950 text-white" dir="ltr" /></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Improvement Rate:</label> <select value={improvementRate} onChange={(e) => setImprovementRate(e.target.value as any)} className="w-full rounded border p-2" dir="ltr"><option value="slow">Slow</option><option value="moderate">Moderate</option><option value="fast">Fast</option></select></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Last Analysis:</label> <p className="text-zinc-500 text-sm" dir="ltr">{lastAnalysis}</p></div>
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Markers:</label> <p className="text-zinc-500 text-sm" dir="ltr">{markers.length} logged</p></div>
        <button onClick={addMarker} className="mt-4 w-full py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}> {isPending ? 'Saving...' : 'Add Marker'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}
        <button onClick={recalculate} className="mt-4 w-full py-2 rounded bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors" disabled={isPending}> {isPending ? 'Recalculating...' : 'Reanalyze'} </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}
      </div>
    </div>
  );
}
