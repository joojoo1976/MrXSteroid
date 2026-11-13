'use client';
/**
 * Tool #039 — Liver Enzyme Tracker: tool-owned GENIUS-12 boxes (CORE-5 inside).
 *
 * The shared R6 shell renders a generic box set for every catalog tool. Tool 039
 * owns its boxes because its content is engine-derived and must be honest:
 * every box either carries real content from the R6 pipeline output, or an
 * explicit NOT_APPLICABLE / NOT_AVAILABLE reason. Nothing is invented and no
 * AI capability is claimed.
 *
 * Box order is fixed (1..12) per R6.1-CLOSURE-LAYER:
 *   1 KPI strip (C1) · 2 Primary result (C1) · 3 How calculated (C2) ·
 *   4 Inputs summary (C2 detail) · 5 What-if · 6 Sensitivity ·
 *   7 Warnings/safety (C3) · 8 Cross-tool links · 9 Evidence/sources (C4) ·
 *   10 Export · 11 History · 12 Next actions (C5)
 *
 * Compact mode shows CORE-5 only: C1, C2, C3, C4, C5 — reusing the very same
 * renderers as the full page, so C1 is identical in both modes.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { runLiverEnzymeTracker, type LiverEnzymeTrackerBuildOptions } from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-pipeline';
import {
  TOOL_039_ALCOHOL_RANGE,
  TOOL_039_CROSS_TOOL_LINKS,
  TOOL_039_REFERENCE_LIMITS,
  TOOL_039_SOURCES,
  TOOL_039_VALUE_RANGE,
  buildLiverTrackerCsv,
  labFreshness,
  type Tool039Marker,
} from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-contract';
import { TOOL_039_HIGHLIGHT_EVENT } from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-visual';
import { Tool039HistoryList, Tool039RatingPanel } from './tool-039-liver-enzyme-tracker.history';
import type { ToolOutput } from '@/lib/tools/contracts';
import type { LiverTrackerInput, LiverTrackerResult } from '@/lib/tools/schemas/tool-039-liver-enzyme-tracker';
import { toHierarchicalHref } from '@/lib/tools/categories';
import { requireTool } from '@/lib/tools/registry';
import i18nJson from '@/i18n/tool-039-liver-enzyme-tracker.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

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

export interface LiverTrackerGeniusProps {
  locale: 'ar' | 'en';
  input: LiverTrackerInput;
  output: ToolOutput<LiverTrackerResult>;
  options: LiverEnzymeTrackerBuildOptions;
}

export default function LiverTrackerGenius({ locale, input, output, options }: LiverTrackerGeniusProps) {
  const t = pickToolI18n(i18nJson, locale);
  const isAr = locale === 'ar';
  const [compact, setCompact] = useState(false);
  const [highlightTarget, setHighlightTarget] = useState<string | null>(null);

  // SPEC.md §7.2 — the illustration's last node and the primary result box
  // highlight each other. The link is also stated in text, so colour is never
  // the only signal.
  useEffect(() => {
    const onHighlight = (event: Event) => {
      const detail = (event as CustomEvent<{ target?: string }>).detail;
      if (detail?.target) setHighlightTarget(detail.target);
    };
    window.addEventListener(TOOL_039_HIGHLIGHT_EVENT, onHighlight);
    return () => window.removeEventListener(TOOL_039_HIGHLIGHT_EVENT, onHighlight);
  }, []);

  const result = output.result;

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

  // ── Freshness (lab data = 90 days) ─────────────────────────────────────────
  const freshness = useMemo(() => {
    const dates = input.readings.map((reading) => reading.date).sort();
    const newest = dates[dates.length - 1];
    if (!newest) return { ageDays: null, stale: false, newestDate: null as string | null };
    const verdict = labFreshness(newest, options.calculatedAt.slice(0, 10));
    return { ageDays: verdict.ageDays, stale: verdict.stale, newestDate: newest };
  }, [input.readings, options.calculatedAt]);

  // ── What-if scenarios: re-run the SAME pipeline with one changed value ────
  const scenarios = useMemo(() => {
    const top = result.markers[0];
    if (!top || top.uln_multiple <= 0) return [];
    const targets = [1, 2, 3, 5];
    const readings = [...input.readings];
    const latestIndex = readings
      .map((reading, index) => ({ reading, index }))
      .filter((entry) => entry.reading.marker === top.marker)
      .sort((a, b) => (a.reading.date < b.reading.date ? 1 : -1))[0]?.index;
    if (latestIndex === undefined) return [];

    return targets.map((target) => {
      const scaled = top.latest_value * (target / top.uln_multiple);
      const rounded = Math.round(scaled * 100) / 100;
      // A scenario that changes nothing is not a scenario.
      if (rounded === top.latest_value) {
        return { target, value: rounded, status: null as string | null, outOfRange: false, unchanged: true };
      }
      if (rounded < TOOL_039_VALUE_RANGE.min || rounded > TOOL_039_VALUE_RANGE.max) {
        return { target, value: rounded, status: null as string | null, outOfRange: true, unchanged: false };
      }
      const nextReadings = readings.map((reading, index) =>
        index === latestIndex ? { ...reading, value: rounded } : reading,
      );
      const outcome = runLiverEnzymeTracker(
        { ...input, readings: nextReadings },
        options,
      );
      if (!outcome.ok) {
        return { target, value: rounded, status: null as string | null, outOfRange: false, unchanged: false };
      }
      const markerStatus = outcome.output.result.markers.find((marker) => marker.marker === top.marker);
      return {
        target,
        value: rounded,
        status: markerStatus?.status ?? null,
        outOfRange: false,
        unchanged: false,
      };
    });
  }, [result.markers, input, options]);

  // ── Sensitivity: one input changed at a time, measured on real output ─────
  const sensitivity = useMemo(() => {
    const top = result.markers[0];
    const rows: Array<{
      labelKey: string;
      kind: 'value' | 'oral' | 'alcohol';
      detail: string;
      statusChanged: boolean;
      status: string;
    }> = [];

    if (top && top.latest_value > 0) {
      const readings = [...input.readings];
      const latestIndex = readings
        .map((reading, index) => ({ reading, index }))
        .filter((entry) => entry.reading.marker === top.marker)
        .sort((a, b) => (a.reading.date < b.reading.date ? 1 : -1))[0]?.index;
      const doubled = top.latest_value * 2;
      if (latestIndex !== undefined && doubled <= TOOL_039_VALUE_RANGE.max) {
        const nextReadings = readings.map((reading, index) =>
          index === latestIndex ? { ...reading, value: doubled } : reading,
        );
        const outcome = runLiverEnzymeTracker({ ...input, readings: nextReadings }, options);
        if (outcome.ok) {
          rows.push({
            labelKey: 'sens_value_label',
            kind: 'value',
            detail: `${top.marker} ${top.latest_value} → ${doubled} ${top.unit}`,
            statusChanged: outcome.output.result.overall_status !== result.overall_status,
            status: outcome.output.result.overall_status,
          });
        }
      }
    }

    const oralFlip = runLiverEnzymeTracker(
      { ...input, oral_steroids: !input.oral_steroids },
      options,
    );
    if (oralFlip.ok) {
      rows.push({
        labelKey: 'sens_oral_label',
        kind: 'oral',
        detail: '',
        statusChanged: oralFlip.output.result.overall_status !== result.overall_status,
        status: oralFlip.output.result.overall_status,
      });
    }

    const alcoholProbe = TOOL_039_ALCOHOL_RANGE.max >= 7 ? 7 : TOOL_039_ALCOHOL_RANGE.max;
    const alcoholFlip = runLiverEnzymeTracker(
      { ...input, alcohol_drinks_per_week: alcoholProbe },
      options,
    );
    if (alcoholFlip.ok) {
      rows.push({
        labelKey: 'sens_alcohol_label',
        kind: 'alcohol',
        detail: `${input.alcohol_drinks_per_week} → ${alcoholProbe}`,
        statusChanged: alcoholFlip.output.result.overall_status !== result.overall_status,
        status: alcoholFlip.output.result.overall_status,
      });
    }

    return rows;
  }, [result, input, options]);

  // ── Safety flags derived from the engine output ───────────────────────────
  const redFlags = ((): Array<{ key: string; body: string }> => {
    const flags: Array<{ key: string; body: string }> = [];
    if (result.overall_status === 'critical') flags.push({ key: 'flag_critical', body: t.flag_critical });
    if (result.overall_status === 'high') flags.push({ key: 'flag_high', body: t.flag_high });
    if (result.stop_orals) flags.push({ key: 'flag_stop_orals', body: t.flag_stop_orals });
    const bilirubin = result.markers.find((marker) => marker.marker === 'bilirubin');
    const transaminases = result.markers.filter((marker) => marker.marker === 'ALT' || marker.marker === 'AST');
    if (
      bilirubin &&
      bilirubin.uln_multiple > 1.5 &&
      transaminases.some((marker) => marker.status === 'elevated' || marker.status === 'high')
    ) {
      flags.push({ key: 'flag_cholestatic', body: t.flag_cholestatic });
    }
    if (freshness.stale && freshness.ageDays !== null) {
      flags.push({ key: 'flag_stale', body: `${t.flag_stale_prefix} ${freshness.ageDays} ${t.days_old} (${t.freshness_stale}).` });
    }
    return flags;
  })();

  const relatedTools = useMemo(
    () =>
      TOOL_039_CROSS_TOOL_LINKS.map((link) => {
        try {
          const tool = requireTool(link.targetSlug);
          return {
            slug: link.targetSlug,
            href: toHierarchicalHref(link.targetSlug) ?? tool.href,
            title: isAr ? tool.titleAr : tool.titleEn,
            contract: link,
          };
        } catch {
          return null;
        }
      }).filter(
        (entry): entry is { slug: string; href: string; title: string; contract: (typeof TOOL_039_CROSS_TOOL_LINKS)[number] } =>
          entry !== null,
      ),
    [isAr],
  );

  // ── Shared renderers (C1 identity between compact and full) ──────────────
  const renderPrimaryResult = (): React.ReactNode => (
    <div data-r6-core="c1" className="space-y-2 text-sm">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-[10px] uppercase tracking-wide text-zinc-500">{t.overall_status}</span>
        <span className={`font-mono text-lg font-bold ${result.overall_status === 'critical' ? 'text-red-400' : result.overall_status === 'high' ? 'text-orange-400' : result.overall_status === 'elevated' ? 'text-amber-400' : 'text-lime-400'}`}>
          {statusLabel(result.overall_status)}
        </span>
      </div>
      <ul className="space-y-1">
        {result.markers.map((marker) => {
          const reference = TOOL_039_REFERENCE_LIMITS[marker.marker as Tool039Marker];
          return (
            <li key={marker.marker} className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-800 bg-zinc-950/70 px-2 py-1" dir="ltr">
              <span className="font-bold text-zinc-200">{marker.marker}</span>
              <span className="font-mono text-zinc-300">{marker.latest_value} {marker.unit}</span>
              <span className="font-mono text-zinc-500">
                {t.reference_limit}: {reference ? reference.uln : '—'} {marker.unit}
              </span>
              <span className="font-mono text-zinc-500">{marker.uln_multiple.toFixed(2)}× ULN</span>
              <span className="font-mono font-bold text-zinc-200">{statusLabel(marker.status)}</span>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-zinc-400">
        <span className="font-bold">{t.c1_confidence_label}:</span> {t.c1_confidence_value}
      </p>
      <p className="text-xs text-zinc-500">{t.c1_range_note}</p>
    </div>
  );

  const renderHowCalculated = (): React.ReactNode => (
    <div data-r6-core="c2" className="space-y-2 text-sm">
      <ul className="space-y-1 font-mono text-xs text-zinc-300">
        <li>{t.c2_formula_multiple}</li>
        <li>{t.c2_formula_trend}</li>
      </ul>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.c2_assumptions_title}</p>
        <ul className="mt-1 list-disc space-y-0.5 ps-5 text-xs text-zinc-300">
          <li>{t.c2_assumption_uln}</li>
          <li>{t.c2_assumption_units}</li>
          <li>{t.c2_assumption_trend}</li>
        </ul>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.c2_uncertainty_title}</p>
        <p className="mt-1 text-xs text-zinc-300">{t.c2_uncertainty_body}</p>
      </div>
    </div>
  );

  const renderSafety = (): React.ReactNode => (
    <div data-r6-core="c3" className="space-y-3 text-sm">
      {redFlags.length > 0 ? (
        <ul className="space-y-1" data-r6-redflags="true">
          {redFlags.map((flag) => (
            <li key={flag.key} className="rounded border border-red-900/60 bg-red-950/30 px-2 py-1 text-xs font-bold text-red-200">
              ⚠ {flag.body}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-400" data-r6-redflags="false">{t.safety_no_red_flags}</p>
      )}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.safety_contra_title}</p>
        <ul className="mt-1 list-disc space-y-0.5 ps-5 text-xs text-zinc-300">
          <li>{t.safety_contra_1}</li>
          <li>{t.safety_contra_2}</li>
          <li>{t.safety_contra_3}</li>
        </ul>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.safety_referral_title}</p>
        <ul className="mt-1 list-disc space-y-0.5 ps-5 text-xs text-zinc-300">
          <li>{t.safety_referral_1}</li>
          <li>{t.safety_referral_2}</li>
          <li>{t.safety_referral_3}</li>
        </ul>
      </div>
      {result.recommendations.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.safety_engine_title}</p>
          <ul className="mt-1 space-y-0.5 text-xs text-zinc-300" dir="ltr">
            {result.recommendations.map((recommendation) => (
              <li key={recommendation}>• {recommendation}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderEvidence = (): React.ReactNode => (
    <div data-r6-core="c4" className="space-y-2 text-sm">
      <p className="text-xs text-zinc-400">{t.box9_intro}</p>
      <ul className="space-y-2">
        {TOOL_039_SOURCES.map((source) => (
          <li key={source.id} className="rounded border border-zinc-800 bg-zinc-950/70 p-2">
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-cyan-300 underline">
              {t[source.titleKey]}
            </a>
            <p className="mt-1 text-[11px] text-zinc-400">
              {t[source.publisherKey]} · {t.box9_reviewed}: {source.reviewedOn} · {t.box9_level}: {source.evidenceLevel}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">{t[source.noteKey]}</p>
          </li>
        ))}
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
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2" data-r6-rating="local-device">
        <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box12_rating}</p>
        <Tool039RatingPanel locale={locale} />
      </div>
    </div>
  );

  const kpi = (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.overall_status}</span>
        <span className="font-mono text-sm font-bold text-zinc-100">{statusLabel(result.overall_status)}</span>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.kpi_top_multiple}</span>
        <span className="font-mono text-sm font-bold text-zinc-100">
          {result.markers[0] ? `${result.markers[0].uln_multiple.toFixed(2)}×` : '—'}
        </span>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.marker_count}</span>
        <span className="font-mono text-sm font-bold text-zinc-100">{result.markers.length}</span>
      </div>
      <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-center">
        <span className="block text-[10px] text-zinc-500">{t.freshness_label}</span>
        <span className={`text-sm font-bold ${freshness.stale ? 'text-amber-400' : 'text-lime-400'}`}>
          {freshness.ageDays === null ? '—' : freshness.stale ? t.freshness_stale : t.freshness_current}
        </span>
      </div>
    </div>
  );

  const boxes: BoxDefinition[] = [
    {
      n: 1,
      id: 'kpi',
      titleKey: 'box1_title',
      source: 'engine',
      content: <div className="space-y-2 text-sm">{kpi}<p className="text-[11px] text-zinc-500">{t.box1_note}</p></div>,
    },
    { n: 2, id: 'primary', titleKey: 'box2_title', source: 'engine', content: renderPrimaryResult() },
    { n: 3, id: 'calculated', titleKey: 'box3_title', source: 'static', content: renderHowCalculated() },
    {
      n: 4,
      id: 'inputs',
      titleKey: 'box4_title',
      source: 'engine',
      content: (
        <div data-r6-core="c2-inputs" className="space-y-2 text-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box4_readings}</p>
          <ul className="space-y-1" dir="ltr">
            {input.readings.map((reading, index) => (
              <li key={`${reading.marker}-${reading.date}-${index}`} className="rounded border border-zinc-800 bg-zinc-950/70 px-2 py-1 font-mono text-xs text-zinc-300">
                {reading.marker}: {reading.value} {reading.unit} · {reading.date}
              </li>
            ))}
          </ul>
          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{t.box4_answers}</p>
          <ul className="space-y-0.5 text-xs text-zinc-300">
            <li>{t.oral_steroids}: {input.oral_steroids ? t.yes : t.no}</li>
            <li>{t.uses_tudca}: {input.uses_tudca ? t.yes : t.no}</li>
            <li>{t.alcohol}: {input.alcohol_drinks_per_week}</li>
          </ul>
          <p className="text-[11px] text-zinc-500">{t.box4_freshness_note}</p>
        </div>
      ),
    },
    {
      n: 5,
      id: 'what-if',
      titleKey: 'box5_title',
      source: 'engine',
      content: (
        <div data-r6-core="whatif" className="space-y-2 text-sm">
          <p className="text-xs text-zinc-400">{t.box5_intro}</p>
          {scenarios.length === 0 ? (
            <p className="text-xs text-zinc-500">{t.box5_unavailable}</p>
          ) : (
            <ul className="space-y-1" dir="ltr">
              <li className="rounded border border-zinc-800 bg-zinc-950/70 px-2 py-1 font-mono text-xs text-zinc-400">
                {t.box5_current}: {result.markers[0].latest_value} {result.markers[0].unit} → {statusLabel(result.markers[0].status)}
              </li>
              {scenarios.map((scenario) => (
                <li key={scenario.target} className="rounded border border-zinc-800 bg-zinc-950/70 px-2 py-1 font-mono text-xs text-zinc-300">
                  {scenario.target}× ULN → {scenario.value} {result.markers[0].unit} → {scenario.unchanged ? t.box5_unchanged : scenario.status ? statusLabel(scenario.status) : t.box5_out_of_range}
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
    {
      n: 6,
      id: 'sensitivity',
      titleKey: 'box6_title',
      source: 'engine',
      content: (
        <div data-r6-core="sensitivity" className="space-y-2 text-sm">
          <p className="text-xs text-zinc-400">{t.box6_intro}</p>
          <ul className="space-y-1">
            {sensitivity.map((row) => (
              <li key={row.labelKey} className="rounded border border-zinc-800 bg-zinc-950/70 px-2 py-1 text-xs text-zinc-300">
                <span className="font-bold">{t[row.labelKey]}</span>{' · '}
                <span className="font-mono">
                  {row.kind === 'oral'
                    ? `${input.oral_steroids ? t.yes : t.no} → ${input.oral_steroids ? t.no : t.yes}`
                    : row.detail}
                </span>{' → '}
                <span>{row.statusChanged ? `${t.box6_effect_status} (${statusLabel(row.status)})` : t.box6_effect_no_status}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-zinc-500">{t.box6_recommendation_note}</p>
        </div>
      ),
    },
    { n: 7, id: 'safety', titleKey: 'box7_title', source: 'engine', content: renderSafety() },
    {
      n: 8,
      id: 'cross-tool',
      titleKey: 'box8_title',
      source: 'static',
      content: (
        <div data-r6-core="cross-tool" className="space-y-2 text-sm">
          <p className="text-xs text-zinc-400">{t.box8_intro}</p>
          <ul className="space-y-2">
            {relatedTools.map((tool) => (
              <li key={tool.slug} className="rounded border border-zinc-800 bg-zinc-950/70 p-2">
                <a href={tool.href} className="text-xs font-bold text-cyan-300 underline">{tool.title}</a>
                <p className="mt-1 text-[11px] font-mono text-zinc-500" dir="ltr">
                  {tool.contract.sourceToolId} → {tool.contract.targetToolId}
                </p>
                <p className="mt-1 text-[11px] text-zinc-400">
                  {t.box8_mapped_fields}: {tool.contract.mappedFields.length > 0
                    ? tool.contract.mappedFields.map((field) => `${field.from}→${field.to}${field.unit ? ` (${field.unit})` : ''}`).join(', ')
                    : t.box8_no_shared_field}
                </p>
                <p className="mt-1 text-[11px] text-zinc-400">
                  {t.box8_freshness}: {tool.contract.freshnessRule.maxAgeDays} {t.days_old}
                </p>
                <p className="mt-1 text-[11px] text-zinc-400">
                  {t.box8_stale_action}: {t.box8_stale_action_value}
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">{t.box8_link_note}</p>
                {tool.contract.noSharedFieldReason && (
                  <p className="mt-1 text-[11px] text-zinc-500">{tool.contract.noSharedFieldReason}</p>
                )}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-zinc-500">{t.box8_transfer_note}</p>
        </div>
      ),
    },
    { n: 9, id: 'evidence', titleKey: 'box9_title', source: 'static', content: renderEvidence() },
    {
      n: 10,
      id: 'export',
      titleKey: 'box10_title',
      source: 'static',
      content: (
        <div data-r6-core="export" className="space-y-2 text-sm">
          <p className="text-xs text-zinc-400">{t.box10_intro}</p>
          <button
            type="button"
            onClick={() => {
              const csv = buildLiverTrackerCsv(input, result);
              if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'tool-039-liver-enzyme-tracker.csv';
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
      ),
    },
    {
      n: 11,
      id: 'history',
      titleKey: 'box11_title',
      source: 'static',
      content: <Tool039HistoryList locale={locale} />,
    },
    { n: 12, id: 'next-actions', titleKey: 'box12_title', source: 'static', content: renderNextActions() },
  ];

  // CORE-5 in compact mode: the same renderers as the full page.
  const compactBoxes = [boxes[1], boxes[2], boxes[6], boxes[8], boxes[11]];
  const visibleBoxes = compact ? compactBoxes : boxes;

  return (
    <section className="mt-8 space-y-4" aria-label={t.genius_section_label} data-r6-genius="tool-039">
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
            className={`rounded px-3 py-1 text-xs font-bold ${compact ? 'bg-zinc-800 text-zinc-200' : 'bg-lime-500 text-slate-950'}`}
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
            onMouseEnter={box.id === 'primary' ? () => window.dispatchEvent(new CustomEvent(TOOL_039_HIGHLIGHT_EVENT, { detail: { target: 'step-5' } })) : undefined}
            onMouseLeave={box.id === 'primary' ? () => window.dispatchEvent(new CustomEvent(TOOL_039_HIGHLIGHT_EVENT, { detail: { target: '' } })) : undefined}
            onFocus={box.id === 'primary' ? () => window.dispatchEvent(new CustomEvent(TOOL_039_HIGHLIGHT_EVENT, { detail: { target: 'step-5' } })) : undefined}
            onBlur={box.id === 'primary' ? () => window.dispatchEvent(new CustomEvent(TOOL_039_HIGHLIGHT_EVENT, { detail: { target: '' } })) : undefined}
            className={`rounded border p-4 ${BOX_TINT[box.n - 1] ?? BOX_TINT[0]} ${highlightTarget === 'primary-result' && box.id === 'primary' ? 'r6-highlighted' : ''}`}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold">
                <span className="me-1 font-mono text-zinc-500">{box.n}.</span>
                {t[box.titleKey]}
              </h3>
              <span className={`rounded px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${badge.className}`}>
                {isAr ? badge.ar : badge.en}
              </span>
            </div>
            <div className="text-sm text-zinc-300">{box.content}</div>
          </article>
        );
      })}

      <section className="rounded border border-zinc-800 bg-zinc-900/60 p-4" aria-label={t.capability_title} data-r6-capability="tool-039">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold">{t.capability_title}</h3>
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-bold text-zinc-200">{t.capability_evidence}</span>
        </div>
        <dl className="space-y-2 text-sm">
          {([
            ['CAN', t.capability_can],
            ['CANNOT', t.capability_cannot],
            ['SOURCES', t.capability_sources],
            ['WHY', t.capability_why],
            ['COST', t.capability_cost],
            ['STOP', t.capability_stop],
            ['RESTORE', t.capability_restore],
          ] as Array<[string, string]>).map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <dt className="w-24 shrink-0 font-bold text-amber-600 dark:text-amber-400">{label}</dt>
              <dd className="text-zinc-300">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[11px] text-zinc-500">{t.capability_freshness_note}</p>
      </section>
    </section>
  );
}
