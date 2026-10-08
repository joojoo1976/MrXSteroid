'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle from './MeasurementToggle';
import i18nJson from '@/i18n/tool-007-bloodwork-analyzer.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';

export default function Tool007BloodworkAnalyzer() {
  const i18nData = useToolI18n(i18nJson);
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [markers, setMarkers] = useState<Array<{ name_en: string; value: number; unit: string }>>([]);
  const [overallAssessment, setOverallAssessment] = useState<'optimal' | 'suboptimal' | 'concerning' | 'critical'>('optimal');
  const [hptaStatus, setHPTAStatus] = useState<'fully_recovered' | 'partially_suppressed' | 'severely_suppressed' | 'unknown'>('fully_recovered');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [testDate, setTestDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (savedState?.last_bloodwork) {
      const bw = savedState.last_bloodwork as any;
      setMarkers(bw.markers || []);
      setOverallAssessment(bw.overall_assessment || 'optimal');
      setHPTAStatus(bw.hpta_status || 'fully_recovered');
      setRecommendations(bw.recommendations || []);
      setTestDate(bw.test_date || testDate);
    }
  }, [savedState]);

  useEffect(() => {
    if (markers.length > 0) {
      let concernCount = 0;
      markers.forEach(() => concernCount++); // Simplified
      
      if (concernCount > 2) {
        setOverallAssessment('concerning');
        setHPTAStatus('partially_suppressed');
      } else {
        setOverallAssessment('optimal');
        setHPTAStatus('fully_recovered');
      }
      
      setRecommendations(['Consult healthcare provider', 'Monitor trends', 'Support liver health']);

      debouncedSave({
        ...savedState,
        last_bloodwork: { test_date: testDate, markers, overall_assessment: overallAssessment, hpta_status: hptaStatus, recommendations },
      });
    }
  }, [markers]);

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div><label className="block text-sm font-medium mb-2" dir="ltr">Test Date:</label> <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value as any)} className="w-full rounded border p-2" dir="ltr" /></div>
        <div>
          <p className="text-zinc-600 font-medium">{i18nData.overall_assessment}: {overallAssessment}</p>
          <p className="text-zinc-500 text-sm">{i18nData.hpta_status}: {hptaStatus}</p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-600">
            {recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
        <button onClick={() => debouncedSave({ ...savedState, last_bloodwork: { test_date: testDate, markers, overall_assessment: overallAssessment, hpta_status: hptaStatus, recommendations } })} className="mt-4 w-full py-3 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Result'}
        </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}
      </div>
    </div>
  );
}