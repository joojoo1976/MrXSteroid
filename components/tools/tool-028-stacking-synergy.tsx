'use client';

import React, { useState } from 'react';
import i18nJson from '@/i18n/tool-028-stacking-synergy.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { buildStackComparisonWorksheetV7 } from '@/lib/tools/engines/tool-028-stacking-synergy';
import {
  StackComparisonInputSchema,
  type StackComparisonResult,
} from '@/lib/tools/schemas/tool-028-stacking-synergy';

interface Draft {
  scenarioAName: string;
  scenarioAItems: string;
  scenarioANotes: string;
  scenarioBName: string;
  scenarioBItems: string;
  scenarioBNotes: string;
}

const EMPTY_DRAFT: Draft = {
  scenarioAName: '', scenarioAItems: '', scenarioANotes: '',
  scenarioBName: '', scenarioBItems: '', scenarioBNotes: '',
};

function parseLines(value: string): string[] {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

export default function Tool028CompoundStackingWorksheet() {
  const t = useToolI18n(i18nJson);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [result, setResult] = useState<StackComparisonResult | null>(null);
  const [validationError, setValidationError] = useState(false);

  const updateDraft = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setResult(null);
    setValidationError(false);
  };

  const compare = () => {
    const parsed = StackComparisonInputSchema.safeParse({
      scenarioA: {
        name: draft.scenarioAName,
        items: parseLines(draft.scenarioAItems),
        notes: draft.scenarioANotes.trim() || undefined,
      },
      scenarioB: {
        name: draft.scenarioBName,
        items: parseLines(draft.scenarioBItems),
        notes: draft.scenarioBNotes.trim() || undefined,
      },
    });
    if (!parsed.success) {
      setValidationError(true);
      setResult(null);
      return;
    }
    try {
      setResult(buildStackComparisonWorksheetV7(parsed.data));
      setValidationError(false);
    } catch {
      setValidationError(true);
      setResult(null);
    }
  };

  const reset = () => {
    setDraft(EMPTY_DRAFT);
    setResult(null);
    setValidationError(false);
  };

  const scenarioForm = (
    id: 'A' | 'B',
    title: string,
    nameKey: 'scenarioAName' | 'scenarioBName',
    itemsKey: 'scenarioAItems' | 'scenarioBItems',
    notesKey: 'scenarioANotes' | 'scenarioBNotes',
  ) => (
    <section className="space-y-4 rounded border p-4" aria-labelledby={`tool-028-scenario-${id}`}>
      <h3 id={`tool-028-scenario-${id}`} className="font-semibold">{title}</h3>
      <label className="block text-sm font-medium">
        {t.scenario_name}
        <input value={draft[nameKey]} maxLength={120} onChange={(event) => updateDraft(nameKey, event.target.value)}
          className="mt-1 w-full rounded border p-2" />
      </label>
      <label className="block text-sm font-medium">
        {t.items_one_per_line}
        <textarea value={draft[itemsKey]} maxLength={1300} onChange={(event) => updateDraft(itemsKey, event.target.value)}
          className="mt-1 w-full rounded border p-2" rows={6} />
      </label>
      <label className="block text-sm font-medium">
        {t.notes_optional}
        <textarea value={draft[notesKey]} maxLength={500} onChange={(event) => updateDraft(notesKey, event.target.value)}
          className="mt-1 w-full rounded border p-2" rows={3} />
      </label>
    </section>
  );

  return (
    <section className="pct-timing-tool p-6" dir={t.dir}>
      <h2 className="mb-3 text-2xl font-bold">{t.tool_name}</h2>
      <p role="note" className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        {t.scope_note}
      </p>
      <p role="status" className="mb-6 rounded bg-zinc-100 p-3 text-sm">{t.assessment_unavailable}</p>

      <div className="grid gap-4 md:grid-cols-2">
        {scenarioForm('A', t.scenario_a, 'scenarioAName', 'scenarioAItems', 'scenarioANotes')}
        {scenarioForm('B', t.scenario_b, 'scenarioBName', 'scenarioBItems', 'scenarioBNotes')}
      </div>

      {validationError && <p role="alert" className="mt-4 text-sm text-red-700">{t.validation_error}</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={compare} className="rounded bg-blue-700 px-4 py-3 font-medium text-white">{t.compare}</button>
        <button type="button" onClick={reset} className="rounded border px-4 py-3 font-medium">{t.reset}</button>
      </div>

      {result && (
        <section aria-labelledby="tool-028-result-heading" className="mt-6 rounded border p-4">
          <h3 id="tool-028-result-heading" className="font-semibold">{t.manual_comparison}</h3>
          <p className="mt-1 text-xs text-zinc-500">{result.resultOrigin} · {result.assessment}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[result.scenarioA, result.scenarioB].map((scenario, index) => (
              <div key={`${scenario.name}-${index}`} className="rounded bg-zinc-50 p-3">
                <h4 className="font-medium">{scenario.name}</h4>
                <ul className="mt-2 list-disc space-y-1 ps-5 text-sm">
                  {scenario.items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>{item}</li>)}
                </ul>
                {scenario.notes && <p className="mt-2 text-sm text-zinc-600">{scenario.notes}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
