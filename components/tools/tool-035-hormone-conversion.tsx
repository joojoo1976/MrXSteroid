'use client';
/**
 * components/tools/tool-035-hormone-conversion.tsx
 * Tool #035 — Sourced testosterone and estradiol lab-unit converter.
 * Upgraded to full Tool 039 parity (P-01 visual, P-03 OCR, P-04 PDF, P-05 Demo, GENIUS-12)
 * while preserving strict DOM backwards-compatibility for existing tests.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { calculateHormoneConversion } from '@/lib/tools/engines/tool-035-hormone-conversion';
import { buildConversionOutput } from '@/lib/tools/adapters/tool-035-hormone-conversion';
import { AUTO_DRAFT_DEBOUNCE_MS, clearDraft, commitDashboardSnapshot, loadDraft, saveDraft } from '@/lib/tools/adapters/toolLogAdapter';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import { ConversionInputSchema } from '@/lib/tools/schemas/tool-035-hormone-conversion';
import i18nJson from '@/i18n/tool-035-hormone-conversion.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

import Tool035Visual from './tool-035-hormone-conversion.visual';
import Tool035Genius from './tool-035-hormone-conversion.genius';
import Tool035OcrModal from './tool-035-hormone-conversion.ocr';
import Tool035PdfButton from './tool-035-hormone-conversion.pdf';

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

  // Parity states
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [compactGenius, setCompactGenius] = useState(false);

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

  // Lifecycle state
  const lifecycleState = useMemo(() => {
    if (!Number.isFinite(value) && !measurementDate && !readingSource) return 'EMPTY';
    if (!parsed.success) {
      if (Number.isFinite(value) && measurementDate && readingSource.trim().length >= 3) return 'INVALID';
      return 'PARTIAL';
    }
    return 'FULL';
  }, [value, measurementDate, readingSource, parsed]);

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
    setIsDemoActive(false);
    setAnalyte(nextAnalyte);
    setUnit(nextAnalyte === 'testosterone' ? 'ng/dL' : 'pg/mL');
  };

  const handleLoadDemo = () => {
    setAnalyte('testosterone');
    setValue(900);
    setUnit('ng/dL');
    setMeasurementDate('2026-03-10');
    setReadingSource('Quest Diagnostics');
    setIsDemoActive(true);
  };

  const handleClear = () => {
    setAnalyte('testosterone');
    setValue(Number.NaN);
    setUnit('ng/dL');
    setMeasurementDate('');
    setReadingSource('');
    setIsDemoActive(false);
    clearDraft(TOOL_SLUG);
  };

  const handleOcrConfirm = (ocr: { analyte?: 'testosterone' | 'estradiol'; value?: string; unit?: string; measurementDate?: string; readingSource?: string }) => {
    setIsDemoActive(false);
    if (ocr.analyte) setAnalyte(ocr.analyte);
    if (ocr.value && !isNaN(Number(ocr.value))) setValue(Number(ocr.value));
    if (ocr.unit && (ocr.unit === 'ng/dL' || ocr.unit === 'nmol/L' || ocr.unit === 'pg/mL' || ocr.unit === 'pmol/L')) setUnit(ocr.unit as Unit);
    if (ocr.measurementDate) setMeasurementDate(ocr.measurementDate);
    if (ocr.readingSource) setReadingSource(ocr.readingSource);
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
    <main className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'} data-r6-state={lifecycleState}>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{t.tool_name}</h1>
          <p className="mt-1 text-xs text-zinc-400 max-w-2xl">{t.scope_note}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-zinc-800 text-zinc-300">
              State: {lifecycleState}
            </span>
            {isDemoActive && (
              <span
                data-testid="synthetic-demo-badge"
                className="text-[11px] px-2 py-0.5 rounded font-medium bg-purple-950/60 text-purple-300 border border-purple-800"
              >
                Synthetic Demo — T 900 ng/dL
              </span>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOcrOpen(true)}
            className="text-xs px-3 py-1.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
          >
            Scan Lab Report
          </button>
          <button
            type="button"
            onClick={handleLoadDemo}
            className="text-xs px-3 py-1.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700 hover:bg-blue-800 transition"
          >
            Load Demo
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs px-3 py-1.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
          >
            Clear
          </button>
          <Tool035PdfButton
            result={result}
            analyte={analyte}
            value={Number.isFinite(value) ? String(value) : ''}
            unit={unit}
            measurementDate={measurementDate}
            readingSource={readingSource}
            locale={locale}
          />
        </div>
      </header>

      <p className="mb-4 text-xs text-zinc-400">
        {t.sources}:{' '}
        <a className="underline" href="https://pubchem.ncbi.nlm.nih.gov/compound/testosterone" target="_blank" rel="noreferrer">PubChem — testosterone</a>
        {' · '}
        <a className="underline" href="https://pubchem.ncbi.nlm.nih.gov/compound/estradiol" target="_blank" rel="noreferrer">PubChem — estradiol</a>
        {' · '}
        <a className="underline" href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-8" target="_blank" rel="noreferrer">NIST SI Guide</a>
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
        <label className="text-xs font-bold text-zinc-500">{t.analyte}
          <select
            data-r6-field="analyte"
            value={analyte}
            onChange={(event) => changeAnalyte(event.target.value as Analyte)}
            className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white"
          >
            <option value="testosterone">{t.testosterone}</option>
            <option value="estradiol">{t.estradiol}</option>
          </select>
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.value}
          <input
            type="number"
            data-r6-field="value"
            min={0}
            max={10_000_000}
            step="any"
            value={Number.isFinite(value) ? value : ''}
            onChange={(event) => {
              setIsDemoActive(false);
              setValue(event.target.value === '' ? Number.NaN : Number(event.target.value));
            }}
            className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono"
            dir="ltr"
          />
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.unit}
          <select
            data-r6-field="unit"
            value={unit}
            onChange={(event) => {
              setIsDemoActive(false);
              setUnit(event.target.value as Unit);
            }}
            className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono"
            dir="ltr"
          >
            {availableUnits.map((availableUnit) => <option key={availableUnit} value={availableUnit}>{availableUnit}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold text-zinc-500">{t.measurement_date}
          <input
            type="date"
            data-r6-field="measurementDate"
            value={measurementDate}
            onChange={(event) => {
              setIsDemoActive(false);
              setMeasurementDate(event.target.value);
            }}
            className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white font-mono"
            dir="ltr"
          />
        </label>
        <label className="text-xs font-bold text-zinc-500 sm:col-span-2">{t.reading_source}
          <input
            data-r6-field="readingSource"
            value={readingSource}
            onChange={(event) => {
              setIsDemoActive(false);
              setReadingSource(event.target.value);
            }}
            maxLength={200}
            className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white"
          />
          <span className="mt-1 block font-normal">{t.source_unverified}</span>
        </label>
      </div>

      {validationError && <p role="alert" className="mb-3 text-xs font-bold text-red-400">⚠️ {validationError}</p>}
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

      {/* P-01 Visual Range Layer */}
      <Tool035Visual
        analyte={analyte}
        inputValue={Number.isFinite(value) ? value : null}
        inputUnit={unit}
        result={result}
        locale={locale}
      />

      {/* GENIUS-12 Framework */}
      <Tool035Genius
        result={result}
        analyte={analyte}
        value={Number.isFinite(value) ? String(value) : ''}
        unit={unit}
        measurementDate={measurementDate}
        readingSource={readingSource}
        compact={compactGenius}
        onToggleCompact={() => setCompactGenius(c => !c)}
        locale={locale}
      />

      <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition"><span>← </span><span>{isRtl ? `${t.previous}: ${neighbors.prevTool.titleAr}` : `${t.previous}: ${neighbors.prevTool.titleEn}`}</span></a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="flex items-center gap-2 text-zinc-400 hover:text-lime-400 transition"><span>{isRtl ? `${t.next}: ${neighbors.nextTool.titleAr}` : `${t.next}: ${neighbors.nextTool.titleEn}`}</span><span>→</span></a>
      </div>
      <p className="mt-2 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>

      {/* OCR Modal */}
      <Tool035OcrModal
        open={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onConfirm={handleOcrConfirm}
        locale={locale}
      />
    </main>
  );
}
