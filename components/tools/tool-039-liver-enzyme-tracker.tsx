'use client';
/**
 * Tool #039 — Liver Enzyme Tracker (R6.1 UI).
 *
 * Single calculation source: the R6 pipeline (`runLiverEnzymeTracker`) wraps the
 * authoritative, unmodified V6 engine. This component never calls the engine
 * directly and never writes to storage, Supabase or the Bio-Dashboard.
 *
 * Input semantics:
 *   - empty  -> missing field (PARTIAL), never coerced to 0
 *   - typed 0 -> a real value (0 is valid)
 *   - invalid (non-numeric, negative, out of range, bad date) -> INVALID
 *   - answers stay UNANSWERED until the user picks Yes/No
 *
 * Units are fixed to the units the engine's ULN assumes:
 *   ALT/AST/GGT/ALP = U/L, bilirubin = mg/dL. No conversion is applied.
 */
import { useEffect, useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import type { ToolOutput } from '@/lib/tools/contracts';
import {
  LiverTrackerInputSchema,
  type LiverTrackerInput,
  type LiverTrackerResult,
} from '@/lib/tools/schemas/tool-039-liver-enzyme-tracker';
import {
  runLiverEnzymeTracker,
  type LiverEnzymeTrackerBuildOptions,
} from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline';
import {
  TOOL_039_ALCOHOL_RANGE,
  TOOL_039_DEBOUNCE_MS,
  TOOL_039_VALUE_RANGE,
  computeDeRitisRatio,
  labFreshness,
} from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-contract';
import LiverTrackerGenius from './tool-039-liver-enzyme-tracker.genius';
import LiverTrackerVisual from './tool-039-liver-enzyme-tracker.visual';
import Tool039OcrModal, { type ExtractedReading } from './tool-039-liver-enzyme-tracker.ocr';
import DoctorSummaryPdfButton from './tool-039-liver-enzyme-tracker.pdf';
import {
  Tool039HistoryProvider,
  Tool039HistorySaveAction,
} from './tool-039-liver-enzyme-tracker.history';
import { createBrowserHistoryStore } from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-history-store';
import i18nJson from '@/i18n/tool-039-liver-enzyme-tracker.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-039-liver-enzyme-tracker';

type Marker = 'ALT' | 'AST' | 'GGT' | 'ALP' | 'bilirubin';
const MARKERS: readonly Marker[] = ['ALT', 'AST', 'GGT', 'ALP', 'bilirubin'];

/** Exactly the units the engine's ULN constants assume — never converted. */
const MARKER_UNITS: Record<Marker, string> = {
  ALT: 'U/L',
  AST: 'U/L',
  GGT: 'U/L',
  ALP: 'U/L',
  bilirubin: 'mg/dL',
};

type Answer = 'unanswered' | 'yes' | 'no';

interface ReadingDraft {
  id: string;
  marker: Marker;
  value: string;
  date: string;
}

interface DraftInputs {
  readings: ReadingDraft[];
  oralSteroids: Answer;
  alcohol: string;
  usesTudca: Answer;
}

type IssueField = 'value' | 'date' | 'alcohol' | 'oral_steroids' | 'uses_tudca';
type IssueCode = 'required' | 'invalid_number' | 'invalid_date' | 'out_of_range';

interface ValidationIssue {
  readingId?: string;
  field: IssueField;
  code: IssueCode;
}

type ValidationStatus = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'COMPLETE';

interface Validation {
  status: ValidationStatus;
  input: LiverTrackerInput | null;
  issues: ValidationIssue[];
}

type UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

type PipelineState =
  | { kind: 'idle' }
  | { kind: 'ok'; output: ToolOutput<LiverTrackerResult> }
  | { kind: 'error'; message: string };

let readingSeq = 0;
function createReading(marker: Marker = 'ALT'): ReadingDraft {
  readingSeq += 1;
  return { id: `liver-reading-${readingSeq}`, marker, value: '', date: '' };
}

const EMPTY_INPUTS: DraftInputs = {
  readings: [],
  oralSteroids: 'unanswered',
  alcohol: '',
  usesTudca: 'unanswered',
};

const STATUS_COLOR: Record<string, string> = {
  normal: 'text-lime-400',
  elevated: 'text-amber-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
};

const STATE_STYLE: Record<UiState, string> = {
  EMPTY: 'border-zinc-800 bg-zinc-900/50 text-zinc-500',
  PARTIAL: 'border-amber-700/50 bg-amber-950/30 text-amber-100',
  INVALID: 'border-red-700/50 bg-red-950/30 text-red-100',
  FULL: 'border-lime-700/50 bg-lime-950/30 text-lime-100',
  DEGRADED: 'border-blue-700/50 bg-blue-950/30 text-blue-100',
};

/** Strict ISO calendar date (YYYY-MM-DD), rejects 2026-02-30. */
function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().slice(0, 10) === value;
}

/** Decimal text -> finite number, or null when the text is not numeric. */
function parseDecimal(value: string): number | null {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export default function Tool039LiverEnzymeTracker() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const inputGroupId = useId();

  const [inputs, setInputs] = useState<DraftInputs>(EMPTY_INPUTS);
  /** Frozen once per mount so the same inputs always produce the same envelope. */
  const [calculatedAt] = useState(() => new Date().toISOString());

  const options = useMemo<LiverEnzymeTrackerBuildOptions>(() => ({
    calculatedAt,
    recordedAt: calculatedAt,
    locale,
    unitSystem,
    snapshotType: 'draft',
    timezone: 'UTC',
  }), [calculatedAt, locale, unitSystem]);

  // ── 1. Field-level validation (EMPTY / PARTIAL / INVALID / COMPLETE) ───────
  const validation = useMemo<Validation>(() => {
    const issues: ValidationIssue[] = [];
    const readings: LiverTrackerInput['readings'] = [];

    for (const reading of inputs.readings) {
      const rawValue = reading.value.trim();
      const rawDate = reading.date.trim();
      let value: number | null = null;
      let valueOk = false;

      if (rawValue === '') {
        issues.push({ readingId: reading.id, field: 'value', code: 'required' });
      } else {
        value = parseDecimal(rawValue);
        if (value === null) {
          issues.push({ readingId: reading.id, field: 'value', code: 'invalid_number' });
        } else if (value < 0 || value > 5000) {
          issues.push({ readingId: reading.id, field: 'value', code: 'out_of_range' });
        } else {
          valueOk = true;
        }
      }

      const dateOk = rawDate !== '' && isValidISODate(rawDate);
      if (rawDate === '') {
        issues.push({ readingId: reading.id, field: 'date', code: 'required' });
      } else if (!dateOk) {
        issues.push({ readingId: reading.id, field: 'date', code: 'invalid_date' });
      }

      if (valueOk && dateOk && value !== null) {
        readings.push({
          marker: reading.marker,
          value,
          unit: MARKER_UNITS[reading.marker],
          date: rawDate,
        });
      }
    }

    const rawAlcohol = inputs.alcohol.trim();
    let alcohol: number | null = null;
    if (rawAlcohol === '') {
      issues.push({ field: 'alcohol', code: 'required' });
    } else {
      const parsedAlcohol = parseDecimal(rawAlcohol);
      if (parsedAlcohol === null || !Number.isInteger(parsedAlcohol)) {
        issues.push({ field: 'alcohol', code: 'invalid_number' });
      } else if (parsedAlcohol < 0 || parsedAlcohol > 100) {
        issues.push({ field: 'alcohol', code: 'out_of_range' });
      } else {
        alcohol = parsedAlcohol;
      }
    }

    if (inputs.oralSteroids === 'unanswered') {
      issues.push({ field: 'oral_steroids', code: 'required' });
    }
    if (inputs.usesTudca === 'unanswered') {
      issues.push({ field: 'uses_tudca', code: 'required' });
    }

    let status: ValidationStatus;
    if (inputs.readings.length === 0) {
      status = 'EMPTY';
    } else if (issues.some((issue) => issue.code !== 'required')) {
      status = 'INVALID';
    } else if (issues.length > 0 || alcohol === null) {
      status = 'PARTIAL';
    } else {
      status = 'COMPLETE';
    }

    const input: LiverTrackerInput | null = status === 'COMPLETE'
      ? {
          readings,
          oral_steroids: inputs.oralSteroids === 'yes',
          alcohol_drinks_per_week: alcohol as number,
          uses_tudca: inputs.usesTudca === 'yes',
        }
      : null;

    return { status, input, issues };
  }, [inputs]);

  // ── 2. Schema validation — only when every required field is answered ─────
  const parsed = useMemo(() => {
    if (!validation.input) return null;
    return LiverTrackerInputSchema.safeParse(validation.input);
  }, [validation.input]);

  // ── 3. Pipeline — debounced, never invoked on incomplete/invalid input ───
  // SPEC-R6.1-2 requires the result engine to be debounced: a burst of edits
  // (typing a value, dragging the slider) must trigger one calculation, not one
  // per keystroke. The result of an older input is never shown as if it were
  // the current one: `inputSignature` gates what the page is allowed to render.
  const inputSignature = useMemo(
    () => (parsed && parsed.success ? JSON.stringify(parsed.data) : ''),
    [parsed],
  );

  const [pipeline, setPipeline] = useState<{ signature: string; state: PipelineState }>({
    signature: '',
    state: { kind: 'idle' },
  });
  const [isOcrOpen, setIsOcrOpen] = useState(false);

  useEffect(() => {
    if (!parsed || !parsed.success) return;
    const timer = setTimeout(() => {
      const outcome = runLiverEnzymeTracker(parsed.data, options);
      setPipeline({
        signature: inputSignature,
        state: outcome.ok
          ? { kind: 'ok', output: outcome.output }
          : { kind: 'error', message: describeError(outcome.error) },
      });
    }, TOOL_039_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [parsed, options, inputSignature]);

  /** The pipeline state that belongs to the CURRENT input (never a stale one). */
  const pipelineState = useMemo<PipelineState>(() => {
    if (inputSignature === '') return { kind: 'idle' };
    if (pipeline.signature === inputSignature) return pipeline.state;
    return { kind: 'idle' };
  }, [inputSignature, pipeline]);

  const resultStatus = useMemo<UiState>(() => {
    if (validation.status === 'EMPTY') return 'EMPTY';
    if (validation.status === 'INVALID') return 'INVALID';
    if (parsed !== null && !parsed.success) return 'INVALID';
    if (validation.status === 'PARTIAL' || parsed === null) return 'PARTIAL';
    if (pipeline.signature === inputSignature && pipeline.state.kind === 'error') return 'DEGRADED';
    return 'FULL';
  }, [validation.status, parsed, pipeline, inputSignature]);

  const fieldIssues = useMemo(() => {
    const byReading = new Map<string, ValidationIssue[]>();
    const general: ValidationIssue[] = [];
    for (const issue of validation.issues) {
      if (issue.code === 'required') continue;
      if (issue.readingId) {
        const list = byReading.get(issue.readingId) ?? [];
        list.push(issue);
        byReading.set(issue.readingId, list);
      } else {
        general.push(issue);
      }
    }
    return { byReading, general };
  }, [validation.issues]);

  const issueMessage = (code: IssueCode): string => {
    switch (code) {
      case 'invalid_number':
        return t.invalid_value;
      case 'invalid_date':
        return t.invalid_date;
      case 'out_of_range':
        return t.out_of_range;
      default:
        return t.required_fields;
    }
  };

  const statusLabel = (status: string): string => {
    switch (status) {
      case 'normal':
        return t.status_normal;
      case 'elevated':
        return t.status_elevated;
      case 'high':
        return t.status_high;
      case 'critical':
        return t.status_critical;
      default:
        return status;
    }
  };

  const stateLabel: Record<UiState, string> = {
    EMPTY: t.state_empty,
    PARTIAL: t.state_partial,
    INVALID: t.state_invalid,
    FULL: t.state_full,
    DEGRADED: t.state_degraded,
  };

  const updateReading = (id: string, patch: Partial<Omit<ReadingDraft, 'id'>>) => {
    setInputs((prev) => ({
      ...prev,
      readings: prev.readings.map((reading) => (reading.id === id ? { ...reading, ...patch } : reading)),
    }));
  };

  const addReading = () => {
    setInputs((prev) => (
      prev.readings.length >= 100
        ? prev
        : { ...prev, readings: [...prev.readings, createReading()] }
    ));
  };

  /** Deleting the last reading is allowed and returns the tool to EMPTY. */
  const removeReading = (id: string) => {
    setInputs((prev) => ({
      ...prev,
      readings: prev.readings.filter((reading) => reading.id !== id),
    }));
  };

  const answerGroup = (
    field: 'oralSteroids' | 'usesTudca',
    legend: string,
    help: string,
  ) => {
    const value = inputs[field];
    const set = (next: Answer) => setInputs((prev) => ({ ...prev, [field]: next }));
    const options: Array<{ key: Answer; label: string }> = [
      { key: 'yes', label: t.yes },
      { key: 'no', label: t.no },
      { key: 'unanswered', label: t.unanswered },
    ];
    return (
      <div role="group" aria-label={legend} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
        <span className="mb-1 block text-xs font-bold text-zinc-500">{legend}</span>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const selected = value === option.key;
            const tone = selected
              ? option.key === 'yes'
                ? 'border-lime-500 bg-lime-500/20 text-lime-300'
                : option.key === 'no'
                  ? 'border-red-500 bg-red-500/20 text-red-300'
                  : 'border-zinc-500 bg-zinc-700/40 text-zinc-200'
              : 'border-zinc-700 bg-zinc-950 text-zinc-500';
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={selected}
                onClick={() => set(option.key)}
                className={`rounded border px-3 py-1 text-xs font-bold transition ${tone}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <span className="mt-2 block text-[10px] text-zinc-600">{help}</span>
      </div>
    );
  };

  const output = pipelineState.kind === 'ok' ? pipelineState.output : null;
  const result = output?.result ?? null;
  const parsedInput = parsed && parsed.success ? parsed.data : null;

  /** De Ritis Ratio (P-02) computed when input is valid. */
  const deRitis = useMemo(() => {
    if (!parsedInput) return null;
    return computeDeRitisRatio(parsedInput.readings);
  }, [parsedInput]);

  /** Freshness of the newest reading (lab data = 90 days). */
  const freshness = useMemo(() => {
    const dates = inputs.readings.map((reading) => reading.date).filter((date) => date.trim() !== '').sort();
    const newest = dates[dates.length - 1];
    if (!newest) return { ageDays: null, stale: false, newestDate: null as string | null };
    const verdict = labFreshness(newest, options.calculatedAt.slice(0, 10));
    return { ageDays: verdict.ageDays, stale: verdict.stale, newestDate: newest };
  }, [inputs.readings, options.calculatedAt]);

  /** The local, device-only history store (owner decision D-08, Option A). */
  const historyStore = useMemo(() => createBrowserHistoryStore(), []);

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

      <Tool039HistoryProvider store={historyStore}>
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-300">{t.lab_readings}</h2>

        <div className="space-y-2">
          {inputs.readings.map((reading, index) => {
            const readingIssues = fieldIssues.byReading.get(reading.id) ?? [];
            const valueIssue = readingIssues.find((issue) => issue.field === 'value');
            const dateIssue = readingIssues.find((issue) => issue.field === 'date');
            const position = index + 1;
            return (
              <div key={reading.id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                  <label className="text-[10px] font-bold text-zinc-500">
                    {t.marker}
                    <select
                      aria-label={`${t.marker} ${position}`}
                      value={reading.marker}
                      onChange={(event) => updateReading(reading.id, { marker: event.target.value as Marker })}
                      className="mt-0.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
                    >
                      {MARKERS.map((marker) => (
                        <option key={marker} value={marker}>{marker}</option>
                      ))}
                    </select>
                    <span className="mt-1 block text-[10px] font-normal text-zinc-600">{t.help_marker}</span>
                  </label>

                  <label className="text-[10px] font-bold text-zinc-500">
                    {t.value}
                    <input
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      min={TOOL_039_VALUE_RANGE.min}
                      max={TOOL_039_VALUE_RANGE.max}
                      step="any"
                      aria-label={`${t.value} ${position}`}
                      aria-invalid={Boolean(valueIssue)}
                      value={reading.value}
                      onChange={(event) => updateReading(reading.id, { value: event.target.value })}
                      placeholder="0"
                      className={`mt-0.5 w-full rounded-lg border bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white ${valueIssue ? 'border-red-500' : 'border-zinc-700'}`}
                    />
                    <span className="mt-1 block text-[10px] font-normal text-zinc-600">{t.help_value}</span>
                  </label>

                  <label className="text-[10px] font-bold text-zinc-500">
                    {t.unit}
                    <input
                      type="text"
                      dir="ltr"
                      readOnly
                      aria-label={`${t.unit} ${position}`}
                      value={MARKER_UNITS[reading.marker]}
                      className="mt-0.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 font-mono text-xs text-zinc-400"
                    />
                    <span className="mt-1 block text-[10px] font-normal text-zinc-600">{t.help_unit}</span>
                  </label>

                  <label className="text-[10px] font-bold text-zinc-500">
                    {t.date}
                    <input
                      type="text"
                      inputMode="numeric"
                      dir="ltr"
                      aria-label={`${t.date} ${position}`}
                      aria-invalid={Boolean(dateIssue)}
                      value={reading.date}
                      onChange={(event) => updateReading(reading.id, { date: event.target.value })}
                      placeholder={t.date_hint}
                      className={`mt-0.5 w-full rounded-lg border bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white ${dateIssue ? 'border-red-500' : 'border-zinc-700'}`}
                    />
                    <span className="mt-1 block text-[10px] font-normal text-zinc-600">{t.help_date}</span>
                  </label>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeReading(reading.id)}
                      aria-label={`${t.remove_reading} ${position}`}
                      className="w-full rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/40"
                    >
                      ✕ {t.remove_reading}
                    </button>
                  </div>
                </div>

                {readingIssues.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-[11px] font-bold text-red-400">
                    {readingIssues.map((issue, issueIndex) => (
                      <li key={`${issue.field}-${issueIndex}`}>⚠ {issueMessage(issue.code)}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={addReading}
            disabled={inputs.readings.length >= 100}
            className="flex-1 rounded-lg bg-lime-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-lime-400 disabled:opacity-40"
          >
            + {t.add_reading}
          </button>
          <button
            type="button"
            onClick={() => setIsOcrOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-cyan-500/50 bg-cyan-950/40 px-4 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-900/50"
          >
            <span>📷</span>
            <span>{t.ocr_button_label || 'Upload Lab Report (Scan / PDF)'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {answerGroup('oralSteroids', t.oral_steroids, t.help_oral_steroids)}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <label htmlFor={`${inputGroupId}-alcohol`} className="mb-1 block text-xs font-bold text-zinc-500">
              {t.alcohol}
            </label>
            <input
              id={`${inputGroupId}-alcohol`}
              data-r6-slider="true"
              type="text"
              inputMode="numeric"
              dir="ltr"
              min={TOOL_039_ALCOHOL_RANGE.min}
              max={TOOL_039_ALCOHOL_RANGE.max}
              step={1}
              aria-label={t.alcohol}
              aria-invalid={fieldIssues.general.some((issue) => issue.field === 'alcohol')}
              value={inputs.alcohol}
              onChange={(event) => setInputs((prev) => ({ ...prev, alcohol: event.target.value }))}
              placeholder="0"
              className={`w-full rounded-lg border bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white ${fieldIssues.general.some((issue) => issue.field === 'alcohol') ? 'border-red-500' : 'border-zinc-700'}`}
            />
            <span className="mt-1 block text-[10px] text-zinc-600">{t.help_alcohol}</span>
          </div>
          {answerGroup('usesTudca', t.uses_tudca, t.help_uses_tudca)}
        </div>

        {fieldIssues.general.length > 0 && (
          <ul className="space-y-0.5 text-[11px] font-bold text-red-400">
            {fieldIssues.general.map((issue, index) => (
              <li key={`${issue.field}-${index}`}>⚠ {issueMessage(issue.code)}</li>
            ))}
          </ul>
        )}

        <div
          role={resultStatus === 'INVALID' ? 'alert' : 'status'}
          aria-live="polite"
          className={`rounded-xl border p-4 ${STATE_STYLE[resultStatus]}`}
        >
          <p className="font-semibold">{stateLabel[resultStatus]}</p>
          {resultStatus === 'EMPTY' && <p className="mt-1 text-xs">{t.empty_state}</p>}
          {resultStatus === 'PARTIAL' && <p className="mt-1 text-xs">{t.partial_state}</p>}
          {resultStatus === 'INVALID' && (
            <p className="mt-1 text-xs">{t.invalid_state} — {t.invalid_input}</p>
          )}
          {resultStatus === 'DEGRADED' && (
            <p className="mt-1 text-xs">{t.degraded_state}</p>
          )}
          {resultStatus === 'DEGRADED' && pipelineState.kind === 'error' && (
            <p className="mt-1 break-words text-[11px] font-mono" dir="ltr">
              {t.calculation_error}: {pipelineState.message}
            </p>
          )}
        </div>

        {resultStatus === 'FULL' && !result && (
          <p role="status" className="text-xs font-bold text-zinc-400">
            {t.calculating}
          </p>
        )}

        {resultStatus === 'FULL' && output && result && parsedInput && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
              <span className="rounded-full border border-lime-700/50 bg-lime-950/40 px-2 py-0.5 font-bold text-lime-300">
                ✓ {t.pipeline_done}
              </span>
              <span>{t.data_source}: {output.provenance.source === 'manual' ? t.source_manual : output.provenance.source}</span>
              <span>{t.data_quality}: {output.provenance.dataQuality === 'not_assessed' ? t.quality_not_assessed : output.provenance.dataQuality}</span>
              <span dir="ltr" className="font-mono">{t.calculated_at}: {output.calculatedAt}</span>
              {freshness.ageDays !== null && (
                <span className={freshness.stale ? 'font-bold text-amber-400' : ''}>
                  {t.freshness_label}: {freshness.stale ? t.freshness_stale : t.freshness_current} ({freshness.ageDays} {t.days_old})
                </span>
              )}
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <span className="block text-[10px] text-zinc-400">{t.overall_status}</span>
                <span className={`font-mono text-xl font-bold ${STATUS_COLOR[result.overall_status] ?? 'text-zinc-300'}`}>
                  {statusLabel(result.overall_status)}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <span className="block text-[10px] text-zinc-400">{t.stop_orals}</span>
                <span className={`font-bold text-sm ${result.stop_orals ? 'text-red-400' : 'text-lime-400'}`}>
                  {result.stop_orals ? t.stop_orals_yes : t.stop_orals_no}
                </span>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <span className="block text-[10px] text-zinc-400">{t.marker_count}</span>
                <span className="font-mono text-xl font-bold text-cyan-400">{result.markers.length}</span>
              </div>
            </div>

            <h3 className="mb-2 text-xs font-bold text-zinc-300">{t.markers}</h3>
            <ul className="space-y-1 text-xs" dir="ltr">
              {result.markers.map((marker) => (
                <li key={marker.marker} className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-800 bg-zinc-950 p-2">
                  <span className="font-bold text-zinc-200">{marker.marker}</span>
                  <span className="font-mono text-zinc-400">{marker.latest_value} {marker.unit}</span>
                  <span className="font-mono text-zinc-500" title={t.uln_multiple}>{marker.uln_multiple.toFixed(2)}× ULN</span>
                  <span className={`font-mono font-bold ${STATUS_COLOR[marker.status] ?? 'text-zinc-400'}`}>
                    {statusLabel(marker.status)}
                  </span>
                  <span className={`font-mono text-[10px] ${marker.trend_per_30d > 0 ? 'text-red-400' : 'text-lime-400'}`}>
                    {marker.trend_per_30d >= 0 ? '↗' : '↘'} {Math.abs(marker.trend_per_30d).toFixed(2)}/30d
                  </span>
                </li>
              ))}
            </ul>

            {result.recommendations.length > 0 && (
              <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3">
                <span className="mb-1 block text-[10px] font-bold text-cyan-400">{t.recommendations}</span>
                <ul className="space-y-0.5 text-xs text-cyan-200" dir="ltr">
                  {result.recommendations.map((recommendation) => (
                    <li key={recommendation}>• {recommendation}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-3 text-[11px] leading-5 text-zinc-500">{t.interpretation}</p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-3">
              {/* Local, device-only history. Owner decision D-08 (Option A):
                  nothing is written without an explicit consent AND an explicit
                  user action. */}
              <Tool039HistorySaveAction locale={locale} input={parsedInput} result={result} />

              {/* P-04 Doctor Summary PDF Export */}
              <DoctorSummaryPdfButton
                locale={locale}
                input={parsedInput}
                result={result}
                deRitis={deRitis}
                labels={{
                  exportButton: t.pdf_export_button || 'Download Doctor Summary (PDF)',
                  disclaimer: t.pdf_disclaimer || t.disclaimer,
                }}
              />
            </div>
          </section>
        )}

        {/* The explanatory illustration is rendered in EVERY state (EMPTY,
            PARTIAL, INVALID, DEGRADED, FULL): it explains HOW a liver-enzyme
            result is produced and does not depend on a calculation. Only the
            data-driven charts and the table stay behind a real result, so no
            value is ever invented (SPEC-R6.1-1.f, ACC-5.5.11). */}
        <LiverTrackerVisual locale={locale} input={parsedInput} output={output} />

        {resultStatus === 'FULL' && output && parsedInput && (
          <LiverTrackerGenius locale={locale} input={parsedInput} output={output} options={options} />
        )}
        </section>
      </Tool039HistoryProvider>

      {/* P-03 Local Privacy-Preserving OCR Modal */}
      <Tool039OcrModal
        locale={locale}
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onConfirm={(confirmedReadings: ExtractedReading[]) => {
          const newDrafts: ReadingDraft[] = confirmedReadings.map((reading) => ({
            id: `ocr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            marker: reading.marker as Marker,
            value: String(reading.value),
            date: reading.date,
          }));
          setInputs((prev) => ({
            ...prev,
            readings: [...prev.readings.filter((reading) => reading.value.trim() !== ''), ...newDrafts],
          }));
          setIsOcrOpen(false);
        }}
        labels={{
          title: t.ocr_modal_title || 'Local Report Scanner',
          desc: t.ocr_modal_desc || 'Extract lab readings client-side.',
          dropHint: t.ocr_drop_hint || 'Drop file here',
          extracting: t.ocr_extracting || 'Analyzing document...',
          reviewTitle: t.ocr_review_title || 'Review Extracted Readings',
          reviewDesc: t.ocr_review_desc || 'Review before adding.',
          confirm: t.ocr_confirm_button || 'Confirm & Transfer',
          cancel: t.ocr_cancel_button || 'Cancel',
          noReadings: t.ocr_no_readings_found || 'No readings found.',
        }}
      />

      <nav className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-4 text-xs md:flex-row" aria-label={t.tool_navigation}>
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="flex items-center gap-2 text-zinc-400 transition hover:text-lime-400">
          <span>←</span>
          <span>{isRtl ? `${t.prev_tool}: ${neighbors.prevTool.titleAr}` : `${t.prev_tool}: ${neighbors.prevTool.titleEn}`}</span>
        </a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="flex items-center gap-2 text-zinc-400 transition hover:text-lime-400">
          <span>{isRtl ? `${t.next_tool}: ${neighbors.nextTool.titleAr}` : `${t.next_tool}: ${neighbors.nextTool.titleEn}`}</span>
          <span>→</span>
        </a>
      </nav>

      <p className="mt-2 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </main>
  );
}
