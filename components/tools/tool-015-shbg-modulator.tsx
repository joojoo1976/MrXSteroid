'use client';
/**
 * components/tools/tool-015-shbg-modulator.tsx
 * ═════════════════════════════════════════════════════════════════════
 * Tool #015 — SHBG Modulator & Free Testosterone (R6.1 Parity Upgrade)
 *
 * Full Parity with Tool 039 Benchmark + 100% Backwards Compatibility:
 * 1. P-01: Visual range gauge for SHBG level and Free Testosterone.
 * 2. P-02: Derived Free Androgen Index (FAI = 100 * (TT_nmol / SHBG_nmol)).
 * 3. P-03: Local client-side OCR scanner for Total T, SHBG, and Albumin.
 * 4. P-04: Consultation-ready A4 PDF export button.
 * 5. P-05: One-click synthetic demo data (TT=850, SHBG=14, Alb=4.3).
 * 6. Tool-owned GENIUS-12 analytical boxes & responsive 390px layout.
 * ═════════════════════════════════════════════════════════════════════
 */
import React, { useId, useMemo, useState } from 'react';
import { useToolDisplayPreferences } from './useToolDisplayPreferences';
import { getToolNeighbors, requireTool } from '@/lib/tools/registry';
import {
  runSHBGModulator,
  type SHBGModulatorBuildOptions,
} from '@/lib/tools/r6/tool-015-shbg-modulator-pipeline';
import {
  SHBGInputSchema,
  type SHBGInput,
  type SHBGResult,
} from '@/lib/tools/schemas/tool-015-shbg-modulator';
import {
  TOOL_015_SOURCES,
  isRealCalendarDate,
  labFreshness,
} from '@/lib/tools/r6/tool-015-shbg-modulator-contract';
import Tool015Visual from './tool-015-shbg-modulator.visual';
import Tool015Genius from './tool-015-shbg-modulator.genius';
import Tool015OcrModal from './tool-015-shbg-modulator.ocr';
import ShbgSummaryPdfButton from './tool-015-shbg-modulator.pdf';
import i18nJson from '@/i18n/tool-015-shbg-modulator.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

const TOOL_SLUG = 'tool-015-shbg-modulator';

type Draft = {
  total_testosterone_ng_dL: string;
  shbg_nmol_L: string;
  albumin_g_dL: string;
  panel_date: string;
};

const blank: Draft = {
  total_testosterone_ng_dL: '',
  shbg_nmol_L: '',
  albumin_g_dL: '',
  panel_date: '',
};

/** P-05: Deterministic synthetic demo values */
const DEMO_DRAFT: Draft = {
  total_testosterone_ng_dL: '850',
  shbg_nmol_L: '14',
  albumin_g_dL: '4.3',
  panel_date: '2026-03-10',
};

const inputClass = 'w-full rounded border border-zinc-700 bg-zinc-950 p-2 text-white font-mono text-xs';

export default function Tool015SHBGModulator() {
  const tool = requireTool(TOOL_SLUG);
  const neighbors = getToolNeighbors(TOOL_SLUG);
  const { locale, unitSystem, isRtl } = useToolDisplayPreferences();
  const t = pickToolI18n(i18nJson, locale);
  const inputGroupId = useId();

  const [draft, setDraft] = useState<Draft>(blank);
  const [result, setResult] = useState<SHBGResult | null>(null);
  const [status, setStatus] = useState<'PARTIAL' | 'INVALID' | 'CALCULATED'>('PARTIAL');
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState(false);

  const parsedInput = useMemo(() => {
    return SHBGInputSchema.safeParse({
      total_testosterone_ng_dL: Number(draft.total_testosterone_ng_dL),
      shbg_nmol_L: Number(draft.shbg_nmol_L),
      albumin_g_dL: Number(draft.albumin_g_dL),
    });
  }, [draft]);

  const options = useMemo<SHBGModulatorBuildOptions>(
    () => ({
      calculatedAt: new Date().toISOString(),
      recordedAt: new Date().toISOString(),
      locale,
      unitSystem,
      snapshotType: 'draft',
      timezone: 'UTC',
      source: 'manual',
    }),
    [locale, unitSystem],
  );

  const update = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setResult(null);
    setStatus('PARTIAL');
    setIsDemoActive(false);
  };

  const calculate = () => {
    if (
      draft.total_testosterone_ng_dL.trim() === '' ||
      draft.shbg_nmol_L.trim() === '' ||
      draft.albumin_g_dL.trim() === ''
    ) {
      setStatus('PARTIAL');
      setResult(null);
      return;
    }
    if (!parsedInput.success) {
      setStatus('INVALID');
      setResult(null);
      return;
    }
    try {
      const pipelineResult = runSHBGModulator(parsedInput.data, options);
      if (!pipelineResult.ok) {
        setResult(null);
        setStatus('INVALID');
        return;
      }
      setResult(pipelineResult.output.result);
      setStatus('CALCULATED');
    } catch {
      setResult(null);
      setStatus('INVALID');
    }
  };

  const handleLoadDemo = () => {
    const isFilled =
      draft.total_testosterone_ng_dL.trim() !== '' ||
      draft.shbg_nmol_L.trim() !== '' ||
      draft.albumin_g_dL.trim() !== '';

    if (isFilled && !isDemoActive) {
      if (typeof window !== 'undefined' && !window.confirm(t.demo_confirm_overwrite || 'Replace current values with synthetic demo data?')) {
        return;
      }
    }
    setDraft(DEMO_DRAFT);
    setIsDemoActive(true);

    const demoInput: SHBGInput = {
      total_testosterone_ng_dL: 850,
      shbg_nmol_L: 14,
      albumin_g_dL: 4.3,
    };
    const pipelineResult = runSHBGModulator(demoInput, options);
    if (pipelineResult.ok) {
      setResult(pipelineResult.output.result);
      setStatus('CALCULATED');
    }
  };

  const handleClearDemo = () => {
    setDraft(blank);
    setResult(null);
    setStatus('PARTIAL');
    setIsDemoActive(false);
  };

  const handleOcrConfirm = (extracted: { tt?: number; shbg?: number; alb?: number; date?: string }) => {
    const nextDraft: Draft = {
      ...draft,
      ...(extracted.tt !== undefined ? { total_testosterone_ng_dL: String(extracted.tt) } : {}),
      ...(extracted.shbg !== undefined ? { shbg_nmol_L: String(extracted.shbg) } : {}),
      ...(extracted.alb !== undefined ? { albumin_g_dL: String(extracted.alb) } : {}),
      ...(extracted.date ? { panel_date: extracted.date } : {}),
    };
    setDraft(nextDraft);
    setIsDemoActive(false);
    setIsOcrOpen(false);

    const parsed = SHBGInputSchema.safeParse({
      total_testosterone_ng_dL: Number(nextDraft.total_testosterone_ng_dL),
      shbg_nmol_L: Number(nextDraft.shbg_nmol_L),
      albumin_g_dL: Number(nextDraft.albumin_g_dL),
    });
    if (parsed.success) {
      const pipelineResult = runSHBGModulator(parsed.data, options);
      if (pipelineResult.ok) {
        setResult(pipelineResult.output.result);
        setStatus('CALCULATED');
      }
    }
  };

  const format = (value: number) => Number(value.toFixed(2));

  const freshness = useMemo(() => {
    const date = draft.panel_date.trim();
    if (!date || !isRealCalendarDate(date)) return { ageDays: null, stale: false };
    return labFreshness(date, options.calculatedAt.slice(0, 10));
  }, [draft.panel_date, options.calculatedAt]);

  const outputObject = useMemo(() => {
    if (status !== 'CALCULATED' || !result || !parsedInput.success) return null;
    const pipelineResult = runSHBGModulator(parsedInput.data, options);
    return pipelineResult.ok ? pipelineResult.output : null;
  }, [status, result, parsedInput, options]);

  return (
    <section className="pct-timing-tool mx-auto max-w-5xl space-y-4 px-4 py-6" dir={isRtl ? 'rtl' : 'ltr'} aria-labelledby="tool-015-title">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 id="tool-015-title" className="text-2xl font-black text-zinc-900 dark:text-white">{t.tool_name}</h1>
        <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-[10px] font-bold text-zinc-400">
          {t.state_label}: {status === 'CALCULATED' ? t.state_full : status === 'INVALID' ? t.state_invalid : t.state_partial}
        </span>
      </div>

      <p className="rounded-xl border border-amber-700/50 bg-amber-950/30 p-3 text-xs leading-6 text-amber-200">
        {t.disclaimer}
      </p>
      <p className="text-xs text-zinc-400">{t.fixed_lab_units}</p>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOcrOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-800/60 bg-sky-950/30 px-3 py-1.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-900/50 hover:text-sky-200"
          >
            <span>📷</span>
            <span>{t.scan_report_btn || 'Scan Lab Report'}</span>
          </button>

          {!isDemoActive ? (
            <button
              type="button"
              onClick={handleLoadDemo}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-800/60 bg-cyan-950/30 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-900/50 hover:text-cyan-200"
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

          <button
            type="button"
            onClick={calculate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-4 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-900/50"
          >
            {t.calculate}
          </button>
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

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="block space-y-1 text-sm">
          <span className="text-xs font-bold text-zinc-400">{t.total_testosterone}</span>
          <input
            aria-label={t.total_testosterone}
            className={inputClass}
            type="number"
            min="0"
            step="any"
            value={draft.total_testosterone_ng_dL}
            onChange={(e) => update('total_testosterone_ng_dL', e.target.value)}
            dir="ltr"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-xs font-bold text-zinc-400">{t.shbg}</span>
          <input
            aria-label={t.shbg}
            className={inputClass}
            type="number"
            min="0"
            step="any"
            value={draft.shbg_nmol_L}
            onChange={(e) => update('shbg_nmol_L', e.target.value)}
            dir="ltr"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-xs font-bold text-zinc-400">{t.albumin}</span>
          <input
            aria-label={t.albumin}
            className={inputClass}
            type="number"
            min="0"
            step="any"
            value={draft.albumin_g_dL}
            onChange={(e) => update('albumin_g_dL', e.target.value)}
            dir="ltr"
          />
        </label>
      </div>

      {/* Date */}
      <div className="max-w-xs space-y-1">
        <label htmlFor={`${inputGroupId}-panelDate`} className="block text-xs font-bold text-zinc-400">
          {t.field_panel_date}
        </label>
        <input
          id={`${inputGroupId}-panelDate`}
          type="text"
          dir="ltr"
          aria-label={t.field_panel_date}
          value={draft.panel_date}
          onChange={(e) => update('panel_date', e.target.value)}
          placeholder="2026-03-01"
          className={inputClass}
        />
      </div>

      {/* Status Output */}
      <div
        role="status"
        aria-live="polite"
        className={`rounded-xl border p-4 ${
          status === 'INVALID'
            ? 'border-red-700 bg-red-950/40 text-red-300'
            : status === 'CALCULATED'
              ? 'border-sky-800 bg-sky-950/30 text-sky-200'
              : 'border-zinc-800 bg-zinc-900/70 text-zinc-400'
        }`}
        data-r6-state={status === 'CALCULATED' ? 'FULL' : status}
      >
        <div className="flex items-center justify-between">
          <div>
            {status === 'PARTIAL' && <p>{t.partial_input}</p>}
            {status === 'INVALID' && <p>{t.invalid_input}</p>}
            {status === 'CALCULATED' && <p>{t.calculated_result}</p>}
          </div>

          {status === 'CALCULATED' && result && parsedInput.success && (
            <ShbgSummaryPdfButton
              locale={locale}
              totalT={parsedInput.data.total_testosterone_ng_dL}
              shbg={parsedInput.data.shbg_nmol_L}
              albumin={parsedInput.data.albumin_g_dL}
              freeT={result.free_testosterone_ng_dL}
              freeTPct={result.free_testosterone_percentage}
              bioT={result.bioavailable_testosterone_ng_dL}
              panelDate={draft.panel_date}
              labels={{ exportButton: t.export_pdf_btn }}
            />
          )}
        </div>

        {freshness.ageDays !== null && (
          <p className="mt-2 text-[11px] text-zinc-400">
            {t.freshness_label}:{' '}
            <span className={freshness.stale ? 'font-bold text-amber-300' : 'font-bold text-lime-300'}>
              {freshness.stale ? t.freshness_stale : t.freshness_current}
            </span>{' '}
            ({freshness.ageDays} {t.days_old})
          </p>
        )}
      </div>

      {/* Results Summary Box */}
      {result && status === 'CALCULATED' && (
        <section aria-labelledby="tool-015-results" className="space-y-2 rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-xs">
          <h2 id="tool-015-results" className="text-base font-semibold text-white">Results summary</h2>
          <p className="text-zinc-200">
            {t.free_testosterone}: <strong dir="ltr" className="text-emerald-400">{format(result.free_testosterone_ng_dL)} ng/dL</strong> ({format(result.free_testosterone_percentage)}%)
          </p>
          <p className="text-zinc-200">
            {t.bioavailable}: <strong dir="ltr" className="text-purple-400">{format(result.bioavailable_testosterone_ng_dL)} ng/dL</strong>
          </p>
          <p className="text-xs text-zinc-400 pt-2 border-t border-zinc-800">{t.formula_note}</p>
          <p className="text-xs text-zinc-400">{t.source_reference}</p>
          <p className="text-xs text-zinc-400">{t.guideline_reference}</p>
        </section>
      )}

      {/* ── Visual Layer (Renders in every state) ── */}
      <Tool015Visual
        locale={locale}
        totalT={parsedInput.success ? parsedInput.data.total_testosterone_ng_dL : null}
        shbg={parsedInput.success ? parsedInput.data.shbg_nmol_L : null}
        albumin={parsedInput.success ? parsedInput.data.albumin_g_dL : null}
        freeT={result ? result.free_testosterone_ng_dL : null}
        freeTPct={result ? result.free_testosterone_percentage : null}
        bioavailableT={result ? result.bioavailable_testosterone_ng_dL : null}
      />

      {/* ── GENIUS-12 Analytical Layer ── */}
      {status === 'CALCULATED' && result && parsedInput.success && outputObject && (
        <Tool015Genius
          locale={locale}
          input={parsedInput.data}
          output={outputObject}
          panelDate={draft.panel_date}
        />
      )}

      <p className="text-[11px] leading-5 text-zinc-600">
        {t.sources_intro} · {TOOL_015_SOURCES.length} {t.source_level.toLowerCase()} sources
      </p>

      {/* OCR Modal */}
      <Tool015OcrModal
        locale={locale}
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onConfirm={handleOcrConfirm}
      />

      {/* Cross-Tool Navigation */}
      <nav className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-4 text-xs md:flex-row">
        <a href={requireTool(neighbors.prevTool.slug).href} rel="prev" className="flex items-center gap-2 text-zinc-400 transition hover:text-sky-400">
          <span>←</span>
          <span>{isRtl ? `الأداة السابقة: ${neighbors.prevTool.titleAr}` : `Prev Tool: ${neighbors.prevTool.titleEn}`}</span>
        </a>
        <a href={requireTool(neighbors.nextTool.slug).href} rel="next" className="flex items-center gap-2 text-zinc-400 transition hover:text-sky-400">
          <span>{isRtl ? `الأداة التالية: ${neighbors.nextTool.titleAr}` : `Next Tool: ${neighbors.nextTool.titleEn}`}</span>
          <span>→</span>
        </a>
      </nav>

      <p className="mt-2 text-[10px] text-zinc-600">{tool.toolId} · v{tool.version}</p>
    </section>
  );
}
