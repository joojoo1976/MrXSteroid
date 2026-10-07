import React, { useState, useEffect, useCallback } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import MeasurementToggle from './MeasurementToggle';
import i18nData from '@/i18n/tool-011-progress-tracker.json';

export default function Tool011ProgressTracker() {
  const { data: savedState, isLoading: stateLoading } = useUserToolState('user-id');
  const { mutate: updateToolState, isPending } = useUpdateToolState();
  const debouncedSave = useDebounce(updateToolState, 1000);

  const [entries, setEntries] = useState<Array<{
    id: string;
    date: string;
    weight_kg?: number;
    weight_lbs?: number;
    strength_kg?: number;
    strength_lbs?: number;
    body_fat_pct?: number;
    notes?: string;
  }>>([]));

  useEffect(() => {
    if (savedState?.progress_entries) {
      setEntries(savedState.progress_entries);
    }
  }, [savedState]);

  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newWeightKg, setNewWeightKg] = useState<number>(0);
  const [newStrengthKg, setNewStrengthKg] = useState<number>(0);
  const [newBodyFat, setNewBodyFat] = useState<number | null>(null);
  const [newNotes, setNewNotes] = useState<string>('');

  useEffect(() => {
    if (entries.length > 0) {
      debouncedSave({
        ...savedState,
        progress_entries: entries,
      });
    }
  }, [entries]);

  const addEntry = () => {
    const newEntry = {
      id: crypto.randomUUID(),
      date: newDate,
      weight_kg: newWeightKg > 0 ? newWeightKg : undefined,
      weight_lbs: newWeightKg > 0 ? newWeightKg * 2.20462 : undefined,
      strength_kg: newStrengthKg > 0 ? newStrengthKg : undefined,
      strength_lbs: newStrengthKg > 0 ? newStrengthKg * 2.20462 : undefined,
      body_fat_pct: newBodyFat,
      notes: newNotes || undefined,
    };
    setEntries(prev => [...prev, newEntry]);
    
    setNewWeightKg(0);
    setNewStrengthKg(0);
    setNewBodyFat(null);
    setNewNotes('');

    debouncedSave({
      ...savedState,
      progress_entries: [...entries, newEntry],
    });
  };

  return (
    <div className="pct-timing-tool p-6" dir={i18nData.dir}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <MeasurementToggle />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4" dir="ltr">
          <div>
            <label className="block text-sm font-medium mb-2" dir="ltr">Date:</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full rounded border p-2"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" dir="ltr">Weight (kg):</label>
            <input
              type="number"
              value={newWeightKg}
              onChange={(e) => setNewWeightKg(parseFloat(e.target.value))}
              className="w-full rounded border p-2"
              dir="ltr"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4" dir="ltr">
          <div>
            <label className="block text-sm font-medium mb-2" dir="ltr">Strength (kg):</label>
            <input
              type="number"
              value={newStrengthKg}
              onChange={(e) => setNewStrengthKg(parseFloat(e.target.value))}
              className="w-full rounded border p-2"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" dir="ltr">Body Fat %:</label>
            <input
              type="number"
              value={newBodyFat ?? ''}
              onChange={(e) => setNewBodyFat(parseFloat(e.target.value))}
              min="1" max="50"
              className="w-full rounded border p-2"
              dir="ltr"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" dir="ltr">Notes:</label>
          <textarea
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="e.g., Felt strong today, Good pump..."
            rows={2}
            className="w-full rounded border p-2 resize-y"
            dir="ltr"
          /></textarea>
        </div>
        <button
          onClick={addEntry}
          className="mt-4 w-full py-3 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
          disabled={isPending}
        >
          {isPending ? 'Saving...' : 'Add Entry'}
        </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">Saving to database...</p>}

        <div className="mt-6 p-4 rounded bg-zinc-50" dir="ltr">
          <h3 className="text-semibold mb-3">Progress Entries ({entries.length})</h3>
          {entries.length > 0 && (
            <p className="text-sm text-zinc-500">{entries[entries.length - 1].date}: Weight {entries[entries.length - 1].weight_kg}kg</p>
          )}
        </div>
      </div>
    </div>
  );
}