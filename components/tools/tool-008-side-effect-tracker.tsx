import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle from './MeasurementToggle';
import i18nData from '@/i18n/tool-008-side-effect-tracker.json';

export default function Tool008SideEffectTracker() {
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [symptom, setSymptom] = useState<string>('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [category, setCategory] = useState<'estrogenic' | 'androgenic' | 'cardiovascular' | 'hepatotoxic' | 'psychological' | 'other'>('estrogenic');
  const [notes, setNotes] = useState<string>('');
  const [logEntries, setLogEntries] = useState<Array<{
    id: string;
    date: string;
    symptom: string;
    severity: string;
    category: string;
    notes: string;
  }>>([]));

  useEffect(() => {
    if (savedState?.side_effects?.logEntries) {
      setLogEntries(savedState.side_effects.logEntries);
    }
  }, [savedState]);

  useEffect(() => {
    if (symptom.trim().length > 0) {
      const newEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        symptom,
        severity: severity,
        category,
        notes: notes || '',
      };
      setLogEntries(prev => [...prev, newEntry]);
      
      setSymptom('');
      setNotes('');

      debouncedSave({
        ...savedState,
        side_effects: {
          total_logs: (savedState?.side_effects?.total_logs || 0) + 1,
          logEntries: [...logEntries, newEntry],
        },
      });
    }
  }, [symptom, severity, category, notes, savedState]);

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4" dir="ltr">
          <div>
            <label className="block text-sm font-medium mb-2" dir="ltr">Symptom:</label>
            <input
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="e.g., Gynecomastia, Mood changes, Low libido"
              className="w-full rounded border p-2"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" dir="ltr">Severity:</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full rounded border p-2"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" dir="ltr">Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded border p-2"
          >
            <option value="estrogenic">Estrogenic</option>
            <option value="androgenic">Androgenic</option>
            <option value="cardiovascular">Cardiovascular</option>
            <option value="hepatotoxic">Hepatotoxic</option>
            <option value="psychological">Psychological</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" dir="ltr">Notes:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional details..."
            rows={2}
            className="w-full rounded border p-2 resize-y"
            dir="ltr"
          /></textarea>
        </div>
        <button
          onClick={() => {
            if (symptom.trim().length > 0) {
              // Entry handled in useEffect
            }
          }}
          className="mt-2 w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          disabled={!symptom.trim().length}
        >
          Log Symptom
        </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <h3 className="text-semibold mb-3">{i18nData.risk_level} Overview</h3>
          <p className="text-zinc-600">{logEntries.length} symptoms logged</p>
          {logEntries.length > 0 && (
            <p className="text-sm text-zinc-500">{logEntries[logEntries.length - 1].symptom} ({logEntries[logEntries.length - 1].severity})</p>
          )}
        </div>
      </div>
    </div>
  );
}