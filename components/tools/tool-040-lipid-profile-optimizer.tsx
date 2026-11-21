'use client';
/**
 * Tool #040 — Lipid Profile Optimizer (R6.1 tool).
 *
 * What this component does, and what it deliberately does NOT do:
 *   - every calculation goes through the R6 pipeline
 *     (`runLipidProfileOptimizer`), which validates the input and calls the
 *     authoritative V6 engine (`optimizeLipidProfile`) — the UI never calls
 *     the engine or the legacy adapter directly;
 *   - the result is DEBOUNCED (120 ms): a burst of edits triggers ONE
 *     calculation, and the result of an older input is never shown as if it
 *     were the current one;
 *   - the states EMPTY / PARTIAL / FULL / INVALID / DEGRADED are explicit, and
 *     NOTHING is invented: an empty field stays empty (a typed 0 is a real 0);
 *   - there is NO persistence of any kind: no draft, no dashboard snapshot, no
 *     session, no cloud storage. The owner's D-08 exception was limited to
 *     Tool 039, so this tool stays compute-and-display only (W18).
 *
 * Units are fixed to mg/dL — the unit the engine's bands assume. No
 * conversion is applied.
 */
import React, { useEffect, useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import type { ToolOutput } from '@/lib/tools/contracts';
import type { LipidOptimizerInput, LipidOptimizerResult } from '@/lib/tools/schemas/tool-040-lipid-profile-optimizer';
import {
  runLipidProfileOptimizer,
  type LipidProfileOptimizerBuildOptions,
} from '@/lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline';
import {
  TOOL_040_DEBOUNCE_MS,
  TOOL_040_FIELD_CONTRACT,
  TOOL_040_LIPID_UNIT,
  TOOL_040_SOURCES,
  isRealCalendarDate,
  labFreshness,
  type Tool040FieldId,
} from '@/lib/tools/r6/tool-040-lipid-profile-optimizer-contract';
import Tool040Genius from './tool-040-lipid-profile-optimizer.genius';
import Tool040Visual from './tool-040-lipid-profile-optimizer.visual';
import Tool040OcrModal from './tool-040-lipid-profile-optimizer.ocr';
import LipidSummaryPdfButton from './tool-040-lipid-profile-optimizer.pdf';
import i18nJson from '@/i18n/tool-040-lipid-profile-optimizer.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-040-lipid-profile-optimizer';

type Answer = 'yes' | 'no' | 'unanswered';

interface Draft {
  ldl: string;
  hdl: string;
  tg: string;
  total: string;
  date: string;
  age: string;
  smoker: Answer;
  sbp: string;
  onCycle: Answer;
  weeks: string;
}

/** Nothing is pre-filled: every field starts empty, so no value is invented. */
const EMPTY_DRAFT: Draft = {
  ldl: '',
  hdl: '',
  tg: '',
  total: '',
  date: '',
  age: '',
  smoker: 'unanswered',
  sbp: '',
  onCycle: 'unanswered',
  weeks: '',
};

/** Deterministic synthetic demo panel fulfilling P-05 criteria */
const DEMO_DRAFT: Draft = {
  ldl: '148',
  hdl: '32',
  tg: '180',
  total: '216',
  date: '2026-03-10',
  age: '34',
  smoker: 'no',
  sbp: '128',
  onCycle: 'yes',
  weeks: '8',
};

type UiState = 'EMPTY' | 'PARTIAL' | 'FULL' | 'INVALID' | 'DEGRADED';
type IssueCode = 'invalid_number' | 'invalid_date' | 'out_of_range';

interface Issue {
  field: Tool040FieldId;
  code: IssueCode;
}

const CONTRACT_FIELD = (id: Tool040FieldId) =>
  TOOL_040_FIELD_CONTRACT.find((field) => field.fieldId === id);

// The real-calendar-date check lives in the R6.1 contract, so the field
// validation and the freshness rule can never disagree about a date.

export default function Tool040LipidProfileOptimizer() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const isRtl = locale === 'ar';
  const inputGroupId = useId();

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [pipeline, setPipeline] = useState<{ signature: string; state: 'idle' | 'ok' | 'error' }>({
    signature: '',
    state: 'idle',
  });

  const options = useMemo<LipidProfileOptimizerBuildOptions>(
    () => ({
      calculatedAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
      locale,
      unitSystem: 'metric',
      snapshotType: 'submitted_snapshot',
      timezone: 'UTC',
      source: 'manual',
    }),
    [locale],
  );

  /* ── Validation: every field against the R6.1 contract ────────────────── */
  const validation = useMemo(() => {
    const issues: Issue[] = [];
    const numeric: Partial<Record<Tool040FieldId, number>> = {};

    const checkNumber = (fieldId: Tool040FieldId, raw: string, required: boolean) => {
      const contract = CONTRACT_FIELD(fieldId);
      const trimmed = raw.trim();
      if (trimmed === '') {
        // An empty field is "not answered yet" (PARTIAL), never "invalid".
        void required;
        return;
      }
      const value = Number(trimmed);
      if (!Number.isFinite(value)) {
        issues.push({ field: fieldId, code: 'invalid_number' });
        return;
      }
      if (contract?.min !== null && contract?.max !== null && contract?.min !== undefined && contract?.max !== undefined) {
        if (value < contract.min || value > contract.max) {
          issues.push({ field: fieldId, code: 'out_of_range' });
          return;
        }
      }
      numeric[fieldId] = value;
    };

    checkNumber('ldl_mg_dl', draft.ldl, true);
    checkNumber('hdl_mg_dl', draft.hdl, true);
    checkNumber('triglycerides_mg_dl', draft.tg, true);
    checkNumber('total_cholesterol_mg_dl', draft.total, false);
    checkNumber('age', draft.age, true);
    checkNumber('systolic_bp', draft.sbp, true);
    checkNumber('weeks_remaining', draft.weeks, true);

    // The date: empty means "not answered yet" (PARTIAL); a wrong value is INVALID.
    if (draft.date.trim() !== '' && !isRealCalendarDate(draft.date.trim())) {
      issues.push({ field: 'panel_date', code: 'invalid_date' });
    }

    // The two yes/no answers: unanswered means "not answered yet" (PARTIAL).

    const filled =
      draft.ldl.trim() !== '' ||
      draft.hdl.trim() !== '' ||
      draft.tg.trim() !== '' ||
      draft.total.trim() !== '' ||
      draft.date.trim() !== '' ||
      draft.age.trim() !== '' ||
      draft.sbp.trim() !== '' ||
      draft.weeks.trim() !== '' ||
      draft.smoker !== 'unanswered' ||
      draft.onCycle !== 'unanswered';

    const complete =
      draft.ldl.trim() !== '' &&
      draft.hdl.trim() !== '' &&
      draft.tg.trim() !== '' &&
      draft.date.trim() !== '' &&
      draft.age.trim() !== '' &&
      draft.sbp.trim() !== '' &&
      draft.weeks.trim() !== '' &&
      draft.smoker !== 'unanswered' &&
      draft.onCycle !== 'unanswered';

    return { issues, numeric, filled, complete };
  }, [draft]);

  const hasIssues = validation.issues.length > 0;

  /** The engine input is built ONLY when every required field is valid. */
  const engineInput = useMemo<LipidOptimizerInput | null>(() => {
    if (!validation.complete || hasIssues) return null;
    const panel: LipidOptimizerInput['panel'] = {
      ldl_mg_dl: validation.numeric.ldl_mg_dl as number,
      hdl_mg_dl: validation.numeric.hdl_mg_dl as number,
      triglycerides_mg_dl: validation.numeric.triglycerides_mg_dl as number,
      ...(validation.numeric.total_cholesterol_mg_dl === undefined
        ? {}
        : { total_cholesterol_mg_dl: validation.numeric.total_cholesterol_mg_dl }),
    };
    return {
      panel,
      age: validation.numeric.age as number,
      smoker: draft.smoker === 'yes',
      systolic_bp: validation.numeric.systolic_bp as number,
      on_cycle: draft.onCycle === 'yes',
      weeks_remaining: validation.numeric.weeks_remaining as number,
    };
  }, [validation, hasIssues, draft.smoker, draft.onCycle]);

  const inputSignature = useMemo(() => (engineInput ? JSON.stringify(engineInput) : ''), [engineInput]);

  /* ── The debounced pipeline ────────────────────────────────────────────── */
  useEffect(() => {
    if (!engineInput || inputSignature === '') return;
    const timer = setTimeout(() => {
      const outcome = runLipidProfileOptimizer(engineInput, options);
      setPipeline({
        signature: inputSignature,
        state: outcome.ok ? 'ok' : 'error',
      });
    }, TOOL_040_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [engineInput, inputSignature, options]);

  /** The pipeline state that belongs to the CURRENT input (never a stale one). */
  const currentState = useMemo(() => {
    if (inputSignature === '' || pipeline.signature !== inputSignature) return 'idle' as const;
    return pipeline.state;
  }, [pipeline, inputSignature]);

  const output = useMemo<ToolOutput<LipidOptimizerResult> | null>(() => {
    if (currentState !== 'ok' || !engineInput) return null;
    const outcome = runLipidProfileOptimizer(engineInput, options);
    return outcome.ok ? outcome.output : null;
  }, [currentState, engineInput, options]);

  const resultStatus = useMemo<UiState>(() => {
    if (!validation.filled) return 'EMPTY';
    // A value that is already wrong is reported straight away (Tool 039 order).
    if (hasIssues) return 'INVALID';
    if (!validation.complete) return 'PARTIAL';
    if (currentState === 'error') return 'DEGRADED';
    return 'FULL';
  }, [validation.filled, validation.complete, hasIssues, currentState]);

  const input = engineInput;
  const result = output?.result ?? null;

  const stateLabel: Record<UiState, string> = {
    EMPTY: t.state_empty,
    PARTIAL: t.state_partial,
    FULL: t.state_full,
    INVALID: t.state_invalid,
    DEGRADED: t.state_degraded,
  };

  const issueFor = (field: Tool040FieldId): Issue | undefined =>
    validation.issues.find((issue) => issue.field === field);

  const issueMessage = (issue: Issue): string => {
    if (issue.code === 'invalid_number') return t.invalid_number;
    if (issue.code === 'invalid_date') return t.invalid_date;
    return t.out_of_range;
  };

  const freshness = useMemo(() => {
    const date = draft.date.trim();
    if (!date || !isRealCalendarDate(date)) return { ageDays: null, stale: false };
    return labFreshness(date, options.calculatedAt.slice(0, 10));
  }, [draft.date, options.calculatedAt]);

  const updateDraft = (updater: (prev: Draft) => Draft) => {
    setDraft(updater);
    setIsDemoActive(false);
  };

  const handleLoadDemo = () => {
    if (validation.filled && !isDemoActive) {
      if (typeof window !== 'undefined' && !window.confirm(t.demo_confirm_overwrite || 'Replace current inputs with synthetic demo data?')) {
        return;
      }
    }
    setDraft(DEMO_DRAFT);
    setIsDemoActive(true);
  };

  const handleClearDemo = () => {
    setDraft(EMPTY_DRAFT);
    setIsDemoActive(false);
  };

  const handleOcrConfirm = (extracted: { ldl?: number; hdl?: number; tg?: number; total?: number; date?: string }) => {
    setDraft((prev) => ({
      ...prev,
      ...(extracted.ldl !== undefined ? { ldl: String(extracted.ldl) } : {}),
      ...(extracted.hdl !== undefined ? { hdl: String(extracted.hdl) } : {}),
      ...(extracted.tg !== undefined ? { tg: String(extracted.tg) } : {}),
      ...(extracted.total !== undefined ? { total: String(extracted.total) } : {}),
      ...(extracted.date ? { date: extracted.date } : {}),
    }));
    setIsDemoActive(false);
    setIsOcrOpen(false);
  };

  const numberField = (
    fieldId: Tool040FieldId,
    value: string,
    onChange: (next: string) => void,
    type: 'text' | 'number' = 'text',
  ) => {
    const contract = CONTRACT_FIELD(fieldId);
    const issue = issueFor(fieldId);
    const label = contract ? t[contract.labelKey] : fieldId;
    const help = contract ? t[contract.helpKey] : '';
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
        <label htmlFor={`${inputGroupId}-${fieldId}`} className="mb-1 block text-xs font-bold text-zinc-500">
          {label}
          {contract?.unit ? ` (${contract.unit})` : ''}
        </label>
        <input
          id={`${inputGroupId}-${fieldId}`}
          data-r6-slider="true"
          data-r6-field={fieldId}
          type={type}
          inputMode="decimal"
          dir="ltr"
          min={contract?.min ?? undefined}
          max={contract?.max ?? undefined}
          step={contract?.type === 'integer' ? 1 : 'any'}
          aria-label={label}
          aria-invalid={Boolean(issue)}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={contract?.example ?? ''}
          className={`w-full rounded-lg border bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white ${issue ? 'border-red-500' : 'border-zinc-700'}`}
        />
        <span className="mt-1 block text-[10px] text-zinc-600">{help}</span>
        {issue && (
          <span className="mt-1 block text-[10px] font-bold text-red-400" data-r6-field-error={fieldId}>
            {issueMessage(issue)}
          </span>
        )}
      </div>
    );
  };

  const answerGroup = (
    fieldId: Tool040FieldId,
    value: Answer,
    onChange: (next: Answer) => void,
  ) => {
    const contract = CONTRACT_FIELD(fieldId);
    const label = contract ? t[contract.labelKey] : fieldId;
    const help = contract ? t[contract.helpKey] : '';
    const options: Array<{ key: Answer; label: string }> = [
      { key: 'yes', label: t.yes },
      { key: 'no', label: t.no },
      { key: 'unanswered', label: t.unanswered },
    ];
    return (
      <div role="group" aria-label={label} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
        <span className="mb-1 block text-xs font-bold text-zinc-500">{label}</span>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              data-r6-field={fieldId}
              aria-pressed={value === option.key}
              onClick={() => onChange(option.key)}
              className={`rounded border px-3 py-1 text-xs font-bold transition ${
                value === option.key
                  ? option.key === 'yes'
                    ? 'border-lime-500 bg-lime-500/20 text-lime-300'
                    : option.key === 'no'
                      ? 'border-red-500 bg-red-500/20 text-red-300'
                      : 'border-zinc-500 bg-zinc-700 text-zinc-200'
                  : 'border-zinc-700 bg-zinc-950 text-zinc-500'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="mt-2 block text-[10px] text-zinc-600">{help}</span>
      </div>
    );
  };

  const statusMessage = (): string => {
    if (resultStatus === 'EMPTY') return t.empty_state;
    if (resultStatus === 'PARTIAL') return t.partial_state;
    if (resultStatus === 'INVALID') return `${t.invalid_state} — ${t.invalid_input}`;
    if (resultStatus === 'DEGRADED') return t.degraded_state;
    return '';
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-[10px] font-bold text-zinc-400">
          {t.state_label}: {stateLabel[resultStatus]}
        </span>
      </div>

      <p className="mb-4 rounded-xl border border-amber-700/50 bg-amber-950/30 p-3 text-xs leading-6 text-amber-100">
        {t.disclaimer}
      </p>

      {/* Action Toolbar: P-03 OCR Scan + P-05 One-Click Demo Data */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOcrOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-800/60 bg-cyan-950/30 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-900/50 hover:text-cyan-200"
          >
            <span>📷</span>
            <span>{t.scan_report_btn || 'Scan Lab Report'}</span>
          </button>

          {!isDemoActive ? (
            <button
              type="button"
              onClick={handleLoadDemo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-800/60 bg-purple-950/30 px-3 py-1.5 text-xs font-semibold text-purple-300 transition hover:bg-purple-900/50 hover:text-purple-200"
            >
              <span>⚡</span>
              <span>{t.demo_load_btn || 'Load Demo Data'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClearDemo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-800/60 bg-red-950/30 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-900/50 hover:text-red-200"
            >
              <span>✕</span>
              <span>{t.demo_clear_btn || 'Clear Demo'}</span>
            </button>
          )}
        </div>

        {isDemoActive && (
          <span
            data-testid="synthetic-demo-badge"
            className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300"
          >
            ⚡ {t.demo_synthetic_badge || 'Synthetic Demo Data'}
          </span>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-bold text-zinc-300">{t.panel_section}</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {numberField('ldl_mg_dl', draft.ldl, (next) => updateDraft((prev) => ({ ...prev, ldl: next })))}
          {numberField('hdl_mg_dl', draft.hdl, (next) => updateDraft((prev) => ({ ...prev, hdl: next })))}
          {numberField('triglycerides_mg_dl', draft.tg, (next) => updateDraft((prev) => ({ ...prev, tg: next })))}
          {numberField('total_cholesterol_mg_dl', draft.total, (next) => updateDraft((prev) => ({ ...prev, total: next })))}
          {numberField('age', draft.age, (next) => updateDraft((prev) => ({ ...prev, age: next })))}
          {numberField('systolic_bp', draft.sbp, (next) => updateDraft((prev) => ({ ...prev, sbp: next })))}
          {numberField('weeks_remaining', draft.weeks, (next) => updateDraft((prev) => ({ ...prev, weeks: next })))}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <label htmlFor={`${inputGroupId}-panel_date`} className="mb-1 block text-xs font-bold text-zinc-500">
              {t.field_panel_date}
            </label>
            <input
              id={`${inputGroupId}-panel_date`}
              data-r6-field="panel_date"
              type="text"
              inputMode="numeric"
              dir="ltr"
              aria-label={t.field_panel_date}
              aria-invalid={Boolean(issueFor('panel_date'))}
              value={draft.date}
              onChange={(event) => updateDraft((prev) => ({ ...prev, date: event.target.value }))}
              placeholder="2026-02-01"
              className={`w-full rounded-lg border bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white ${issueFor('panel_date') ? 'border-red-500' : 'border-zinc-700'}`}
            />
            <span className="mt-1 block text-[10px] text-zinc-600">{t.help_panel_date}</span>
            {issueFor('panel_date') && (
              <span className="mt-1 block text-[10px] font-bold text-red-400" data-r6-field-error="panel_date">
                {issueMessage(issueFor('panel_date') as Issue)}
              </span>
            )}
          </div>
        </div>

        <h2 className="text-sm font-bold text-zinc-300">{t.context_section}</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {answerGroup('smoker', draft.smoker, (next) => updateDraft((prev) => ({ ...prev, smoker: next })))}
          {answerGroup('on_cycle', draft.onCycle, (next) => updateDraft((prev) => ({ ...prev, onCycle: next })))}
        </div>

        <div
          role={resultStatus === 'INVALID' ? 'alert' : 'status'}
          aria-live="polite"
          className={`rounded-xl border p-4 ${
            resultStatus === 'INVALID'
              ? 'border-red-700 bg-red-950/40'
              : resultStatus === 'FULL'
                ? 'border-emerald-800 bg-emerald-950/30'
                : 'border-zinc-800 bg-zinc-900/70'
          }`}
          data-r6-state={resultStatus}
        >
          <p className="font-semibold">{stateLabel[resultStatus]}</p>
          {statusMessage() && <p className="mt-1 text-xs">{statusMessage()}</p>}
          {freshness.ageDays !== null && (
            <p className="mt-1 text-[11px] text-zinc-400">
              {t.freshness_label}:{' '}
              <span className={freshness.stale ? 'font-bold text-amber-300' : 'font-bold text-lime-300'}>
                {freshness.stale ? t.freshness_stale : t.freshness_current}
              </span>{' '}
              ({freshness.ageDays} {t.days_old})
            </p>
          )}
        </div>

        {resultStatus === 'FULL' && !output && (
          <p role="status" className="text-xs font-bold text-zinc-400">
            {t.state_partial}
          </p>
        )}

        {output && result && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
                <span className="rounded-full border border-lime-700/50 bg-lime-950/40 px-2 py-0.5 font-bold text-lime-300">
                  ✓ {t.state_full}
                </span>
                <span>{t.field_ldl}: {input?.panel.ldl_mg_dl} {TOOL_040_LIPID_UNIT}</span>
                <span>{t.field_hdl}: {input?.panel.hdl_mg_dl} {TOOL_040_LIPID_UNIT}</span>
                <span>{t.field_tg}: {input?.panel.triglycerides_mg_dl} {TOOL_040_LIPID_UNIT}</span>
              </div>
              <LipidSummaryPdfButton
                locale={locale}
                input={input!}
                result={result}
                labels={{ exportButton: t.export_pdf_btn }}
              />
            </div>

            <h3 className="mb-2 text-xs font-bold text-zinc-300">{t.interventions}</h3>
            <ul className="space-y-0.5 text-xs text-cyan-200" dir="ltr">
              {result.interventions.map((intervention) => (
                <li key={intervention}>• {intervention}</li>
              ))}
            </ul>

            <p className="mt-3 text-[11px] leading-5 text-zinc-500">{t.interpretation}</p>
          </section>
        )}

        {/* The visual layer renders in EVERY state: it explains HOW a band is
            produced and does not depend on a calculation. Only the data-driven
            rows appear once a result exists. */}
        <Tool040Visual locale={locale} panel={input?.panel ?? null} output={output} />

        {resultStatus === 'FULL' && output && input && (
          <Tool040Genius
            locale={locale}
            input={input}
            output={output}
            options={options}
            panelDate={draft.date.trim() || null}
          />
        )}

        <p className="text-[11px] leading-5 text-zinc-600">
          {t.sources_intro} · {TOOL_040_SOURCES.length} {t.source_level.toLowerCase()} sources · {t.box10_note}
        </p>
      </section>

      <Tool040OcrModal
        locale={locale}
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onConfirm={handleOcrConfirm}
      />

      <nav className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-4 text-xs md:flex-row" aria-label={t.box12_next}>
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="flex items-center gap-2 text-zinc-400 transition hover:text-lime-400">
          <span>←</span>
          <span>{isRtl ? `الأداة السابقة: ${neighbors.prevTool.titleAr}` : `Prev Tool: ${neighbors.prevTool.titleEn}`}</span>
        </a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="flex items-center gap-2 text-zinc-400 transition hover:text-lime-400">
          <span>{isRtl ? `الأداة التالية: ${neighbors.nextTool.titleAr}` : `Next Tool: ${neighbors.nextTool.titleEn}`}</span>
          <span>→</span>
        </a>
      </nav>

      <p className="mt-2 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </main>
  );
}
