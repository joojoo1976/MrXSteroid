'use client';
/**
 * Tool #039 — Liver Enzyme Tracker: explanatory illustration + real data charts.
 *
 * Every number rendered here comes from the validated input the user typed and
 * from the R6 pipeline output (`output.result`). There is no default dataset,
 * no averaged point and no synthetic series: a chart is drawn only for the
 * readings that exist, and an empty/incomplete state is shown instead.
 *
 * Interaction contract (SPEC.md §6.7 / §7.2 / §15):
 *   - every meaningful visual element has its OWN tooltip content;
 *   - hover, keyboard focus and tap/click all open it;
 *   - Escape and an explicit labelled close button dismiss it;
 *   - the tooltip is clamped inside the viewport;
 *   - essential information is never hover-only (aria-label + a data table);
 *   - the illustration's final node and the primary result box highlight each
 *     other (colour is never the only signal: a text label states the link).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ToolOutput } from '@/lib/tools/contracts';
import type { LiverTrackerInput, LiverTrackerResult } from '@/lib/tools/schemas/tool-039-liver-enzyme-tracker';
import {
  TOOL_039_HIGHLIGHT_EVENT,
  TOOL_039_PIE_DONUT_DECISION,
  TOOL_039_VISUAL_MARKERS,
  buildLiverTrackerBars,
  buildLiverTrackerBarTooltip,
  buildLiverTrackerPointTooltip,
  buildLiverTrackerSeries,
  buildLiverTrackerTable,
  type Tool039BarRow,
  type Tool039MarkerSeries,
  type Tool039TooltipPayload,
} from '@/lib/tools/r6/tool-039-liver-enzyme-tracker-visual';
import i18nJson from '@/i18n/tool-039-liver-enzyme-tracker.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';

export interface LiverTrackerVisualProps {
  locale: 'ar' | 'en';
  /**
   * The validated input. `null` while the form is incomplete — the
   * EXPLANATORY part of this component (the diagram) does not depend on it.
   */
  input?: LiverTrackerInput | null;
  /**
   * The pipeline output. `null` until a complete, valid input has been
   * calculated — the DATA-DRIVEN part of this component (bars, line chart,
   * table) depends on it and is not rendered without it.
   */
  output?: ToolOutput<LiverTrackerResult> | null;
}

interface OpenTooltip {
  id: string;
  payload: Tool039TooltipPayload;
  rect: DOMRect;
  /** A tooltip opened by click/tap stays until it is dismissed explicitly. */
  persistent: boolean;
}

const TOOLTIP_WIDTH = 320;

export default function LiverTrackerVisual({ locale, input, output }: LiverTrackerVisualProps) {
  const t = pickToolI18n(i18nJson, locale);
  const isAr = locale === 'ar';
  const [tooltip, setTooltip] = useState<OpenTooltip | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [tooltipHeight, setTooltipHeight] = useState(220);

  // The tooltip node is measured through a callback ref (outside render), so the
  // height that drives the viewport clamping is always the real one.
  const tooltipRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setTooltipHeight(node.offsetHeight || 220);
  }, []);

  // The EXPLANATORY part of this section (the diagram, its five steps and its
  // tooltips) needs no calculation result and is therefore rendered in every
  // state — EMPTY, PARTIAL, INVALID, DEGRADED and FULL alike. The DATA-DRIVEN
  // part (bar/gauge, dated line chart, data table) needs a real result; without
  // one nothing is drawn and no value is invented (SPEC-R6.1-1.f, ACC-5.5.11).
  const hasResult = Boolean(input && output);

  const series = useMemo(
    () => (input && output ? buildLiverTrackerSeries(input, output.result) : []),
    [input, output],
  );
  const bars = useMemo(() => buildLiverTrackerBars(series), [series]);
  const table = useMemo(() => buildLiverTrackerTable(series), [series]);
  const trendSeries = useMemo(() => series.filter((entry) => entry.hasTrend), [series]);

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

  const markerMeaning = (marker: string): string => t[`marker_meaning_${marker.toLowerCase()}`] ?? t.marker_meaning_generic;
  const markerExplanation = (marker: string): string => t[`marker_explanation_${marker.toLowerCase()}`] ?? t.marker_explanation_generic;

  const warningFor = (status: string): string | null => {
    if (status === 'critical') return t.warning_critical;
    if (status === 'high') return t.warning_high;
    if (status === 'elevated') return t.warning_elevated;
    return null;
  };

  const openTooltip = useCallback((id: string, payload: Tool039TooltipPayload, rect: DOMRect, persistent = false) => {
    setTooltip({ id, payload, rect, persistent });
  }, []);

  const closeTooltip = useCallback(() => setTooltip(null), []);

  // Escape closes the tooltip from anywhere.
  useEffect(() => {
    if (!tooltip) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setTooltip(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [tooltip]);

  // Cross-highlight between the illustration node and the primary result box.
  useEffect(() => {
    const onHighlight = (event: Event) => {
      const detail = (event as CustomEvent<{ target?: string }>).detail;
      if (detail?.target) setHighlight(detail.target);
    };
    window.addEventListener(TOOL_039_HIGHLIGHT_EVENT, onHighlight);
    return () => window.removeEventListener(TOOL_039_HIGHLIGHT_EVENT, onHighlight);
  }, []);

  const emitHighlight = (target: string) => {
    window.dispatchEvent(new CustomEvent(TOOL_039_HIGHLIGHT_EVENT, { detail: { target } }));
  };

  // Tooltip placement: keep it inside the viewport, flip above when needed.
  const tooltipStyle = useMemo(() => {
    if (!tooltip) return undefined;
    const rect = tooltip.rect;
    const height = tooltipHeight;
    const viewportWidth = typeof window === 'undefined' ? 1024 : window.innerWidth;
    const viewportHeight = typeof window === 'undefined' ? 768 : window.innerHeight;
    let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    let top = rect.bottom + 8;
    if (top + height > viewportHeight - 8) {
      top = Math.max(8, rect.top - height - 8);
    }
    left = Math.min(Math.max(8, left), Math.max(8, viewportWidth - TOOLTIP_WIDTH - 8));
    return {
      position: 'fixed' as const,
      left: `${Math.round(left)}px`,
      top: `${Math.round(top)}px`,
      width: `${TOOLTIP_WIDTH}px`,
      maxWidth: `min(${TOOLTIP_WIDTH}px, calc(100vw - 16px))`,
      zIndex: 130,
    };
  }, [tooltip, tooltipHeight]);

  const barTooltip = (bar: Tool039BarRow) =>
    buildLiverTrackerBarTooltip(bar, {
      meaning: markerMeaning(bar.marker),
      explanation: markerExplanation(bar.marker),
      formula: t.c2_formula_multiple,
      source: t.tooltip_source_engine,
      warning: warningFor(bar.status),
      limitation: t.tooltip_limitation_reference,
    });

  const pointTooltip = (entry: Tool039MarkerSeries, pointIndex: number) => {
    const point = entry.points[pointIndex];
    return buildLiverTrackerPointTooltip(point, entry, {
      meaning: markerMeaning(entry.marker),
      explanation: markerExplanation(entry.marker),
      formula: t.c2_formula_multiple,
      source: t.tooltip_source_engine,
      warning: warningFor(entry.status),
      limitation: t.tooltip_limitation_reference,
    });
  };

  const barAriaLabel = (bar: Tool039BarRow) =>
    `${bar.marker}: ${bar.value} ${bar.unit}, ${bar.ulnMultiple.toFixed(2)}× ULN, ${statusLabel(bar.status)}. ${markerMeaning(bar.marker)}`;

  const pointAriaLabel = (entry: Tool039MarkerSeries, pointIndex: number) => {
    const point = entry.points[pointIndex];
    return `${entry.marker} ${point.date}: ${point.value} ${point.unit}, ${point.ulnMultiple.toFixed(2)}× ULN, ${statusLabel(point.status)}. ${markerMeaning(entry.marker)}`;
  };

  const renderTooltipBody = (payload: Tool039TooltipPayload) => (
    <div className="space-y-1 text-xs">
      <p className="font-bold text-zinc-900">{payload.title}</p>
      <p className="text-zinc-700">
        <span className="font-bold">{t.tooltip_meaning_label}:</span> {payload.meaning}
      </p>
      <p className="text-zinc-700">
        <span className="font-bold">{t.tooltip_value_label}:</span> {payload.value}
        {payload.unit ? ` ${payload.unit}` : ''}
      </p>
      {payload.ratio && (
        <p className="text-zinc-700">
          <span className="font-bold">{t.tooltip_ratio_label}:</span> {payload.ratio}
        </p>
      )}
      <p className="text-zinc-700">
        <span className="font-bold">{t.tooltip_explanation_label}:</span> {payload.explanation}
      </p>
      {payload.formula && (
        <p className="font-mono text-zinc-600">
          <span className="font-bold">{t.tooltip_formula_label}:</span> {payload.formula}
        </p>
      )}
      <p className="text-zinc-600">
        <span className="font-bold">{t.tooltip_source_label}:</span> {payload.source}
      </p>
      {payload.warning && (
        <p className="font-bold text-red-700">
          <span className="font-bold">{t.tooltip_warning_label}:</span> {payload.warning}
        </p>
      )}
      {payload.limitation && (
        <p className="text-zinc-600">
          <span className="font-bold">{t.tooltip_limitation_label}:</span> {payload.limitation}
        </p>
      )}
    </div>
  );

  const lineChart = (entry: Tool039MarkerSeries) => {
    const width = 640;
    const height = 200;
    const padding = { top: 16, right: 16, bottom: 34, left: 48 };
    const values = entry.points.map((point) => point.value);
    const maxValue = Math.max(...values, entry.referenceLimit) * 1.15;
    const minValue = Math.min(...values, 0);
    const span = maxValue - minValue || 1;
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const xFor = (index: number) =>
      padding.left + (entry.points.length === 1 ? plotWidth / 2 : (index / (entry.points.length - 1)) * plotWidth);
    const yFor = (value: number) => padding.top + plotHeight - ((value - minValue) / span) * plotHeight;
    const path = entry.points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index).toFixed(1)} ${yFor(point.value).toFixed(1)}`).join(' ');

    return (
      <figure className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
        <figcaption className="mb-2 text-xs font-bold text-zinc-200">
          {t.chart_line_title} — {entry.marker}
        </figcaption>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-label={`${t.chart_line_title} — ${entry.marker}. ${t.chart_line_aria_desc}`}
          data-r6-chart="line"
          data-r6-chart-marker={entry.marker}
        >
          <title>{`${t.chart_line_title} — ${entry.marker}`}</title>
          <desc>{t.chart_line_aria_desc}</desc>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={yFor(entry.referenceLimit)}
            y2={yFor(entry.referenceLimit)}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="6 4"
          />
          <text x={padding.left} y={yFor(entry.referenceLimit) - 6} fill="#fbbf24" fontSize="11">
            {`${t.chart_legend_reference}: ${entry.referenceLimit} ${entry.unit}`}
          </text>
          <path d={path} fill="none" stroke="#38bdf8" strokeWidth={2} />
          {entry.points.map((point, index) => (
            <g key={`${point.date}-${index}`}>
              <circle
                cx={xFor(index)}
                cy={yFor(point.value)}
                r={6}
                fill={point.isLatest ? '#22c55e' : '#0ea5e9'}
                stroke="#0f172a"
                strokeWidth={2}
                tabIndex={0}
                role="button"
                aria-label={pointAriaLabel(entry, index)}
                data-r6-point={`${entry.marker}-${point.date}`}
                className="r6-chart-point"
                onMouseEnter={(event) => openTooltip(`point-${entry.marker}-${index}`, pointTooltip(entry, index), event.currentTarget.getBoundingClientRect())}
                onMouseLeave={() => setTooltip((current) => (current?.persistent ? current : null))}
                onPointerEnter={(event) => openTooltip(`point-${entry.marker}-${index}`, pointTooltip(entry, index), event.currentTarget.getBoundingClientRect())}
                onPointerLeave={() => setTooltip((current) => (current?.persistent ? current : null))}
                onFocus={(event) => openTooltip(`point-${entry.marker}-${index}`, pointTooltip(entry, index), event.currentTarget.getBoundingClientRect())}
                onBlur={() => setTooltip((current) => (current?.persistent ? current : null))}
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const payload = pointTooltip(entry, index);
                  setTooltip((current) =>
                    current && current.id === `point-${entry.marker}-${index}` && current.persistent
                      ? null
                      : { id: `point-${entry.marker}-${index}`, payload, rect, persistent: true },
                  );
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    const rect = event.currentTarget.getBoundingClientRect();
                    openTooltip(`point-${entry.marker}-${index}`, pointTooltip(entry, index), rect, true);
                  }
                }}
              />
              <text x={xFor(index)} y={height - 12} fill="#a1a1aa" fontSize="10" textAnchor="middle">
                {point.date}
              </text>
              <text x={xFor(index)} y={yFor(point.value) - 12} fill="#e4e4e7" fontSize="10" textAnchor="middle">
                {point.value}
              </text>
            </g>
          ))}
        </svg>
      </figure>
    );
  };

  /**
   * The five steps of the explanation. ONE source of truth: the desktop SVG
   * (scaled down on a phone) and the mobile HTML stack (readable text) render
   * the same steps, so no step, connector or meaning can be lost.
   */
  const diagramSteps = [
    { id: 'step-1', x: 10, title: t.step1_title, body: t.step1_body },
    { id: 'step-2', x: 155, title: t.step2_title, body: t.step2_body },
    { id: 'step-3', x: 300, title: t.step3_title, body: t.step3_body },
    { id: 'step-4', x: 445, title: t.step4_title, body: t.step4_body },
    { id: 'step-5', x: 590, title: t.step5_title, body: t.step5_body },
  ];

  const stepTooltipPayload = (node: { title: string; body: string }) => ({
    title: node.title,
    meaning: node.body,
    value: '—',
    unit: null,
    ratio: null,
    explanation: t.illustration_caption,
    formula: null,
    source: t.tooltip_source_engine,
    warning: null,
    limitation: t.tooltip_limitation_illustration,
  });

  return (
    <section className="space-y-5" aria-label={t.visual_section_label} data-r6-visual="tool-039">
      <h3 className="text-sm font-bold text-zinc-300">{t.visual_section_title}</h3>

      {/* ── Explanatory illustration ───────────────────────────────────────── */}
      <figure className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <figcaption className="mb-2">
          <p className="text-sm font-bold text-zinc-100">{t.illustration_title}</p>
          <p className="mt-1 text-[11px] text-amber-300">{t.illustration_caption}</p>
        </figcaption>

        {/* Desktop: the SVG diagram with its directional connectors. */}
        <div className="hidden md:block">
        <svg
          viewBox="0 0 720 200"
          className="h-auto w-full"
          role="img"
          aria-labelledby="liver-illustration-title"
          aria-describedby="liver-illustration-desc"
          data-r6-illustration="tool-039"
        >
          <title id="liver-illustration-title">{t.illustration_title}</title>
          <desc id="liver-illustration-desc">{t.illustration_desc}</desc>
          {diagramSteps.map((node, index) => {
            // For RTL layout, reverse the horizontal sequence so Step 1 is on the right and flows naturally to Step 5 on the left
            const xPos = isAr ? (590 - index * 145) : node.x;
            const arrowStartX = isAr ? (xPos + 118 + 22) : (xPos - 22);
            const arrowEndX = isAr ? (xPos + 118 + 6) : (xPos - 6);

            return (
              <g key={node.id}>
                {index > 0 && (
                  <path
                    d={`M ${arrowStartX} 100 L ${arrowEndX} 100`}
                    stroke="#a1a1aa"
                    strokeWidth={2}
                    markerEnd="url(#liver-arrow)"
                  />
                )}
                <g
                  tabIndex={0}
                  role="button"
                  aria-label={`${node.title}. ${node.body}`}
                  data-r6-illustration-node={node.id}
                  className={`r6-illustration-node ${highlight === node.id ? 'r6-highlighted' : ''}`}
                  onMouseEnter={(event) => openTooltip(node.id, {
                    title: node.title,
                    meaning: node.body,
                    value: '—',
                    unit: null,
                    ratio: null,
                    explanation: t.illustration_caption,
                    formula: null,
                    source: t.tooltip_source_engine,
                    warning: null,
                    limitation: t.tooltip_limitation_illustration,
                  }, event.currentTarget.getBoundingClientRect())}
                  onMouseLeave={() => setTooltip((current) => (current?.persistent ? current : null))}
                  onPointerEnter={(event) => openTooltip(node.id, {
                    title: node.title,
                    meaning: node.body,
                    value: '—',
                    unit: null,
                    ratio: null,
                    explanation: t.illustration_caption,
                    formula: null,
                    source: t.tooltip_source_engine,
                    warning: null,
                    limitation: t.tooltip_limitation_illustration,
                  }, event.currentTarget.getBoundingClientRect())}
                  onPointerLeave={() => setTooltip((current) => (current?.persistent ? current : null))}
                  onFocus={(event) => {
                    openTooltip(node.id, {
                      title: node.title,
                      meaning: node.body,
                      value: '—',
                      unit: null,
                      ratio: null,
                      explanation: t.illustration_caption,
                      formula: null,
                      source: t.tooltip_source_engine,
                      warning: null,
                      limitation: t.tooltip_limitation_illustration,
                    }, event.currentTarget.getBoundingClientRect());
                    if (node.id === 'step-5') emitHighlight('primary-result');
                  }}
                  onBlur={() => {
                    setTooltip((current) => (current?.persistent ? current : null));
                    if (node.id === 'step-5') emitHighlight('');
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      const rect = event.currentTarget.getBoundingClientRect();
                      openTooltip(node.id, {
                        title: node.title,
                        meaning: node.body,
                        value: '—',
                        unit: null,
                        ratio: null,
                        explanation: t.illustration_caption,
                        formula: null,
                        source: t.tooltip_source_engine,
                        warning: null,
                        limitation: t.tooltip_limitation_illustration,
                      }, rect, true);
                    }
                  }}
                >
                  <rect
                    x={xPos}
                    y={42}
                    width={118}
                    height={116}
                    rx={10}
                    fill={highlight === node.id ? '#1e293b' : '#0f172a'}
                    stroke={highlight === node.id ? '#f59e0b' : '#3f3f46'}
                    strokeWidth={highlight === node.id ? 3 : 1.5}
                  />
                  {/* Step badge */}
                  <rect
                    x={isAr ? xPos + 118 - 30 : xPos + 8}
                    y={50}
                    width={22}
                    height={18}
                    rx={4}
                    fill="#27272a"
                  />
                  <text
                    x={isAr ? xPos + 118 - 19 : xPos + 19}
                    y={63}
                    fill="#fbbf24"
                    fontSize="10"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {index + 1}
                  </text>
                  <text
                    x={isAr ? xPos + 118 - 36 : xPos + 34}
                    y={64}
                    fill="#f4f4f5"
                    fontSize="10"
                    fontWeight="700"
                    textAnchor={isAr ? 'end' : 'start'}
                  >
                    {node.title.replace(/^\d+\.\s*/, '')}
                  </text>
                  <foreignObject x={xPos + 8} y={76} width={102} height={74}>
                    <div
                      className={`h-full flex items-start text-[10px] leading-relaxed text-zinc-300 overflow-hidden ${
                        isAr ? 'text-right' : 'text-left'
                      }`}
                      dir={isAr ? 'rtl' : 'ltr'}
                    >
                      <p className="m-0 break-words">{node.body}</p>
                    </div>
                  </foreignObject>
                </g>
              </g>
            );
          })}
          <defs>
            <marker id="liver-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="#a1a1aa" />
            </marker>
          </defs>
        </svg>
        </div>

        {/* Phone: the same five steps as real, readable HTML text (13/12 px),
            with the same connectors, tooltips and result-box relationship. */}
        <ol className="space-y-2 md:hidden" data-r6-illustration-mobile="tool-039">
          {diagramSteps.map((node, index) => (
            <li key={node.id} className="relative">
              {index > 0 && (
                <span aria-hidden="true" className="absolute -top-2 left-4 rtl:left-auto rtl:right-4 text-xs leading-none text-zinc-500">▼</span>
              )}
              <div
                tabIndex={0}
                role="button"
                aria-label={`${node.title}. ${node.body}`}
                data-r6-illustration-node={node.id}
                data-r6-diagram-step={node.id}
                className={`rounded-lg border bg-zinc-950 p-3 transition-colors ${
                  highlight === node.id ? 'border-amber-400 r6-highlighted bg-amber-950/20' : 'border-zinc-700'
                }`}
                onMouseEnter={(event) => openTooltip(node.id, stepTooltipPayload(node), event.currentTarget.getBoundingClientRect())}
                onMouseLeave={() => setTooltip((current) => (current?.persistent ? current : null))}
                onPointerEnter={(event) => openTooltip(node.id, stepTooltipPayload(node), event.currentTarget.getBoundingClientRect())}
                onPointerLeave={() => setTooltip((current) => (current?.persistent ? current : null))}
                onFocus={(event) => {
                  openTooltip(node.id, stepTooltipPayload(node), event.currentTarget.getBoundingClientRect());
                  if (node.id === 'step-5') emitHighlight('primary-result');
                }}
                onBlur={() => {
                  setTooltip((current) => (current?.persistent ? current : null));
                  if (node.id === 'step-5') emitHighlight('');
                }}
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const payload = stepTooltipPayload(node);
                  setTooltip((current) =>
                    current && current.id === node.id && current.persistent
                      ? null
                      : { id: node.id, payload, rect, persistent: true },
                  );
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    const rect = event.currentTarget.getBoundingClientRect();
                    openTooltip(node.id, stepTooltipPayload(node), rect, true);
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-800 text-[10px] font-bold text-amber-400">
                    {index + 1}
                  </span>
                  <p className="text-[13px] font-bold leading-snug text-zinc-100">{node.title}</p>
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-400 rtl:pr-7 ltr:pl-7">{node.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Textual equivalent of the desktop diagram (the mobile stack above is
            already real text, so it is not repeated there). The step titles
            already carry their own number ("1. ", "2. " …), so the list marker
            is suppressed — otherwise the number would be printed twice. */}
        <ol className="mt-3 hidden list-none space-y-1 text-xs text-zinc-300 md:block" data-r6-illustration-text="tool-039">
          <li><span className="font-bold">{t.step1_title}:</span> {t.step1_body}</li>
          <li><span className="font-bold">{t.step2_title}:</span> {t.step2_body}</li>
          <li><span className="font-bold">{t.step3_title}:</span> {t.step3_body}</li>
          <li><span className="font-bold">{t.step4_title}:</span> {t.step4_body}</li>
          <li><span className="font-bold">{t.step5_title}:</span> {t.step5_body}</li>
        </ol>
        <p className="mt-2 text-[11px] text-zinc-500">{t.illustration_marker_note}</p>
        <dl className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-zinc-400 sm:grid-cols-2">
          {TOOL_039_VISUAL_MARKERS.map((marker) => (
            <div key={marker} className="rounded border border-zinc-800 bg-zinc-950/60 px-2 py-1">
              <dt className="font-bold text-zinc-200">{marker}</dt>
              <dd>{markerMeaning(marker)}</dd>
            </div>
          ))}
        </dl>
      </figure>

      {/* ── Bar / gauge: value vs the documented reference limit ───────────── */}
      {hasResult && (
      <section aria-label={t.chart_bar_title} data-r6-chart-section="bar">
        <h4 className="mb-1 text-sm font-bold text-zinc-200">{t.chart_bar_title}</h4>
        <p className="mb-2 text-[11px] text-zinc-500">{t.chart_bar_scale_note}</p>
        <ul className="space-y-2">
          {bars.map((bar) => (
            <li key={bar.marker}>
              <button
                type="button"
                data-r6-bar={bar.marker}
                aria-label={barAriaLabel(bar)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 p-2 text-left"
                onMouseEnter={(event) => openTooltip(`bar-${bar.marker}`, barTooltip(bar), event.currentTarget.getBoundingClientRect())}
                onMouseLeave={() => setTooltip((current) => (current?.persistent ? current : null))}
                onPointerEnter={(event) => openTooltip(`bar-${bar.marker}`, barTooltip(bar), event.currentTarget.getBoundingClientRect())}
                onPointerLeave={() => setTooltip((current) => (current?.persistent ? current : null))}
                onFocus={(event) => openTooltip(`bar-${bar.marker}`, barTooltip(bar), event.currentTarget.getBoundingClientRect())}
                onBlur={() => setTooltip((current) => (current?.persistent ? current : null))}
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const payload = barTooltip(bar);
                  setTooltip((current) =>
                    current && current.id === `bar-${bar.marker}` && current.persistent
                      ? null
                      : { id: `bar-${bar.marker}`, payload, rect, persistent: true },
                  );
                }}
              >
                <span className="flex items-center justify-between text-[11px] font-bold text-zinc-200">
                  <span>{bar.marker}</span>
                  <span className="font-mono">
                    {bar.value} {bar.unit} · {bar.ulnMultiple.toFixed(2)}× ULN · {statusLabel(bar.status)}
                  </span>
                </span>
                <span className="relative mt-1 block h-3 w-full rounded bg-zinc-800" aria-hidden="true">
                  <span
                    className="absolute inset-y-0 left-0 rounded bg-cyan-500"
                    style={{ width: `${bar.fillPercent}%` }}
                  />
                  <span
                    className="absolute inset-y-[-4px] w-0.5 bg-amber-400"
                    style={{ left: `${bar.referencePercent}%` }}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-zinc-500" data-r6-legend="tool-039">
          <span className="font-bold">{t.chart_legend_label}:</span>{' '}
          {t.chart_legend_value} · {t.chart_legend_reference} · {t.chart_legend_status}
        </p>
      </section>
      )}

      {/* ── Line chart of the real dated readings ───────────────────────────── */}
      {hasResult && (
      <section aria-label={t.chart_line_title} data-r6-chart-section="line">
        <h4 className="mb-1 text-sm font-bold text-zinc-200">{t.chart_line_title}</h4>
        {trendSeries.length === 0 ? (
          <p className="text-xs text-zinc-400" data-r6-chart-empty="true">{t.chart_line_empty}</p>
        ) : (
          <div className="space-y-3">
            {trendSeries.map((entry) => lineChart(entry))}
          </div>
        )}
      </section>
      )}

      {/* ── Pie/Donut applicability decision (SPEC §7.1) ───────────────────── */}
      {hasResult && (
      <section aria-label={t.pie_decision_title} data-r6-pie-decision="tool-039" className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
        <h4 className="mb-1 text-xs font-bold text-zinc-200">{t.pie_decision_title}</h4>
        <p className="text-[11px] text-zinc-400">{TOOL_039_PIE_DONUT_DECISION.reason}</p>
      </section>
      )}

      {/* ── Textual equivalent of every chart (SPEC §15) ───────────────────── */}
      {hasResult && (
      <section aria-label={t.table_title} data-r6-table="tool-039">
        <h4 className="mb-1 text-sm font-bold text-zinc-200">{t.table_title}</h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-[11px]">
            <caption className="sr-only">{t.table_caption}</caption>
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                <th scope="col" className="py-1 pe-2">{t.table_marker}</th>
                <th scope="col" className="py-1 pe-2">{t.table_value}</th>
                <th scope="col" className="py-1 pe-2">{t.table_unit}</th>
                <th scope="col" className="py-1 pe-2">{t.table_reference}</th>
                <th scope="col" className="py-1 pe-2">{t.table_multiple}</th>
                <th scope="col" className="py-1 pe-2">{t.table_status}</th>
                <th scope="col" className="py-1 pe-2">{t.table_readings}</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.marker} className="border-b border-zinc-900 text-zinc-300">
                  <th scope="row" className="py-1 pe-2 font-bold">{row.marker}</th>
                  <td className="py-1 pe-2 font-mono">{row.value}</td>
                  <td className="py-1 pe-2 font-mono">{row.unit}</td>
                  <td className="py-1 pe-2 font-mono">{row.referenceLimit} {row.unit}</td>
                  <td className="py-1 pe-2 font-mono">{row.ulnMultiple}</td>
                  <td className="py-1 pe-2">{statusLabel(row.status)}</td>
                  <td className="py-1 pe-2 font-mono">{row.readings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {/* ── The tooltip itself ─────────────────────────────────────────────── */}
      {tooltip && (
        <div
          ref={tooltipRef}
          role="tooltip"
          id="r6-tool-039-tooltip"
          data-r6-tooltip="open"
          style={tooltipStyle}
          className="rounded-lg border border-amber-400 bg-white p-3 text-left shadow-xl"
        >
          <div className="mb-1 flex items-start justify-between gap-2">
            {renderTooltipBody(tooltip.payload)}
            <button
              type="button"
              aria-label={t.tooltip_close}
              data-r6-tooltip-close="true"
              onClick={closeTooltip}
              className="shrink-0 rounded border border-zinc-400 px-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Focus visibility + reduced motion for this section only */}
      <style>{`
        .r6-chart-point:focus { outline: none; stroke: #f59e0b; stroke-width: 3; }
        .r6-illustration-node:focus { outline: none; }
        .r6-illustration-node:focus rect { stroke: #f59e0b; stroke-width: 3; }
        .r6-highlighted rect { stroke: #f59e0b; stroke-width: 3; }
        @media (prefers-reduced-motion: reduce) {
          [data-r6-visual='tool-039'] * { transition: none !important; animation: none !important; }
        }
      `}</style>
      {isAr && null}
    </section>
  );
}
