'use client';

import React, { useState } from 'react';
import i18nJson from '@/i18n/tool-028-stacking-synergy.json';
import { useToolI18n } from '@/lib/tools/i18nHelper';
import { runStackingSynergy, type StackingSynergyBuildOptions } from '@/lib/tools/r6/tool-028-stacking-synergy-pipeline';
import {
  StackComparisonInputSchema,
  type StackComparisonResult,
} from '@/lib/tools/schemas/tool-028-stacking-synergy';
import { requireTool } from '@/lib/tools/registry';

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
  const tool = requireTool('tool-028-stacking-synergy');

  // R6 Pipeline integration
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'calculating' | 'done' | 'error'>('idle');

  const options: StackingSynergyBuildOptions = {
    calculatedAt: new Date().toISOString(),
    recordedAt: new Date().toISOString(),
    locale: 'en',
    unitSystem: 'metric',
    snapshotType: 'draft',
  };

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

    setPipelineStatus('calculating');
    const pipeline = runStackingSynergy(parsed.data, options);
    if (pipeline.ok) {
      setPipelineResult(pipeline.output);
      setPipelineError(null);
      setPipelineStatus('done');
      setResult(pipeline.output.result);
      setValidationError(false);
    } else {
      setPipelineResult(null);
      setPipelineError(String(pipeline.error));
      setPipelineStatus('error');
      setResult(null);
    }
  };

  const reset = () => {
    setDraft(EMPTY_DRAFT);
    setResult(null);
    setValidationError(false);
    setPipelineResult(null);
    setPipelineError(null);
    setPipelineStatus('idle');
  };

  const displayResult = pipelineStatus === 'done' && pipelineResult ? pipelineResult.result : result;

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

      {/* R6 Pipeline Status */}
      {pipelineStatus === 'calculating' && (
        <div className="rounded-lg border border-blue-500/50 bg-blue-950/20 p-4">
          <p className="font-semibold">جاري مقارنة السيناريوهات عبر R6 Pipeline…</p>
        </div>
      )}
      {pipelineStatus === 'done' && pipelineResult && (
        <div className="rounded-lg border border-green-500/50 bg-green-950/20 p-4">
          <p className="font-semibold text-green-100">✓ تمت المقارنة عبر R6 Pipeline</p>
          <p className="mt-1 text-sm text-green-200">التقييم: {pipelineResult.result.assessment}</p>
          <p className="mt-1 text-sm text-green-200">عدد السيناريوهات: {pipelineResult.result.scenarioA.items.length} و {pipelineResult.result.scenarioB.items.length}</p>
          <p className="mt-1 text-sm text-green-200">مصدر البيانات: {pipelineResult.provenance.source}</p>
        </div>
      )}
      {pipelineStatus === 'error' && pipelineError && (
        <div className="rounded-lg border border-red-500/50 bg-red-950/20 p-4 text-red-100">
          <p className="font-semibold">خطأ في المقارنة</p>
          <p className="mt-1 text-sm">{pipelineError}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {scenarioForm('A', t.scenario_a, 'scenarioAName', 'scenarioAItems', 'scenarioANotes')}
        {scenarioForm('B', t.scenario_b, 'scenarioBName', 'scenarioBItems', 'scenarioBNotes')}
      </div>

      {validationError && <p role="alert" className="mt-4 text-sm text-red-700">{t.validation_error}</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={compare} className="rounded bg-blue-700 px-4 py-3 font-medium text-white">{t.compare}</button>
        <button type="button" onClick={reset} className="rounded border px-4 py-3 font-medium">{t.reset}</button>
      </div>

      {displayResult && (
        <section aria-labelledby="tool-028-result-heading" className="mt-6 rounded border p-4">
          <h3 id="tool-028-result-heading" className="font-semibold">{t.manual_comparison}</h3>
          <p className="mt-1 text-xs text-zinc-500">{displayResult.resultOrigin} · {displayResult.assessment}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[displayResult.scenarioA, displayResult.scenarioB].map((scenario: any, index: number) => (
              <div key={`${scenario.name}-${index}`} className="rounded bg-zinc-50 p-3">
                <h4 className="font-medium">{scenario.name}</h4>
                <ul className="mt-2 list-disc space-y-1 ps-5 text-sm">
                  {scenario.items.map((item: string, itemIndex: number) => <li key={`${item}-${itemIndex}`}>{item}</li>)}
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
