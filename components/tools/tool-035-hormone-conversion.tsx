'use client';
/** Tool #035 — sourced testosterone and estradiol lab-unit converter. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { calculateHormoneConversion } from '@/lib/tools/engines/tool-035-hormone-conversion';
import { buildConversionOutput } from '@/lib/tools/adapters/tool-035-hormone-conversion';
import { AUTO_DRAFT_DEBOUNCE_MS, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { ConversionInputSchema } from '@/lib/tools/schemas/tool-035-hormone-conversion';
import i18nJson from '@/i18n/tool-035-hormone-conversion.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-035-hormone-conversion';
type Analyte = 'testosterone' | 'estradiol';
type Unit = 'ng/dL' | 'nmol/L' | 'pg/mL' | 'pmol/L';
interface DraftInputs { analyte: Analyte; value: number; unit: Unit; measurementDate: string; readingSource: string }

export default function Tool035HormoneConversion() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem } = useToolDisplayPreferences();
  const [analyte, setAnalyte] = useState<Analyte>('testosterone');
  const [value, setValue] = useState(Number.NaN);
  const [unit, setUnit] = useState<Unit>('ng/dL');
  const [measurementDate, setMeasurementDate] = useState('');
  const [readingSource, setReadingSource] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDraftKey = useRef('');

  useEffect(() => {
    const draft = loadDraft<DraftInputs>(TOOL_SLUG);
    if (!draft) return;
    if (draft.inputs.analyte === 'testosterone' || draft.inputs.analyte === 'estradiol') setAnalyte(draft.inputs.analyte);
    if (typeof draft.inputs.value === 'number') setValue(draft.inputs.value);
    if (draft.inputs.unit) setUnit(draft.inputs.unit);
    if (draft.inputs.measurementDate) setMeasurementDate(draft.inputs.measurementDate);
    if (draft.inputs.readingSource) setReadingSource(draft.inputs.readingSource);
  }, []);

  const inputs = useMemo(() => ({
    analyte,
    value,
    unit,
    measurement_date: measurementDate,
    reading_source: readingSource,
  }), [analyte, value, unit, measurementDate, readingSource]);
  const parsed = useMemo(() => ConversionInputSchema.safeParse(inputs), [inputs]);
  const result = useMemo(() => parsed.success ? calculateHormoneConversion(parsed.data) : null, [parsed]);

  useEffect(() => { setValidationError(parsed.success ? null : parsed.error.issues[0]?.message ?? 'Invalid input'); }, [parsed]);
  useEffect(() => {
    const key = JSON.stringify(inputs) + locale + unitSystem;
    if (prevDraftKey.current === key) return;
    prevDraftKey.current = key;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      saveDraft(TOOL_SLUG, { analyte, value, unit, measurementDate, readingSource }, { locale, unitSystem, savedAt: new Date().toISOString() });
    }, AUTO_DRAFT_DEBOUNCE_MS);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [inputs, locale, unitSystem, analyte, value, unit, measurementDate, readingSource]);

  const changeAnalyte = (nextAnalyte: Analyte) => {
    setAnalyte(nextAnalyte);
    setUnit(nextAnalyte === 'testosterone' ? 'ng/dL' : 'pg/mL');
  };

  const handleSave = async () => {
    if (!parsed.success || !result) { setSaveStatus(t.save_invalid); return; }
    setIsSaving(true);
    setSaveStatus(t.saving);
    try {
      const now = new Date().toISOString();
      const output = buildConversionOutput(parsed.data, {
        locale,
        unitSystem,
        snapshotType: 'dashboard_projection',
        calculatedAt: now,
        recordedAt: `${parsed.data.measurement_date}T00:00:00.000Z`,
        timezone: 'UTC',
      });
      const { submitted, projection } = await commitDashboardSnapshot(output, parsed.data);
      if (submitted.ok && projection.ok) { clearDraft(TOOL_SLUG); setSaveStatus(t.saved); }
      else setSaveStatus(t.save_failed);
    } finally { setIsSaving(false); }
  };

  const availableUnits: Unit[] = analyte === 'testosterone' ? ['ng/dL', 'nmol/L'] : ['pg/mL', 'pmol/L'];

  return (
    <main className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
      </div>
      <p role="note" className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-5 text-amber-800 dark:text-amber-200">{t.scope_note}</p>
      <p className="mb-4 text-xs text-zinc-400">
        {t.sources}: {' '}
        <a className="underline" href="https://pubchem.ncbi.nlm.nih.gov/compound/testosterone" target="_blank" rel="noreferrer">PubChem — testosterone</a>
        {' · '}
        <a className="underline" href="https://pubchem.ncbi.nlm.nih.gov/compound/estradiol" target="_blank" rel="noreferrer">PubChem — estradiol</a>
        {' · '}
        <a className="underline" href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-8" target="_blank" rel="noreferrer">NIST SI Guide</a>
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
        <label className="text-xs font-bold text-zinc-500">{t.analyte}
          <select value={analyte} onChange={(event) => changeAnalyte(event.target.value as Analyte)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white">
            <option value="testosterone">{t.testosterone}</option>
            <option value="estradiol">{t.estradiol}</option>
          </select>
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.value}
          <input type="number" min={0} max={10_000_000} step="any" value={Number.isFinite(value) ? value : ''} onChange={(event) => setValue(event.target.value === '' ? Number.NaN : Number(event.target.value))} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono" dir="ltr" />
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.unit}
          <select value={unit} onChange={(event) => setUnit(event.target.value as Unit)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono" dir="ltr">
            {availableUnits.map((availableUnit) => <option key={availableUnit} value={availableUnit}>{availableUnit}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.measurement_date}
          <input type="date" value={measurementDate} onChange={(event) => setMeasurementDate(event.target.value)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono" dir="ltr" />
        </label>
        <label className="text-xs font-bold text-zinc-500 sm:col-span-2">{t.reading_source}
          <input value={readingSource} onChange={(event) => setReadingSource(event.target.value)} maxLength={200} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" />
          <span className="mt-1 block font-normal">{t.source_unverified}</span>
        </label>
      </div>
      {validationError && <p role="alert" className="mb-3 text-xs font-bold text-red-400">⚠ {validationError}</p>}
      {!result && <p role="status" className="mb-4 rounded-lg border border-zinc-700 p-3 text-sm text-zinc-400">{t.empty_state}</p>}
      {result && (
        <section aria-labelledby="tool-035-result" className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-5 mb-4">
          <h2 id="tool-035-result" className="mb-3 text-sm font-bold text-zinc-300">{t.result}</h2>
          <p className="text-2xl font-bold font-mono text-cyan-300" dir="ltr">{result.input_value} {result.input_unit} = {result.result_value} {result.result_unit}</p>
          <p className="mt-2 text-xs text-zinc-400">{t.method}: 1 molar mass-based conversion · {t.calculated_only}</p>
          <p className="mt-1 text-xs text-zinc-500">{t.measurement_date}: {result.measurement_date} · {t.reading_source}: <span dir="auto">{result.reading_source}</span></p>
          <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-3 border-t border-zinc-800 pt-3">
            <span className="text-xs text-zinc-500 font-mono" role="status">{saveStatus}</span>
            <button type="button" onClick={handleSave} disabled={isSaving || !parsed.success} className="w-full md:w-auto rounded-lg bg-lime-500 px-5 py-2 text-xs font-bold text-slate-950 transition hover:bg-lime-400 disabled:opacity-50">{isSaving ? t.saving : t.save}</button>
          </div>
        </section>
      )}
      <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition"><span>←</span><span>{isRtl ? `${t.previous}: ${neighbors.prevTool.titleAr}` : `${t.previous}: ${neighbors.prevTool.titleEn}`}</span></a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition"><span>{isRtl ? `${t.next}: ${neighbors.nextTool.titleAr}` : `${t.next}: ${neighbors.nextTool.titleEn}`}</span><span>→</span></a>
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </main>
  );
}
