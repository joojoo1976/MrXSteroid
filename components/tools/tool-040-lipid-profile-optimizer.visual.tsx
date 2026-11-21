'use client';
/**
 * Tool #040 — Lipid Profile Optimizer: the visual layer.
 *
 * Every number drawn here comes from the R6 pipeline output and from the values
 * the user entered. There is no default dataset, no averaged point and no
 * synthetic series: a marker that was not entered is simply not plotted.
 *
 * Interaction contract (SPEC §6.7 / §7.1 / §7.2 / §15):
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
import type { LipidOptimizerResult } from '@/lib/tools/schemas/tool-040-lipid-profile-optimizer';
import i18nJson from '@/i18n/tool-040-lipid-profile-optimizer.json';
import { pickToolI18n } from '@/lib/tools/i18nHelper';
import {
  type Tool040Band,
} from '@/lib/tools/r6/tool-040-lipid-profile-optimizer-contract';
import {
  TOOL_040_PIE_DONUT_DECISION,
  buildLipidBarTooltip,
  buildLipidLadderSteps,
  buildLipidMarkerRows,
  buildLipidTableRows,
  type Tool040EngineResult,
  type Tool040MarkerRow,
  type Tool040PanelInput,
} from '@/lib/tools/r6/tool-040-lipid-profile-optimizer-visual';

/** Cross-highlight event (SPEC §7.2): the illustration ↔ the primary result box. */
export const TOOL_040_HIGHLIGHT_EVENT = 'r6:tool-040-highlight';

export interface Tool040VisualProps {
  locale: 'ar' | 'en';
  /** The entered panel; null while nothing is entered. */
  panel: Tool040PanelInput | null;
  /** The engine output; null while there is no result. */
  output: ToolOutput<LipidOptimizerResult> | null;
}

interface OpenTooltip {
  id: string;
  payload: ReturnType<typeof buildLipidBarTooltip>;
  rect: DOMRect;
  /** A tooltip opened by click/tap stays until it is dismissed explicitly. */
  persistent: boolean;
}

const TOOLTIP_WIDTH = 320;

export default function Tool040Visual({ locale, panel, output }: Tool040VisualProps) {
  const t = pickToolI18n(i18nJson, locale);
  const isAr = locale === 'ar';
  const [tooltip, setTooltip] = useState<OpenTooltip | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [tooltipHeight, setTooltipHeight] = useState(220);

  const result = output ? (output.result as Tool040EngineResult) : null;

  // The tooltip node is measured through a callback ref (outside render), so the
  // height that drives the viewport clamping is always the real one.
  const tooltipRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setTooltipHeight(node.offsetHeight || 220);
  }, []);

  // The gauges and the table need a result; the illustration does not.
  const rows = useMemo(() => (panel && result ? buildLipidMarkerRows(panel, result) : []), [panel, result]);
  const table = useMemo(() => buildLipidTableRows(rows), [rows]);
  const ladder = useMemo(() => buildLipidLadderSteps(), []);

  const bandLabel = (band: Tool040Band): string => {
    if (band === 'optimal') return t.band_optimal;
    if (band === 'borderline') return t.band_borderline;
    if (band === 'high') return t.band_high;
    if (band === 'very-high') return t.band_very_high;
    return band;
  };

  const markerMeaning = (marker: string): string => {
    if (marker === 'LDL') return t.marker_meaning_ldl;
    if (marker === 'HDL') return t.marker_meaning_hdl;
    if (marker === 'TG') return t.marker_meaning_tg;
    return '';
  };

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
    window.addEventListener(TOOL_040_HIGHLIGHT_EVENT, onHighlight);
    return () => window.removeEventListener(TOOL_040_HIGHLIGHT_EVENT, onHighlight);
  }, []);

  const emitHighlight = (target: string) => {
    window.dispatchEvent(new CustomEvent(TOOL_040_HIGHLIGHT_EVENT, { detail: { target } }));
  };

  const openTooltip = useCallback(
    (id: string, payload: ReturnType<typeof buildLipidBarTooltip>, rect: DOMRect, persistent = false) => {
      setTooltip({ id, payload, rect, persistent });
    },
    [],
  );

  const closeTooltip = useCallback(() => setTooltip(null), []);

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

  const barTooltip = (row: Tool040MarkerRow) =>
    buildLipidBarTooltip(row, {
      meaning: markerMeaning(row.marker),
      explanation:
        row.band === 'very-high'
          ? t.c2_uncertainty_body
          : t.c2_assumptions,
      formula: t.c1_formula_band,
      source: t.tooltip_source_engine,
      warning: row.band === 'very-high' ? t.safety_red_flag : null,
      limitation: t.tooltip_limitation_reference,
    });

  const barAriaLabel = (row: Tool040MarkerRow) =>
    `${row.marker}: ${row.value} ${row.unit}, ${bandLabel(row.band)}. ${markerMeaning(row.marker)}`;

  const renderTooltipBody = (payload: ReturnType<typeof buildLipidBarTooltip>) => (
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

  /**
   * The five steps of the explanation. ONE source of truth: the desktop SVG and
   * the phone stack render the same steps, so no step, connector or meaning can
   * be lost.
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
    <section className="space-y-5" aria-label={t.visual_section_label} data-r6-visual="tool-040">
      <h3 className="text-sm font-bold text-zinc-300">{t.visual_section_title}</h3>

      {/* ── Explanatory illustration ─────────────────────────────────────── */}
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
          aria-labelledby="lipid-illustration-title"
          aria-describedby="lipid-illustration-desc"
          data-r6-illustration="tool-040"
        >
          <title id="lipid-illustration-title">{t.illustration_title}</title>
          <desc id="lipid-illustration-desc">{t.illustration_desc}</desc>
          {diagramSteps.map((node, index) => (
            <g key={node.id}>
              {index > 0 && (
                <path
                  d={`M ${node.x - 22} 100 L ${node.x - 6} 100`}
                  stroke="#a1a1aa"
                  strokeWidth={2}
                  markerEnd="url(#lipid-arrow)"
                />
              )}
              <g
                tabIndex={0}
                role="button"
                aria-label={`${node.title}. ${node.body}`}
                data-r6-illustration-node={node.id}
                className={`r6-illustration-node ${highlight === node.id ? 'r6-highlighted' : ''}`}
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
                <rect
                  x={node.x}
                  y="62"
                  width="118"
                  height="76"
                  rx="10"
                  fill="#0f172a"
                  stroke={highlight === node.id ? '#f59e0b' : '#3f3f46'}
                  strokeWidth={highlight === node.id ? 3 : 1.5}
                />
                <text x={node.x + 10} y="84" fill="#e4e4e7" fontSize="11" fontWeight="700">
                  {node.title}
                </text>
                <foreignObject x={node.x + 8} y="90" width="102" height="44">
                  <p className="m-0 text-[9px] leading-tight text-zinc-400">
                    {node.body}
                  </p>
                </foreignObject>
              </g>
            </g>
          ))}
          <defs>
            <marker id="lipid-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="#a1a1aa" />
            </marker>
          </defs>
        </svg>
        </div>

        {/* Phone: the same five steps as real, readable HTML text (13/12 px),
            with the same connectors, tooltips and result-box relationship. */}
        <ol className="space-y-2 md:hidden" data-r6-illustration-mobile="tool-040">
          {diagramSteps.map((node, index) => (
            <li key={node.id} className="relative">
              {index > 0 && (
                <span aria-hidden="true" className="absolute -top-2 left-4 text-xs leading-none text-zinc-500">▼</span>
              )}
              <div
                tabIndex={0}
                role="button"
                aria-label={`${node.title}. ${node.body}`}
                data-r6-illustration-node={node.id}
                data-r6-diagram-step={node.id}
                className={`rounded-lg border bg-zinc-950 p-3 ${highlight === node.id ? 'border-amber-400' : 'border-zinc-700'}`}
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
                <p className="text-[13px] font-bold leading-snug text-zinc-100">{node.title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-400">{node.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Textual equivalent of the desktop diagram (the mobile stack above is
            already real text, so it is not repeated there). */}
        <ol className="mt-3 hidden list-none space-y-1 text-xs text-zinc-300 md:block" data-r6-illustration-text="tool-040">
          <li><span className="font-bold">{t.step1_title}:</span> {t.step1_body}</li>
          <li><span className="font-bold">{t.step2_title}:</span> {t.step2_body}</li>
          <li><span className="font-bold">{t.step3_title}:</span> {t.step3_body}</li>
          <li><span className="font-bold">{t.step4_title}:</span> {t.step4_body}</li>
          <li><span className="font-bold">{t.step5_title}:</span> {t.step5_body}</li>
        </ol>

        <p className="mt-3 text-[11px] font-bold text-zinc-300">{t.band_ladder_title}</p>
        <ol className="mt-1 space-y-0.5 text-[11px] text-zinc-400" data-r6-band-ladder="tool-040">
          {ladder.map((step) => (
            <li key={step.band}>
              <span className="font-bold text-zinc-200">{bandLabel(step.band)}</span>
              <span className="ms-2 font-mono">{step.thresholdLabel}</span>
            </li>
          ))}
        </ol>
        <p className="mt-1 text-[11px] text-zinc-500">{t.band_ladder_note}</p>

        <p className="mt-3 text-[11px] text-zinc-500">{t.illustration_marker_note}</p>
        <dl className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-zinc-400 sm:grid-cols-2">
          {(['LDL', 'HDL', 'TG'] as const).map((marker) => (
            <div key={marker} className="rounded border border-zinc-800 bg-zinc-950/60 px-2 py-1">
              <dt className="font-bold text-zinc-200">{marker}</dt>
              <dd>{markerMeaning(marker)}</dd>
            </div>
          ))}
        </dl>
      </figure>

      {/* ── One gauge per marker, each on its OWN scale ─────────────────── */}
      {result && (
      <section aria-label={t.chart_bar_title} data-r6-chart-section="bar">
        <h4 className="mb-1 text-sm font-bold text-zinc-200">{t.chart_bar_title}</h4>
        <p className="mb-2 text-[11px] text-zinc-500">{t.chart_bar_scale_note}</p>
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.marker}>
              <button
                type="button"
                data-r6-bar={row.marker}
                aria-label={barAriaLabel(row)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 p-2 text-left"
                onMouseEnter={(event) => openTooltip(`bar-${row.marker}`, barTooltip(row), event.currentTarget.getBoundingClientRect())}
                onMouseLeave={() => setTooltip((current) => (current?.persistent ? current : null))}
                onPointerEnter={(event) => openTooltip(`bar-${row.marker}`, barTooltip(row), event.currentTarget.getBoundingClientRect())}
                onPointerLeave={() => setTooltip((current) => (current?.persistent ? current : null))}
                onFocus={(event) => openTooltip(`bar-${row.marker}`, barTooltip(row), event.currentTarget.getBoundingClientRect())}
                onBlur={() => setTooltip((current) => (current?.persistent ? current : null))}
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  const payload = barTooltip(row);
                  setTooltip((current) =>
                    current && current.id === `bar-${row.marker}` && current.persistent
                      ? null
                      : { id: `bar-${row.marker}`, payload, rect, persistent: true },
                  );
                }}
              >
                <span className="flex items-center justify-between text-[11px] font-bold text-zinc-200">
                  <span>{row.marker}</span>
                  <span className="font-mono">
                    {row.value} {row.unit} · {bandLabel(row.band)}
                  </span>
                </span>
                <span className="relative mt-1 block h-3 w-full rounded bg-zinc-800" aria-hidden="true">
                  <span
                    className="absolute inset-y-0 left-0 rounded bg-cyan-500"
                    style={{ width: `${row.fillPercent}%` }}
                  />
                  <span
                    className="absolute inset-y-[-4px] w-0.5 bg-amber-400"
                    style={{ left: `${row.referencePercent}%` }}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-zinc-500" data-r6-legend="tool-040">
          <span className="font-bold">{t.chart_legend_label}:</span>{' '}
          {t.chart_legend_value} · {t.chart_legend_reference} · {t.chart_legend_status}
        </p>
      </section>
      )}

      {/* ── Pie/Donut applicability decision (SPEC §7.1) ─────────────────── */}
      {result && (
      <section aria-label={t.pie_decision_title} data-r6-pie-decision="tool-040" className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
        <h4 className="mb-1 text-xs font-bold text-zinc-200">{t.pie_decision_title}</h4>
        <p className="text-[11px] text-zinc-400">{TOOL_040_PIE_DONUT_DECISION.reason}</p>
      </section>
      )}

      {/* ── Textual equivalent of every chart (SPEC §15) ─────────────────── */}
      {result && (
      <section aria-label={t.table_title} data-r6-table="tool-040">
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
                <th scope="col" className="py-1 pe-2">{t.table_band}</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.marker} className="border-b border-zinc-900 text-zinc-300">
                  <th scope="row" className="py-1 pe-2 font-bold">{row.marker}</th>
                  <td className="py-1 pe-2 font-mono">{row.value}</td>
                  <td className="py-1 pe-2 font-mono">{row.unit}</td>
                  <td className="py-1 pe-2 font-mono">{row.referenceLimit}</td>
                  <td className="py-1 pe-2">{bandLabel(row.band as Tool040Band)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {/* ── The tooltip itself ───────────────────────────────────────────── */}
      {tooltip && (
        <div
          ref={tooltipRef}
          role="tooltip"
          id="r6-tool-040-tooltip"
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
          [data-r6-visual='tool-040'] * { transition: none !important; animation: none !important; }
        }
      `}</style>
      {isAr && null}
    </section>
  );
}
