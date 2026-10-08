'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import { assessHPTARecovery } from '@/lib/tools/engines/tool-018-hpta-recovery';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-018-hpta-recovery.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool018HPTARecovery() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [markers, setMarkers] = useState<any[]>([]);
  const [stage, setStage] = useState('unknown');
  const [expectedRecovery, setExpectedRecovery] = useState(12);
  const [predictedCompletion, setPredictedCompletion] = useState<any>(null);
  const [improvementRate, setImprovementRate] = useState('slow');
  const [lastAnalysis, setLastAnalysis] = useState('');

  useEffect(() => {
    if (savedState?.hpta_markers) {
      setMarkers(savedState.hpta_markers as any);
      const assessment = assessHPTARecovery(savedState.hpta_markers as any);
      setStage(assessment.stage);
      setExpectedRecovery(assessment.expected_recovery_weeks);
      setPredictedCompletion(assessment.predicted_completion);
      setImprovementRate(assessment.improvement_rate);
      setLastAnalysis(new Date().toISOString().split('T')[0]);
    }
  }, [savedState]);

  const addMarker = () => {
    const nextMarkers: any[] = [...markers, { date: new Date().toISOString().split('T')[0], symptoms: 'stable' }];
    setMarkers(nextMarkers);
    const assessment = assessHPTARecovery(nextMarkers);
    setStage(assessment.stage);
    setExpectedRecovery(assessment.expected_recovery_weeks);
    setPredictedCompletion(assessment.predicted_completion);
    setImprovementRate(assessment.improvement_rate);
    setLastAnalysis(new Date().toISOString().split('T')[0]);
    debouncedSave({ ...savedState, hpta_markers: nextMarkers });
  };

  const recalculate = () => {
    const assessment = assessHPTARecovery(markers);
    setStage(assessment.stage);
    setExpectedRecovery(assessment.expected_recovery_weeks);
    setPredictedCompletion(assessment.predicted_completion);
    setImprovementRate(assessment.improvement_rate);
    setLastAnalysis(new Date().toISOString().split('T')[0]);
    debouncedSave({ ...savedState, hpta_markers: markers });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
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

