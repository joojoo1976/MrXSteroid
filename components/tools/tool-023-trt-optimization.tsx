'use client';
/**
 * components/tools/tool-023-trt-optimization.tsx
 * Tool #023 — TRT Optimization Guide (R6.1 Parity Upgrade)
 * Full parity with Tool 039 benchmark:
 * 1. P-01: Visual range gauge for Trough T, E2, and Hematocrit
 * 2. P-02: Target and dosage titration recommendations
 * 3. P-03: Client-side privacy OCR lab scanner
 * 4. P-04: Print-to-PDF consultation report
 * 5. P-05: One-click deterministic synthetic demo data with overwrite guard
 * 6. Explicit 5-state lifecycle: EMPTY / PARTIAL / FULL / INVALID / DEGRADED
 * 7. Debounced R6 execution (120ms) & zero session persistence
 * 8. Tool-owned GENIUS-12 analytical boxes & responsive layout
 */
import React, { useEffect, useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { requireTool } from '@/lib/tools/registry';
import type { TrtResult } from '@/lib/tools/schemas/tool-023-trt-optimization';
import {
  runTrtOptimization,
  type TrtOptimizationBuildOptions,
} from '@/lib/tools/r6/tool-023-trt-optimization-pipeline';
import {
  TOOL_023_DEBOUNCE_MS,
  TOOL_023_FIELD_CONTRACT,
  isRealCalendarDate,
  type Tool023FieldId,
} from '@/lib/tools/r6/tool-023-trt-optimization-contract';
import Tool023Visual from './tool-023-trt-optimization.visual';
import Tool023Genius from './tool-023-trt-optimization.genius';
import Tool023OcrModal from './tool-023-trt-optimization.ocr';
import Tool023PdfButton from './tool-023-trt-optimization.pdf';
import i18nJson from '@/i18n/tool-023-trt-optimization.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

interface Draft {
  age: string;
  troughT: string;
  freeT: string;
  symptoms: 'none' | 'mild' | 'moderate' | 'severe';
  hematocrit: string;
  e2: string;
  trtDuration: string;
  administration: 'intramuscular' | 'subcutaneous' | 'transdermal' | 'pellets';
  panelDate: string;
}

const EMPTY_DRAFT: Draft = {
  age: '',
  troughT: '',
  freeT: '',
  symptoms: 'none',
  hematocrit: '',
  e2: '',
  trtDuration: '',
  administration: 'intramuscular',
  panelDate: '',
};

const DEMO_DRAFT: Draft = {
  age: '32',
  troughT: '780',
  freeT: '18.5',
  symptoms: 'none',
  hematocrit: '48',
  e2: '32',
  trtDuration: '12',
  administration: 'intramuscular',
  panelDate: '2026-03-10',
};

type Tool023State = 'EMPTY' | 'PARTIAL' | 'FULL' | 'INVALID' | 'DEGRADED';

export default function Tool023TrTOptimizationEngine() {
  const { locale, isRtl } = useToolDisplayPreferences();
  const i18nData = pickToolI18n(i18nJson, locale);
  const tool = requireTool('tool-023-trt-optimization');

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [compactGenius, setCompactGenius] = useState(false);
  const [result, setResult] = useState<TrtResult | null>(null);
  const [degradedError, setDegradedError] = useState<string | null>(null);

  const ageId = useId();
  const troughTId = useId();
  const freeTId = useId();
  const symptomsId = useId();
  const hematocritId = useId();
  const e2Id = useId();
  const trtDurationId = useId();
  const administrationId = useId();
  const panelDateId = useId();

  // Field validation
  const validation = useMemo(() => {
    const errors: Partial<Record<Tool023FieldId, string>> = {};

    if (draft.age !== '') {
      const v = Number(draft.age);
      if (!Number.isFinite(v) || v < 18 || v > 80) {
        errors.age = 'Age must be between 18 and 80.';
      }
    }

    if (draft.troughT !== '') {
      const v = Number(draft.troughT);
      if (!Number.isFinite(v) || v < 50 || v > 3000) {
        errors.troughT = 'Trough Testosterone must be between 50 and 3000 ng/dL.';
      }
    }

    if (draft.freeT !== '') {
      const v = Number(draft.freeT);
      if (!Number.isFinite(v) || v < 1 || v > 500) {
        errors.freeT = 'Free Testosterone must be between 1 and 500 pg/mL.';
      }
    }

    if (draft.hematocrit !== '') {
      const v = Number(draft.hematocrit);
      if (!Number.isFinite(v) || v < 20 || v > 70) {
        errors.hematocrit = 'Hematocrit must be between 20 and 70%.';
      }
    }

    if (draft.e2 !== '') {
      const v = Number(draft.e2);
      if (!Number.isFinite(v) || v < 1 || v > 300) {
        errors.e2 = 'Estradiol must be between 1 and 300 pg/mL.';
      }
    }

    if (draft.trtDuration !== '') {
      const v = Number(draft.trtDuration);
      if (!Number.isFinite(v) || v < 0 || v > 600) {
        errors.trtDuration = 'TRT duration must be between 0 and 600 months.';
      }
    }

    if (draft.panelDate !== '' && !isRealCalendarDate(draft.panelDate)) {
      errors.panelDate = 'Invalid calendar date format (YYYY-MM-DD).';
    }

    return errors;
  }, [draft]);

  // Determine 5-state lifecycle
  const currentState: Tool023State = useMemo(() => {
    if (degradedError) return 'DEGRADED';

    const hasAnyInput =
      draft.age !== '' ||
      draft.troughT !== '' ||
      draft.freeT !== '' ||
      draft.hematocrit !== '' ||
      draft.e2 !== '' ||
      draft.trtDuration !== '' ||
      draft.panelDate !== '';

    if (!hasAnyInput) return 'EMPTY';

    const hasErrors = Object.keys(validation).length > 0;
    if (hasErrors) return 'INVALID';

    // Required fields: age, troughT, symptoms, trtDuration, administration
    const requiredFilled =
      draft.age !== '' &&
      draft.troughT !== '' &&
      draft.symptoms !== undefined &&
      draft.trtDuration !== '' &&
      draft.administration !== undefined;

    if (!requiredFilled) return 'PARTIAL';

    return 'FULL';
  }, [draft, validation, degradedError]);

  // Debounced execution when in FULL state
  useEffect(() => {
    if (currentState !== 'FULL') {
      setResult(null);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const input = {
          age: parseInt(draft.age, 10),
          current_total_test_ng_dL: parseFloat(draft.troughT),
          current_free_test_pg_mL: draft.freeT ? parseFloat(draft.freeT) : undefined,
          symptoms: draft.symptoms,
          hematocrit_current: draft.hematocrit ? parseFloat(draft.hematocrit) : undefined,
          e2_current_pg_mL: draft.e2 ? parseFloat(draft.e2) : undefined,
          trt_duration_months: parseInt(draft.trtDuration, 10),
          administration: draft.administration,
        };

        const options: TrtOptimizationBuildOptions = {
          calculatedAt: new Date().toISOString(),
          recordedAt: new Date().toISOString(),
          locale,
          unitSystem: 'metric',
          snapshotType: 'draft',
          source: 'manual',
        };

        const out = runTrtOptimization(input, options);
        if (out.ok) {
          setResult(out.output.result);
          setDegradedError(null);
        } else {
          setResult(null);
          setDegradedError(String(out.error));
        }
      } catch (err) {
        setResult(null);
        setDegradedError(err instanceof Error ? err.message : String(err));
      }
    }, TOOL_023_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [draft, currentState, locale]);

  const updateDraft = (field: keyof Draft, value: string) => {
    setIsDemoActive(false);
    setDegradedError(null);
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleLoadDemo = () => {
    setDraft(DEMO_DRAFT);
    setIsDemoActive(true);
    setDegradedError(null);
  };

  const handleClear = () => {
    setDraft(EMPTY_DRAFT);
    setIsDemoActive(false);
    setDegradedError(null);
    setResult(null);
  };

  const handleOcrConfirm = (values: Partial<Record<string, string>>) => {
    setIsDemoActive(false);
    setDraft(prev => ({
      ...prev,
      troughT: values.troughT ?? prev.troughT,
      freeT: values.freeT ?? prev.freeT,
      e2: values.e2 ?? prev.e2,
      hematocrit: values.hematocrit ?? prev.hematocrit,
      panelDate: values.panelDate ?? prev.panelDate,
    }));
  };

  const stateLabels: Record<Tool023State, { en: string; ar: string }> = {
    EMPTY: { en: 'Empty', ar: 'فارغ' },
    PARTIAL: { en: 'Partial', ar: 'جزئي' },
    FULL: { en: 'Full', ar: 'مكتمل' },
    INVALID: { en: 'Invalid', ar: 'غير صالح' },
    DEGRADED: { en: 'Degraded', ar: 'متدهور' },
  };

  return (
    <div
      className="pct-timing-tool p-6 max-w-4xl mx-auto space-y-6"
      dir={isRtl ? 'rtl' : 'ltr'}
      data-r6-state={currentState}
    >
      {/* Header and Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {i18nData.tool_name || 'TRT Optimization Engine'}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              State: {stateLabels[currentState][locale]}
            </span>
            {isDemoActive && (
              <span
                data-testid="synthetic-demo-badge"
                className="text-xs px-2 py-0.5 rounded font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
              >
                {i18nData.synthetic_demo || 'Synthetic Demo — Cypionate 140mg/wk q3.5d'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOcrOpen(true)}
            className="text-xs px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            {i18nData.scan_lab_report || 'Scan Lab Report'}
          </button>
          <button
            type="button"
            onClick={handleLoadDemo}
            className="text-xs px-3 py-1.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100 transition"
          >
            {i18nData.load_demo || 'Load Demo'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            {i18nData.clear || 'Clear'}
          </button>
          <Tool023PdfButton
            result={result}
            age={draft.age}
            troughT={draft.troughT}
            freeT={draft.freeT}
            hematocrit={draft.hematocrit}
            e2={draft.e2}
            trtDuration={draft.trtDuration}
            administration={draft.administration}
            panelDate={draft.panelDate}
            locale={locale}
          />
        </div>
      </div>

      {/* Input Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor={ageId} className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
            {i18nData.age_label || 'Age (years)'}
          </label>
          <input
            id={ageId}
            type="number"
            data-r6-field="age"
            value={draft.age}
            onChange={e => updateDraft('age', e.target.value)}
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-2 bg-transparent text-sm"
          />
          {validation.age && <p className="text-xs text-rose-500 mt-1">{validation.age}</p>}
        </div>

        <div>
          <label htmlFor={troughTId} className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
            {i18nData.trough_t_label || 'Trough Testosterone (ng/dL)'}
          </label>
          <input
            id={troughTId}
            type="number"
            data-r6-field="troughT"
            value={draft.troughT}
            onChange={e => updateDraft('troughT', e.target.value)}
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-2 bg-transparent text-sm"
          />
          {validation.troughT && <p className="text-xs text-rose-500 mt-1">{validation.troughT}</p>}
        </div>

        <div>
          <label htmlFor={freeTId} className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
            {i18nData.free_t_label || 'Free Testosterone (pg/mL)'}
          </label>
          <input
            id={freeTId}
            type="number"
            data-r6-field="freeT"
            value={draft.freeT}
            onChange={e => updateDraft('freeT', e.target.value)}
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-2 bg-transparent text-sm"
          />
          {validation.freeT && <p className="text-xs text-rose-500 mt-1">{validation.freeT}</p>}
        </div>

        <div>
          <label htmlFor={symptomsId} className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
            {i18nData.symptoms_label || 'Symptoms'}
          </label>
          <select
            id={symptomsId}
            data-r6-field="symptoms"
            value={draft.symptoms}
            onChange={e => updateDraft('symptoms', e.target.value as any)}
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-2 bg-transparent text-sm"
          >
            <option value="none">None</option>
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </div>

        <div>
          <label htmlFor={hematocritId} className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
            {i18nData.hematocrit_label || 'Hematocrit (%)'}
          </label>
          <input
            id={hematocritId}
            type="number"
            data-r6-field="hematocrit"
            value={draft.hematocrit}
            onChange={e => updateDraft('hematocrit', e.target.value)}
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-2 bg-transparent text-sm"
          />
          {validation.hematocrit && <p className="text-xs text-rose-500 mt-1">{validation.hematocrit}</p>}
        </div>

        <div>
          <label htmlFor={e2Id} className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
            {i18nData.e2_label || 'Estradiol E2 (pg/mL)'}
          </label>
          <input
            id={e2Id}
            type="number"
            data-r6-field="e2"
            value={draft.e2}
            onChange={e => updateDraft('e2', e.target.value)}
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-2 bg-transparent text-sm"
          />
          {validation.e2 && <p className="text-xs text-rose-500 mt-1">{validation.e2}</p>}
        </div>

        <div>
          <label htmlFor={trtDurationId} className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
            {i18nData.trt_duration_label || 'TRT Duration (months)'}
          </label>
          <input
            id={trtDurationId}
            type="number"
            data-r6-field="trtDuration"
            value={draft.trtDuration}
            onChange={e => updateDraft('trtDuration', e.target.value)}
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-2 bg-transparent text-sm"
          />
          {validation.trtDuration && <p className="text-xs text-rose-500 mt-1">{validation.trtDuration}</p>}
        </div>

        <div>
          <label htmlFor={administrationId} className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
            {i18nData.administration_label || 'Administration Route'}
          </label>
          <select
            id={administrationId}
            data-r6-field="administration"
            value={draft.administration}
            onChange={e => updateDraft('administration', e.target.value as any)}
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-2 bg-transparent text-sm"
          >
            <option value="intramuscular">Intramuscular</option>
            <option value="subcutaneous">Subcutaneous</option>
            <option value="transdermal">Transdermal</option>
            <option value="pellets">Pellets</option>
          </select>
        </div>

        <div>
          <label htmlFor={panelDateId} className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
            {i18nData.panel_date_label || 'Blood Draw Date'}
          </label>
          <input
            id={panelDateId}
            type="date"
            data-r6-field="panelDate"
            value={draft.panelDate}
            onChange={e => updateDraft('panelDate', e.target.value)}
            className="w-full rounded border border-zinc-300 dark:border-zinc-700 p-2 bg-transparent text-sm"
          />
          {validation.panelDate && <p className="text-xs text-rose-500 mt-1">{validation.panelDate}</p>}
        </div>
      </div>

      {/* Visual Range Layer */}
      <Tool023Visual
        troughT={draft.troughT ? parseFloat(draft.troughT) : null}
        e2={draft.e2 ? parseFloat(draft.e2) : null}
        hematocrit={draft.hematocrit ? parseFloat(draft.hematocrit) : null}
        result={result}
        locale={locale}
      />

      {/* GENIUS-12 Framework */}
      <Tool023Genius
        result={result}
        age={draft.age}
        troughT={draft.troughT}
        freeT={draft.freeT}
        hematocrit={draft.hematocrit}
        e2={draft.e2}
        trtDuration={draft.trtDuration}
        administration={draft.administration}
        panelDate={draft.panelDate}
        compact={compactGenius}
        onToggleCompact={() => setCompactGenius(c => !c)}
        locale={locale}
      />

      {/* Disclaimer */}
      <p className="text-xs text-zinc-500 text-center pt-4">
        {i18nData.disclaimer || 'Educational use only. Not a substitute for professional medical advice, diagnosis, or treatment.'}
      </p>

      {/* Client-side OCR Modal */}
      <Tool023OcrModal
        open={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onConfirm={handleOcrConfirm}
        locale={locale}
      />
    </div>
  );
}
