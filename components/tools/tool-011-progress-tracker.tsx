'use client';

import React, { useState, useEffect } from 'react';
import { useUserToolState, useUpdateToolState, useDebounce } from '@/lib/hooks/useToolState';
import i18nJson from '@/i18n/tool-011-progress-tracker.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { useToolDisplayPreferences } from '@/components/tools/useToolDisplayPreferences';

const KG_PER_LB = 2.20462;

export default function Tool011ProgressTracker() {
  const i18nData = useToolI18n(i18nJson);
  const { unitSystem, isRtl } = useToolDisplayPreferences();
  const { data: savedState } = useUserToolState('user-id');
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
  }>>([])

  useEffect(() => {
    if (savedState?.progress_entries) {
      setEntries((savedState.progress_entries as any) || []);
    }
  }, [savedState]);

  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newWeightKg, setNewWeightKg] = useState<number>(0);
  const [newStrengthKg, setNewStrengthKg] = useState<number>(0);
  const [newBodyFat, setNewBodyFat] = useState<number | null>(null);
  const [newNotes, setNewNotes] = useState<string>('');
  const massUnit = unitSystem === 'imperial' ? 'lb' : 'kg';
  const displayMass = (kg: number | undefined, lbs: number | undefined) => {
    const valueInKg = kg ?? (lbs === undefined ? undefined : lbs / KG_PER_LB);
    if (valueInKg === undefined) return undefined;
    const displayed = unitSystem === 'imperial' ? valueInKg * KG_PER_LB : valueInKg;
    return Number(displayed.toFixed(2));
  };
  const parseDisplayedMass = (value: string) => {
    const displayedValue = Number(value);
    if (!Number.isFinite(displayedValue)) return 0;
    return unitSystem === 'imperial' ? displayedValue / KG_PER_LB : displayedValue;
  };

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
      body_fat_pct: newBodyFat ?? undefined,
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
    <div className="pct-timing-tool p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <h2 className="text-2xl font-bold mb-6">{i18nData.tool_name}</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4" dir="ltr">
          <div>
            <label className="block text-sm font-medium mb-2" dir={isRtl ? 'rtl' : 'ltr'}>{i18nData.date}:</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value as any)}
              className="w-full rounded border p-2"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" dir={isRtl ? 'rtl' : 'ltr'}>{i18nData.weight.replace(/\s*\([^)]*\)$/, '')} ({massUnit}):</label>
            <input
              type="number"
              value={unitSystem === 'imperial' ? Number((newWeightKg * KG_PER_LB).toFixed(2)) : newWeightKg}
              onChange={(e) => setNewWeightKg(parseDisplayedMass(e.target.value))}
              className="w-full rounded border p-2"
              dir="ltr"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4" dir="ltr">
          <div>
            <label className="block text-sm font-medium mb-2" dir={isRtl ? 'rtl' : 'ltr'}>{i18nData.strength.replace(/\s*\([^)]*\)$/, '')} ({massUnit}):</label>
            <input
              type="number"
              value={unitSystem === 'imperial' ? Number((newStrengthKg * KG_PER_LB).toFixed(2)) : newStrengthKg}
              onChange={(e) => setNewStrengthKg(parseDisplayedMass(e.target.value))}
              className="w-full rounded border p-2"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" dir={isRtl ? 'rtl' : 'ltr'}>{i18nData.body_fat}:</label>
            <input
              type="number"
              value={newBodyFat ?? ''}
              onChange={(e) => setNewBodyFat(parseFloat(e.target.value as any))}
              min="1" max="50"
              className="w-full rounded border p-2"
              dir="ltr"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" dir={isRtl ? 'rtl' : 'ltr'}>{i18nData.notes}:</label>
          <textarea
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value as any)}
            placeholder={i18nData.notes_placeholder}
            rows={2}
            className="w-full rounded border p-2 resize-y"
            dir="ltr"
          />
        </div>
        <button
          onClick={addEntry}
          className="mt-4 w-full py-3 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
          disabled={isPending}
        >
          {isPending ? i18nData.saving : i18nData.add_entry}
        </button>
        {isPending && <p className="mt-2 text-sm text-zinc-500">{i18nData.saving_to_account}</p>}

        <div className="mt-6 p-4 rounded bg-zinc-50" dir={isRtl ? 'rtl' : 'ltr'}>
          <h3 className="text-semibold mb-3">{i18nData.progress_entries} ({entries.length})</h3>
          {entries.length > 0 && (
            <p className="text-sm text-zinc-500" dir="ltr">{entries[entries.length - 1].date}: {i18nData.weight.replace(/\s*\([^)]*\)$/, '')} {displayMass(entries[entries.length - 1].weight_kg, entries[entries.length - 1].weight_lbs)} {massUnit}</p>
          )}
        </div>
      </div>
    </div>
  );
}
