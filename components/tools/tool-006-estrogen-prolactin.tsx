'use client';
/**
 * components/tools/tool-006-estrogen-prolactin.tsx
 * ═════════════════════════════════════════════════════════════════════
 * Tool #006 — Estradiol & Prolactin Monitor (R6.1 Parity Upgrade)
 *
 * Full Engineering Parity with Tool 039 Benchmark:
 * 1. P-01: Dual visual range gauge for Estradiol & Prolactin.
 * 2. P-02: Derived endocrine ratio (E2 / Total Testosterone).
 * 3. P-03: Privacy-preserving client-side OCR scanner with staging table.
 * 4. P-04: Consultation-ready A4 PDF report generator.
 * 5. P-05: One-click deterministic synthetic demo data with overwrite guard.
 * 6. Explicit 5-state pipeline: EMPTY / PARTIAL / FULL / INVALID / DEGRADED.
 * 7. Debounced R6 execution (120ms) & zero session persistence.
 * 8. Tool-owned GENIUS-12 analytical boxes & responsive 390px layout.
 * ═════════════════════════════════════════════════════════════════════
 */
import React, { useEffect, useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import type { ToolOutput } from '@/lib/tools/contracts';
import type { AromatizationScore, EstrogenProlactinInput } from '@/lib/tools/schemas/tool-006-estrogen-prolactin';
import {
  runEstrogenProlactin,
  type EstrogenProlactinBuildOptions,
} from '@/lib/tools/r6/tool-006-estrogen-prolactin-pipeline';
import {
  TOOL_006_DEBOUNCE_MS,
  TOOL_006_FIELD_CONTRACT,
  TOOL_006_SOURCES,
  isRealCalendarDate,
  labFreshness,
  type Tool006FieldId,
} from '@/lib/tools/r6/tool-006-estrogen-prolactin-contract';
import Tool006Visual from './tool-006-estrogen-prolactin.visual';
import Tool006Genius from './tool-006-estrogen-prolactin.genius';
import Tool006OcrModal from './tool-006-estrogen-prolactin.ocr';
import EstrogenProlactinPdfButton from './tool-006-estrogen-prolactin.pdf';
import i18nJson from '@/i18n/tool-006-estrogen-prolactin.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-006-estrogen-prolactin';

interface Draft {
  e2Level: string;
  e2Unit: 'pg/mL' | 'pmol/L';
  prolactinLevel: string;
  prolactinUnit: 'ng/mL' | 'mIU/L';
  testosteroneLevel: string;
  panelDate: string;
}

const EMPTY_DRAFT: Draft = {
  e2Level: '',
  e2Unit: 'pg/mL',
  prolactinLevel: '',
  prolactinUnit: 'ng/mL',
  testosteroneLevel: '',
  panelDate: '',
};

/** P-05: Deterministic synthetic demo values */
const DEMO_DRAFT: Draft = {
  e2Level: '58',
  e2Unit: 'pg/mL',
  prolactinLevel: '18.5',
  prolactinUnit: 'ng/mL',
  testosteroneLevel: '1450',
  panelDate: '2026-03-10',
};

type UiState = 'EMPTY' | 'PARTIAL' | 'FULL' | 'INVALID' | 'DEGRADED';
type IssueCode = 'invalid_number' | 'invalid_date' | 'out_of_range';

interface Issue {
  field: Tool006FieldId;
  code: IssueCode;
}

const CONTRACT_FIELD = (id: Tool006FieldId) =>
  TOOL_006_FIELD_CONTRACT.find((field) => field.fieldId === id);

interface Validation {
  issues: Issue[];
  numeric: Partial<Record<Tool006FieldId, number>>;
  filled: boolean;
  complete: boolean;
}

function validateDraft(draft: Draft): Validation {
  const issues: Issue[] = [];
  const numeric: Partial<Record<Tool006FieldId, number>> = {};

  const checkNumber = (fieldId: Tool006FieldId, raw: string, required: boolean) => {
    const contract = CONTRACT_FIELD(fieldId);
    const trimmed = raw.trim();
    if (trimmed === '') {
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

  checkNumber('e2Level', draft.e2Level, true);
  checkNumber('prolactinLevel', draft.prolactinLevel, true);
  checkNumber('testosteroneLevel', draft.testosteroneLevel, false);

  if (draft.panelDate.trim() !== '' && !isRealCalendarDate(draft.panelDate.trim())) {
    issues.push({ field: 'panelDate', code: 'invalid_date' });
  }

  const filled =
    draft.e2Level.trim() !== '' ||
    draft.prolactinLevel.trim() !== '' ||
    draft.testosteroneLevel.trim() !== '' ||
    draft.panelDate.trim() !== '';

  const complete =
    draft.e2Level.trim() !== '' &&
    draft.prolactinLevel.trim() !== '' &&
    draft.panelDate.trim() !== '';

  return { issues, numeric, filled, complete };
}

export default function Tool006EstrogenProlactin() {
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

  const options = useMemo<EstrogenProlactinBuildOptions>(
    () => ({
      calculatedAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
      locale,
      unitSystem: 'metric',
      snapshotType: 'draft',
      timezone: 'UTC',
      source: 'manual',
    }),
    [locale],
  );

  const updateDraft = (updater: (prev: Draft) => Draft) => {
    setDraft(updater);
    setIsDemoActive(false);
  };

  const handleLoadDemo = () => {
    if (filled && !isDemoActive) {
      if (typeof window !== 'undefined' && !window.confirm(t.demo_confirm_overwrite || 'Replace current values with synthetic demo data?')) {
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

  const handleOcrConfirm = (extracted: { e2?: number; prolactin?: number; tt?: number; date?: string }) => {
    setDraft((prev) => ({
      ...prev,
      ...(extracted.e2 !== undefined ? { e2Level: String(extracted.e2) } : {}),
      ...(extracted.prolactin !== undefined ? { prolactinLevel: String(extracted.prolactin) } : {}),
      ...(extracted.tt !== undefined ? { testosteroneLevel: String(extracted.tt) } : {}),
      ...(extracted.date ? { panelDate: extracted.date } : {}),
    }));
    setIsDemoActive(false);
    setIsOcrOpen(false);
  };

  /* ── Validation against field contract ── */
  const validation = validateDraft(draft);
  const { complete, filled, issues } = validation;
  const e2Value = validation.numeric.e2Level;
  const prlValue = validation.numeric.prolactinLevel;

  const hasIssues = issues.length > 0;

  const engineInput = useMemo<EstrogenProlactinInput | null>(() => {
    const checked = validateDraft(draft);
    const e2 = checked.numeric.e2Level;
    const prl = checked.numeric.prolactinLevel;
    if (!checked.complete || checked.issues.length > 0 || e2 === undefined || prl === undefined) return null;
    return {
      e2Level: e2,
      e2Unit: draft.e2Unit,
      prolactinLevel: prl,
      prolactinUnit: draft.prolactinUnit,
    };
  }, [draft]);

  const inputSignature = useMemo(() => (engineInput ? JSON.stringify(engineInput) : ''), [engineInput]);

  /* ── Debounced Execution Pipeline ── */
  useEffect(() => {
    if (!engineInput || inputSignature === '') return;
    const timer = setTimeout(() => {
      const outcome = runEstrogenProlactin(engineInput, options);
      setPipeline({
        signature: inputSignature,
        state: outcome.ok ? 'ok' : 'error',
      });
    }, TOOL_006_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [engineInput, inputSignature, options]);

  const currentState = useMemo(() => {
    if (inputSignature === '' || pipeline.signature !== inputSignature) return 'idle' as const;
    return pipeline.state;
  }, [pipeline, inputSignature]);

  const output = useMemo<ToolOutput<AromatizationScore> | null>(() => {
    if (currentState !== 'ok' || !engineInput) return null;
    const outcome = runEstrogenProlactin(engineInput, options);
    return outcome.ok ? outcome.output : null;
  }, [currentState, engineInput, options]);

  const resultStatus: UiState = !filled
    ? 'EMPTY'
    : hasIssues
      ? 'INVALID'
      : !complete
        ? 'PARTIAL'
        : currentState === 'error'
          ? 'DEGRADED'
          : 'FULL';

  const stateLabel: Record<UiState, string> = {
    EMPTY: t.state_empty,
    PARTIAL: t.state_partial,
    FULL: t.state_full,
    INVALID: t.state_invalid,
    DEGRADED: t.state_degraded,
  };

  const freshness = useMemo(() => {
    const date = draft.panelDate.trim();
    if (!date || !isRealCalendarDate(date)) return { ageDays: null, stale: false };
    return labFreshness(date, options.calculatedAt.slice(0, 10));
  }, [draft.panelDate, options.calculatedAt]);

  const issueFor = (field: Tool006FieldId): Issue | undefined =>
    issues.find((issue) => issue.field === field);

  const statusMessage = (): string => {
    if (resultStatus === 'EMPTY') return t.empty_state;
    if (resultStatus === 'PARTIAL') return t.partial_state;
    if (resultStatus === 'INVALID') return `${t.invalid_state} — ${t.invalid_input}`;
    if (resultStatus === 'DEGRADED') return t.degraded_state;
    return '';
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Title & State Badge */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-[10px] font-bold text-zinc-400">
          {t.state_label}: {stateLabel[resultStatus]}
        </span>
      </div>

      <p className="mb-4 rounded-xl border border-amber-700/50 bg-amber-950/30 p-3 text-xs leading-6 text-amber-100">
        {t.disclaimer}
      </p>

      {/* Action Toolbar: P-03 OCR Scan + P-05 Demo Data */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOcrOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-800/60 bg-purple-950/30 px-3 py-1.5 text-xs font-semibold text-purple-300 transition hover:bg-purple-900/50 hover:text-purple-200"
          >
            <span>📷</span>
            <span>{t.scan_report_btn || 'Scan Lab Report'}</span>
          </button>

          {!isDemoActive ? (
            <button
              type="button"
              onClick={handleLoadDemo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-pink-800/60 bg-pink-950/30 px-3 py-1.5 text-xs font-semibold text-pink-300 transition hover:bg-pink-900/50 hover:text-pink-200"
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Estradiol Field */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <label htmlFor={`${inputGroupId}-e2Level`} className="mb-1 block text-xs font-bold text-zinc-500">
              {t.e2_label}
            </label>
            <div className="flex gap-2">
              <input
                id={`${inputGroupId}-e2Level`}
                data-r6-field="e2Level"
                type="text"
                inputMode="decimal"
                dir="ltr"
                aria-label={t.e2_label}
                aria-invalid={Boolean(issueFor('e2Level'))}
                value={draft.e2Level}
                onChange={(e) => updateDraft((prev) => ({ ...prev, e2Level: e.target.value }))}
                placeholder="28.5"
                className={`w-full rounded-lg border bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white ${issueFor('e2Level') ? 'border-red-500' : 'border-zinc-700'}`}
              />
              <select
                aria-label={t.e2_unit}
                value={draft.e2Unit}
                onChange={(e) => updateDraft((prev) => ({ ...prev, e2Unit: e.target.value as 'pg/mL' | 'pmol/L' }))}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
              >
                <option value="pg/mL">pg/mL</option>
                <option value="pmol/L">pmol/L</option>
              </select>
            </div>
            <span className="mt-1 block text-[10px] text-zinc-600">{t.help_e2}</span>
          </div>

          {/* Prolactin Field */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <label htmlFor={`${inputGroupId}-prolactinLevel`} className="mb-1 block text-xs font-bold text-zinc-500">
              {t.prolactin_label}
            </label>
            <div className="flex gap-2">
              <input
                id={`${inputGroupId}-prolactinLevel`}
                data-r6-field="prolactinLevel"
                type="text"
                inputMode="decimal"
                dir="ltr"
                aria-label={t.prolactin_label}
                aria-invalid={Boolean(issueFor('prolactinLevel'))}
                value={draft.prolactinLevel}
                onChange={(e) => updateDraft((prev) => ({ ...prev, prolactinLevel: e.target.value }))}
                placeholder="11.2"
                className={`w-full rounded-lg border bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white ${issueFor('prolactinLevel') ? 'border-red-500' : 'border-zinc-700'}`}
              />
              <select
                aria-label={t.prolactin_unit}
                value={draft.prolactinUnit}
                onChange={(e) => updateDraft((prev) => ({ ...prev, prolactinUnit: e.target.value as 'ng/mL' | 'mIU/L' }))}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
              >
                <option value="ng/mL">ng/mL</option>
                <option value="mIU/L">mIU/L</option>
              </select>
            </div>
            <span className="mt-1 block text-[10px] text-zinc-600">{t.help_prolactin}</span>
          </div>
        </div>

        {/* Optional Context Section */}
        <h2 className="text-sm font-bold text-zinc-300">{t.context_section}</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {/* Total Testosterone */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <label htmlFor={`${inputGroupId}-testosteroneLevel`} className="mb-1 block text-xs font-bold text-zinc-500">
              {t.tt_label} (ng/dL)
            </label>
            <input
              id={`${inputGroupId}-testosteroneLevel`}
              data-r6-field="testosteroneLevel"
              type="text"
              inputMode="decimal"
              dir="ltr"
              aria-label={t.tt_label}
              aria-invalid={Boolean(issueFor('testosteroneLevel'))}
              value={draft.testosteroneLevel}
              onChange={(e) => updateDraft((prev) => ({ ...prev, testosteroneLevel: e.target.value }))}
              placeholder="850"
              className={`w-full rounded-lg border bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white ${issueFor('testosteroneLevel') ? 'border-red-500' : 'border-zinc-700'}`}
            />
            <span className="mt-1 block text-[10px] text-zinc-600">{t.help_tt}</span>
          </div>

          {/* Blood Draw Date */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <label htmlFor={`${inputGroupId}-panelDate`} className="mb-1 block text-xs font-bold text-zinc-500">
              {t.field_panel_date}
            </label>
            <input
              id={`${inputGroupId}-panelDate`}
              data-r6-field="panelDate"
              type="text"
              inputMode="numeric"
              dir="ltr"
              aria-label={t.field_panel_date}
              aria-invalid={Boolean(issueFor('panelDate'))}
              value={draft.panelDate}
              onChange={(e) => updateDraft((prev) => ({ ...prev, panelDate: e.target.value }))}
              placeholder="2026-03-01"
              className={`w-full rounded-lg border bg-zinc-950 px-2 py-1.5 font-mono text-xs text-white ${issueFor('panelDate') ? 'border-red-500' : 'border-zinc-700'}`}
            />
            <span className="mt-1 block text-[10px] text-zinc-600">{t.help_panel_date}</span>
          </div>
        </div>

        {/* State / Freshness Alert */}
        <div
          role={resultStatus === 'INVALID' ? 'alert' : 'status'}
          aria-live="polite"
          className={`rounded-xl border p-4 ${
            resultStatus === 'INVALID'
              ? 'border-red-700 bg-red-950/40'
              : resultStatus === 'FULL'
                ? 'border-purple-800 bg-purple-950/30'
                : 'border-zinc-800 bg-zinc-900/70'
          }`}
          data-r6-state={resultStatus}
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold text-white">{stateLabel[resultStatus]}</p>
            {resultStatus === 'FULL' && (
              <EstrogenProlactinPdfButton
                locale={locale}
                e2={validation.numeric.e2Level as number}
                e2Unit={draft.e2Unit}
                prolactin={validation.numeric.prolactinLevel as number}
                prolactinUnit={draft.prolactinUnit}
                tt={validation.numeric.testosteroneLevel ?? null}
                panelDate={draft.panelDate}
                labels={{ exportButton: t.export_pdf_btn }}
              />
            )}
          </div>
          {statusMessage() && <p className="mt-1 text-xs text-zinc-300">{statusMessage()}</p>}
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

        {/* ── Visual Layer (Renders in every state) ── */}
        <Tool006Visual
          locale={locale}
          e2={validation.numeric.e2Level ?? null}
          e2Unit={draft.e2Unit}
          prolactin={validation.numeric.prolactinLevel ?? null}
          prolactinUnit={draft.prolactinUnit}
          tt={validation.numeric.testosteroneLevel ?? null}
        />

        {/* ── GENIUS-12 Layer (Renders when FULL) ── */}
        {resultStatus === 'FULL' && output && (
          <Tool006Genius
            locale={locale}
            input={{
              e2Level: validation.numeric.e2Level as number,
              e2Unit: draft.e2Unit,
              prolactinLevel: validation.numeric.prolactinLevel as number,
              prolactinUnit: draft.prolactinUnit,
              testosteroneLevel: validation.numeric.testosteroneLevel,
              panelDate: draft.panelDate,
            }}
            output={output}
          />
        )}

        <p className="text-[11px] leading-5 text-zinc-600">
          {t.sources_intro} · {TOOL_006_SOURCES.length} {t.source_level.toLowerCase()} sources
        </p>
      </section>

      {/* OCR Modal */}
      <Tool006OcrModal
        locale={locale}
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onConfirm={handleOcrConfirm}
      />

      {/* Cross-Tool Neighbor Navigation */}
      <nav className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-4 text-xs md:flex-row">
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="flex items-center gap-2 text-zinc-400 transition hover:text-purple-400">
          <span>←</span>
          <span>{isRtl ? `الأداة السابقة: ${neighbors.prevTool.titleAr}` : `Prev Tool: ${neighbors.prevTool.titleEn}`}</span>
        </a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="flex items-center gap-2 text-zinc-400 transition hover:text-purple-400">
          <span>{isRtl ? `الأداة التالية: ${neighbors.nextTool.titleAr}` : `Next Tool: ${neighbors.nextTool.titleEn}`}</span>
          <span>→</span>
        </a>
      </nav>

      <p className="mt-2 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </main>
  );
}
