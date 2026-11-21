'use client';
/**
 * Tool #040 — Lipid Profile Optimizer: the tool-owned GENIUS-12 boxes.
 *
 * Tool 040 owns its twelve boxes (the shared generic shell boxes would
 * duplicate them), so the slug is registered in `R6_EXEMPT_SLUGS`.
 *
 * The box order is FIXED (CORE-5 first, then the enrichment boxes) and no box
 * is ever hidden: a box that does not apply shows NOT_APPLICABLE / NOT_AVAILABLE
 * with a real reason (SPEC-R6.1-3.b, ACC-5.5.11).
 *
 * The what-if scenarios and the sensitivity probes re-run the SAME R6 pipeline
 * with one value changed. Nothing is stored and nothing is transferred between
 * tools: this tool is compute-and-display only.
 */
import React, { useEffect, useMemo, useState } from 'react';
import type { ToolOutput } from '@/lib/tools/contracts';
import type { LipidOptimizerInput, LipidOptimizerResult } from '@/lib/tools/schemas/tool-040-lipid-profile-optimizer';
import i18nJson from '@/i18n/tool-040-lipid-profile-optimizer.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';
import {
  TOOL_040_CROSS_TOOL_LINKS,
  buildLipidOptimizerCsv,
  TOOL_040_SOURCES,
  labFreshness,
  type Tool040Band,
} from '@/lib/tools/r6/tool-040-lipid-profile-optimizer-contract';
import {
  buildLipidMarkerRows,
  type Tool040EngineResult,
} from '@/lib/tools/r6/tool-040-lipid-profile-optimizer-visual';
import { TOOL_040_HIGHLIGHT_EVENT } from './tool-040-lipid-profile-optimizer.visual';
import { runLipidProfileOptimizer } from '@/lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline';
import type { LipidProfileOptimizerBuildOptions } from '@/lib/tools/r6/tool-040-lipid-profile-optimizer-pipeline';

type BoxSource = 'engine' | 'static' | 'not_available' | 'not_applicable';

interface BoxDefinition {
  n: number;
  id: string;
  titleKey: string;
  source: BoxSource;
  content: React.ReactNode;
}

const SOURCE_BADGES: Record<BoxSource, { en: string; ar: string; className: string }> = {
  engine: { en: 'engine', ar: 'المحرك', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
  static: { en: 'static', ar: 'ثابت', className: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300' },
  not_available: { en: 'NOT_AVAILABLE', ar: 'غير متاح', className: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
  not_applicable: { en: 'NOT_APPLICABLE', ar: 'غير منطبق', className: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
};

const BOX_TINT = [
  'bg-zinc-900/60 border-zinc-800',
  'bg-emerald-950/20 border-emerald-900',
  'bg-blue-950/20 border-blue-900',
  'bg-zinc-900/60 border-zinc-800',
  'bg-cyan-950/20 border-cyan-900',
  'bg-cyan-950/20 border-cyan-900',
  'bg-orange-950/20 border-orange-900',
  'bg-teal-950/20 border-teal-900',
  'bg-purple-950/20 border-purple-900',
  'bg-zinc-900/60 border-zinc-800',
  'bg-zinc-900/60 border-zinc-800',
  'bg-yellow-950/20 border-yellow-900',
];

export interface Tool040GeniusProps {
  locale: 'ar' | 'en';
  input: LipidOptimizerInput;
  output: ToolOutput<LipidOptimizerResult>;
  options: LipidProfileOptimizerBuildOptions;
  /** The blood-draw date the user entered — the freshness anchor. */
  panelDate?: string | null;
}

export default function Tool040Genius({ locale, input, output, options, panelDate }: Tool040GeniusProps) {
  const t = pickToolI18n(i18nJson, locale);
  const isAr = locale === 'ar';
  const [compact, setCompact] = useState(false);
  const [highlightTarget, setHighlightTarget] = useState<string | null>(null);

  // SPEC §7.2 — the illustration's last node and the primary result box
  // highlight each other. The link is also stated in text, so colour is never
  // the only signal.
  useEffect(() => {
    const onHighlight = (event: Event) => {
      const detail = (event as CustomEvent<{ target?: string }>).detail;
      if (detail?.target) setHighlightTarget(detail.target);
    };
    window.addEventListener(TOOL_040_HIGHLIGHT_EVENT, onHighlight);
    return () => window.removeEventListener(TOOL_040_HIGHLIGHT_EVENT, onHighlight);
  }, []);

  const result = output.result as Tool040EngineResult;
  const rows = useMemo(() => buildLipidMarkerRows(input.panel, result), [input.panel, result]);

  const bandLabel = (band: Tool040Band): string => {
    if (band === 'optimal') return t.band_optimal;
    if (band === 'borderline') return t.band_borderline;
    if (band === 'high') return t.band_high;
    if (band === 'very-high') return t.band_very_high;
    return band;
  };

  const bandTone = (band: Tool040Band): string => {
    if (band === 'optimal') return 'text-lime-300';
    if (band === 'borderline') return 'text-amber-300';
    if (band === 'high') return 'text-orange-300';
    return 'text-red-300';
  };

  const freshness = panelDate
    ? labFreshness(panelDate, options.calculatedAt.slice(0, 10))
    : { ageDays: null, stale: false };

  /* ── What-if: the SAME pipeline, one value changed ─────────────────────── */
  const whatIf = (() => {
    const scenarios: Array<{ id: string; label: string; changed: Partial<LipidOptimizerInput> }> = [
      { id: 'ldl-edge', label: `${t.sens_ldl_label} 100 mg/dL`, changed: { panel: { ...input.panel, ldl_mg_dl: 100 } } },
      { id: 'hdl-edge', label: `${t.sens_hdl_label} 60 mg/dL`, changed: { panel: { ...input.panel, hdl_mg_dl: 60 } } },
      { id: 'tg-edge', label: `${t.sens_tg_label} 150 mg/dL`, changed: { panel: { ...input.panel, triglycerides_mg_dl: 150 } } },
    ];
    return scenarios.map((scenario) => {
      const outcome = runLipidProfileOptimizer({ ...input, ...scenario.changed }, { ...options, snapshotType: 'submitted_snapshot' });
      if (!outcome.ok) return { ...scenario, band: null, changed: false, error: true };
      const band = (outcome.output.result as Tool040EngineResult).overall_band;
      return { ...scenario, band, changed: band !== result.overall_band, error: false };
    });
  })();

  /* ── Sensitivity: which entered value moves the band the most ──────────── */
  const sensitivity = (() => {
    const probes: Array<{ id: string; label: string; changed: Partial<LipidOptimizerInput> }> = [
      { id: 'ldl', label: t.sens_ldl_label, changed: { panel: { ...input.panel, ldl_mg_dl: input.panel.ldl_mg_dl - 30 } } },
      { id: 'hdl', label: t.sens_hdl_label, changed: { panel: { ...input.panel, hdl_mg_dl: input.panel.hdl_mg_dl + 10 } } },
      { id: 'tg', label: t.sens_tg_label, changed: { panel: { ...input.panel, triglycerides_mg_dl: input.panel.triglycerides_mg_dl - 50 } } },
      { id: 'age', label: t.sens_age_label, changed: { age: input.age + 10 } },
      { id: 'sbp', label: t.sens_sbp_label, changed: { systolic_bp: input.systolic_bp + 15 } },
    ];
    return probes.map((probe) => {
      const outcome = runLipidProfileOptimizer({ ...input, ...probe.changed }, { ...options, snapshotType: 'submitted_snapshot' });
      if (!outcome.ok) return { ...probe, band: null, changed: false };
      const band = (outcome.output.result as Tool040EngineResult).overall_band;
      return { ...probe, band, changed: band !== result.overall_band };
    });
  })();

  const worstMarker = useMemo(() => {
    const rank: Record<Tool040Band, number> = { optimal: 0, borderline: 1, high: 2, 'very-high': 3 };
    return [...rows].sort((a, b) => rank[b.band] - rank[a.band])[0] ?? rows[0];
  }, [rows]);

  const kpi = (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_overall_band}</span>
        <span className={`font-mono text-sm font-bold ${bandTone(result.overall_band)}`}>{bandLabel(result.overall_band)}</span>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_worst_marker}</span>
        <span className="font-mono text-sm font-bold text-zinc-100">{worstMarker?.marker ?? '—'}</span>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_non_hdl}</span>
        <span className="font-mono text-sm font-bold text-zinc-100">{result.non_hdl} mg/dL</span>
      </div>
    </div>
  );

  const renderPrimaryResult = (): React.ReactNode => (
    <div data-r6-core="c1" className="space-y-2 text-sm">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.marker} className="rounded border border-zinc-800 bg-zinc-950/70 p-2">
            <span className="block text-[10px] text-zinc-500">{row.marker}</span>
            <span className="font-mono text-sm font-bold text-zinc-100">{row.value} {row.unit}</span>
            <span className={`block text-[11px] font-bold ${bandTone(row.band)}`}>{bandLabel(row.band)}</span>
            {/* The reference edge of the optimal band - the range C1 must show. */}
            <span className="block text-[10px] text-zinc-500">
              {t.c1_range_note}: <span className="font-mono">{row.referenceLimit} {row.unit}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-zinc-400">{t.c1_confidence_value}</p>
      <p className="text-xs text-zinc-300">
        {t.non_hdl}: <span className="font-mono font-bold text-cyan-300">{result.non_hdl} mg/dL</span>
      </p>
      <p className="text-[11px] text-zinc-500">{t.c1_range_note}</p>
      {freshness.ageDays !== null && (
        <p className="text-[11px] text-zinc-500">
          {t.freshness_label}:{' '}
          <span className={freshness.stale ? 'font-bold text-amber-300' : 'font-bold text-lime-300'}>
            {freshness.stale ? t.freshness_stale : t.freshness_current}
          </span>{' '}
          ({freshness.ageDays} {t.days_old})
        </p>
      )}
    </div>
  );

  const renderHowCalculated = (): React.ReactNode => (
    <div data-r6-core="c2" className="space-y-2 text-sm">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box3_formula_label}</p>
        <p className="mt-1 font-mono text-[11px] text-zinc-300">{t.c1_formula_band}</p>
        <p className="mt-1 font-mono text-[11px] text-zinc-300">{t.c2_formula_multiple}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box3_inputs_label}</p>
        <ul className="mt-1 space-y-0.5 text-[11px] text-zinc-400">
          {rows.map((row) => (
            <li key={row.marker} className="font-mono">
              {row.marker}: {row.value} {row.unit}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box3_assumptions_label}</p>
        <p className="mt-1 text-[11px] text-zinc-400">{t.c2_assumptions}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box3_uncertainty_label}</p>
        <p className="mt-1 text-[11px] text-zinc-400">{t.c2_uncertainty}</p>
      </div>
    </div>
  );

  const renderInputsSummary = (): React.ReactNode => (
    <div data-r6-core="inputs" className="space-y-2 text-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box4_readings_label}</p>
      <ul className="space-y-0.5 text-[11px] text-zinc-300">
        {rows.map((row) => (
          <li key={row.marker} className="font-mono">
            {row.marker}: {row.value} {row.unit}
          </li>
        ))}
        <li className="font-mono text-zinc-500">
          {t.field_total_cholesterol}: {input.panel.total_cholesterol_mg_dl ?? `${t.box4_not_entered}`}
        </li>
      </ul>
      <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box4_context_label}</p>
      <ul className="space-y-0.5 text-[11px] text-zinc-300">
        <li>{t.field_age}: {input.age}</li>
        <li>{t.field_smoker}: {input.smoker ? t.yes_yes ?? 'yes' : 'no'}</li>
        <li>{t.field_sbp}: {input.systolic_bp} mmHg</li>
        <li>{t.field_on_cycle}: {input.on_cycle ? 'yes' : 'no'}</li>
        <li>{t.field_weeks_remaining}: {input.weeks_remaining}</li>
        {panelDate && (
          <li>
            {t.field_panel_date}: {panelDate} ({freshness.stale ? t.freshness_stale : t.freshness_current})
          </li>
        )}
      </ul>
      {input.panel.total_cholesterol_mg_dl === undefined && (
        <p className="text-[11px] text-zinc-500">{t.box4_total_estimated}</p>
      )}
      <p className="text-[11px] text-zinc-500">{t.box4_freshness_note}</p>
    </div>
  );

  const renderWhatIf = (): React.ReactNode => (
    <div data-r6-core="what-if" className="space-y-2 text-sm">
      <p className="text-[11px] text-zinc-400">{t.box5_intro}</p>
      <ul className="space-y-1">
        {whatIf.map((scenario) => (
          <li key={scenario.id} className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px]">
            <span className="font-bold text-zinc-200">{scenario.label}</span>
            <span className="ms-2 text-zinc-400">
              {scenario.error
                ? t.box5_out_of_range
                : scenario.changed
                  ? `${t.box5_current}: ${bandLabel(result.overall_band)} → ${bandLabel(scenario.band as Tool040Band)}`
                  : `${t.box5_current}: ${bandLabel(result.overall_band)} · ${t.box5_unchanged}`}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-zinc-500">{t.box5_recommendation_note}</p>
    </div>
  );

  const renderSensitivity = (): React.ReactNode => (
    <div data-r6-core="sensitivity" className="space-y-2 text-sm">
      <p className="text-[11px] text-zinc-400">{t.box6_intro}</p>
      <ul className="space-y-1">
        {sensitivity.map((probe) => (
          <li key={probe.id} className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px]">
            <span className="font-bold text-zinc-200">{probe.label}</span>
            <span className="ms-2 text-zinc-400">
              {probe.band === null
                ? t.box5_out_of_range
                : probe.changed
                  ? `${t.box6_effect_status}: ${bandLabel(result.overall_band)} → ${bandLabel(probe.band)}`
                  : t.box6_effect_no_status}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-zinc-500">{t.box6_effect_recommendation}</p>
    </div>
  );

  const renderSafety = (): React.ReactNode => (
    <div data-r6-core="c3" className="space-y-2 text-sm">
      <p className="text-xs text-amber-200">{t.safety_title}</p>
      <p className="text-[11px] text-zinc-300">{t.safety_red_flag}</p>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.safety_referral}</p>
        <ul className="mt-1 list-disc space-y-0.5 ps-4 text-[11px] text-zinc-300">
          <li>{t.safety_referral_1}</li>
          <li>{t.safety_referral_2}</li>
          <li>{t.safety_referral_3}</li>
        </ul>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.safety_do_not}</p>
        <ul className="mt-1 list-disc space-y-0.5 ps-4 text-[11px] text-zinc-300">
          <li>{t.safety_do_not_1}</li>
          <li>{t.safety_do_not_2}</li>
        </ul>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.safety_stop}</p>
        <p className="mt-1 text-[11px] text-zinc-300">{t.safety_stop_body}</p>
      </div>
    </div>
  );

  const renderCrossTool = (): React.ReactNode => (
    <div data-r6-core="cross-tool" className="space-y-2 text-sm">
      <p className="text-[11px] text-zinc-400">{t.box8_intro}</p>
      <ul className="space-y-2">
        {TOOL_040_CROSS_TOOL_LINKS.map((link) => (
          <li key={link.targetToolId} className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px]">
            <p className="font-bold text-zinc-200">{link.targetToolId}</p>
            <p className="mt-1 text-zinc-400">
              <span className="font-bold">{t.box8_mapped_fields}:</span>{' '}
              {link.mappedFields.map((field) => field.targetField).join(', ')}
            </p>
            <p className="text-zinc-400">
              <span className="font-bold">{t.box8_freshness}:</span> {link.freshnessRule}
            </p>
            <p className="text-zinc-400">
              <span className="font-bold">{t.box8_stale_action}:</span> {link.staleAction}
            </p>
            <p className="text-zinc-500">
              <span className="font-bold">{t.box8_link_note}:</span> {link.transfer}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-zinc-500">{t.box8_no_shared_field}</p>
    </div>
  );

  const renderSources = (): React.ReactNode => (
    <div data-r6-core="c4" className="space-y-2 text-sm">
      <p className="text-[11px] text-zinc-400">{t.sources_intro}</p>
      <ul className="space-y-1">
        {TOOL_040_SOURCES.map((source) => (
          <li key={source.id} className="rounded border border-zinc-800 bg-zinc-950/70 p-2">
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-cyan-300 underline">
              {t[source.titleKey]}
            </a>
            <p className="mt-1 text-[11px] text-zinc-400">
              {source.publisher} · {t.source_reviewed}: {source.reviewedOn} · {t.source_level}: {source.evidenceLevel}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">{t[source.noteKey]}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderExport = (): React.ReactNode => (
    <div data-r6-core="export" className="space-y-2 text-sm">
      <p className="text-xs text-zinc-400">{t.box10_intro}</p>
      <button
        type="button"
        onClick={() => {
          if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
          const csv = buildExportCsv();
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'tool-040-lipid-profile-optimizer.csv';
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
        }}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-100 hover:bg-zinc-700"
      >
        {t.box10_button}
      </button>
      <p className="text-[11px] text-zinc-500">{t.box10_note}</p>
    </div>
  );

  // The CSV is produced by the R6 contract, in the browser only.
  const buildExportCsv = (): string => buildLipidOptimizerCsv(input, result);

  const renderCapability = (): React.ReactNode => (
    <div data-r6-core="capability" className="space-y-2 text-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.capability_title}</p>
      <ul className="space-y-1 text-[11px]">
        <li><span className="font-bold text-lime-300">{t.capability_can}</span> · <span className="text-zinc-300">{t.capability_can_text}</span></li>
        <li><span className="font-bold text-red-300">{t.capability_cannot}</span> · <span className="text-zinc-300">{t.capability_cannot_text}</span></li>
        <li><span className="font-bold text-cyan-300">{t.capability_sources}</span> · <span className="text-zinc-300">{t.capability_sources_text}</span></li>
        <li><span className="font-bold text-zinc-300">{t.capability_why}</span> · <span className="text-zinc-300">{t.capability_why_text}</span></li>
        <li><span className="font-bold text-zinc-300">{t.capability_cost}</span> · <span className="text-zinc-300">{t.capability_cost_text}</span></li>
        <li><span className="font-bold text-zinc-300">{t.capability_stop}</span> · <span className="text-zinc-300">{t.capability_stop_text}</span></li>
        <li><span className="font-bold text-zinc-300">{t.capability_restore}</span> · <span className="text-zinc-300">{t.capability_restore_text}</span></li>
      </ul>
    </div>
  );

  const renderNextActions = (): React.ReactNode => (
    <div data-r6-core="c5" className="space-y-2 text-sm">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box12_next}</p>
        <p className="mt-1 text-xs text-zinc-200">{t.box12_next_body}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box12_not}</p>
        <p className="mt-1 text-xs text-zinc-200">{t.box12_not_body}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box12_doctor}</p>
        <p className="mt-1 text-xs text-zinc-200">{t.box12_doctor_body}</p>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2" data-r6-rating="not_available">
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box12_rating}</p>
        <p className="mt-1 text-xs text-zinc-400">{t.box12_rating_na}</p>
      </div>
    </div>
  );

  const boxes: BoxDefinition[] = [
    { n: 1, id: 'kpi', titleKey: 'box1_title', source: 'engine', content: <div className="space-y-2 text-sm">{kpi}<p className="text-[11px] text-zinc-500">{t.box1_note}</p></div> },
    { n: 2, id: 'primary', titleKey: 'box2_title', source: 'engine', content: renderPrimaryResult() },
    { n: 3, id: 'calculated', titleKey: 'box3_title', source: 'static', content: renderHowCalculated() },
    { n: 4, id: 'inputs', titleKey: 'box4_title', source: 'static', content: renderInputsSummary() },
    { n: 5, id: 'what-if', titleKey: 'box5_title', source: 'engine', content: renderWhatIf() },
    { n: 6, id: 'sensitivity', titleKey: 'box6_title', source: 'engine', content: renderSensitivity() },
    { n: 7, id: 'safety', titleKey: 'box7_title', source: 'engine', content: renderSafety() },
    { n: 8, id: 'cross-tool', titleKey: 'box8_title', source: 'static', content: renderCrossTool() },
    { n: 9, id: 'sources', titleKey: 'box9_title', source: 'static', content: renderSources() },
    { n: 10, id: 'export', titleKey: 'box10_title', source: 'static', content: renderExport() },
    {
      n: 11,
      id: 'history',
      titleKey: 'box11_title',
      source: 'not_applicable',
      content: <p className="text-xs text-zinc-400">{t.box11_na}</p>,
    },
    { n: 12, id: 'next-actions', titleKey: 'box12_title', source: 'static', content: renderNextActions() },
  ];

  // CORE-5 in compact mode: the same renderers as the full page.
  const compactBoxes = [boxes[1], boxes[2], boxes[6], boxes[8], boxes[11]];
  const visibleBoxes = compact ? compactBoxes : boxes;

  return (
    <section className="mt-8 space-y-4" aria-label={t.genius_section_label} data-r6-genius="tool-040">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{compact ? t.genius_title_compact : t.genius_title}</h2>
        <div className="flex gap-2" role="group" aria-label={t.genius_mode_label}>
          <button
            type="button"
            onClick={() => setCompact(true)}
            aria-pressed={compact}
            className={`rounded px-3 py-1 text-xs font-bold ${compact ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-200'}`}
          >
            {t.genius_compact}
          </button>
          <button
            type="button"
            onClick={() => setCompact(false)}
            aria-pressed={!compact}
            className={`rounded px-3 py-1 text-xs font-bold ${!compact ? 'bg-lime-500 text-slate-950' : 'bg-zinc-800 text-zinc-200'}`}
          >
            {t.genius_full}
          </button>
        </div>
      </div>

      {visibleBoxes.map((box) => {
        const badge = SOURCE_BADGES[box.source];
        return (
          <article
            key={box.id}
            data-r6-box={String(box.n)}
            data-r6-box-id={box.id}
            data-r6-box-source={box.source}
            data-r6-highlight-target={box.id === 'primary' ? 'primary-result' : undefined}
            onMouseEnter={box.id === 'primary' ? () => window.dispatchEvent(new CustomEvent(TOOL_040_HIGHLIGHT_EVENT, { detail: { target: 'step-5' } })) : undefined}
            onMouseLeave={box.id === 'primary' ? () => window.dispatchEvent(new CustomEvent(TOOL_040_HIGHLIGHT_EVENT, { detail: { target: '' } })) : undefined}
            onFocus={box.id === 'primary' ? () => window.dispatchEvent(new CustomEvent(TOOL_040_HIGHLIGHT_EVENT, { detail: { target: 'step-5' } })) : undefined}
            onBlur={box.id === 'primary' ? () => window.dispatchEvent(new CustomEvent(TOOL_040_HIGHLIGHT_EVENT, { detail: { target: '' } })) : undefined}
            className={`rounded border p-4 ${BOX_TINT[box.n - 1] ?? BOX_TINT[0]} ${highlightTarget === 'primary-result' && box.id === 'primary' ? 'r6-highlighted' : ''}`}
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold">
                <span className="me-1 font-mono text-zinc-500">{box.n}.</span>
                {t[box.titleKey]}
              </h3>
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}>
                {isAr ? badge.ar : badge.en}
              </span>
            </div>
            {box.content}
          </article>
        );
      })}

      {renderCapability()}
    </section>
  );
}
