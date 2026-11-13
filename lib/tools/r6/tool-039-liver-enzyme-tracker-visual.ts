/**
 * lib/tools/r6/tool-039-liver-enzyme-tracker-visual.ts
 * ═══════════════════════════════════════════════════════════════════════════
 * Tool #039 — Liver Enzyme Tracker: visual data layer.
 *
 * PURE MODULE — no React, no DOM, no I/O. Every number it returns comes from
 * (a) the validated input the user typed and (b) the R6 pipeline output
 * (`output.result`). Nothing is estimated, averaged or invented: there is no
 * default dataset and no fallback series.
 *
 * It builds:
 *   - the per-marker series used by the line chart (real dated readings only),
 *   - the per-marker "value vs reference limit" rows used by the bar/gauge,
 *   - the textual data table rows (the accessible equivalent of the charts),
 *   - the element-specific tooltip payload (value, unit, ratio, formula),
 *   - the documented Pie/Donut applicability decision.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import { TOOL_039_REFERENCE_LIMITS, type Tool039Marker } from './tool-039-liver-enzyme-tracker-contract';

export interface Tool039ReadingPoint {
  /** Draw date exactly as entered (YYYY-MM-DD). */
  date: string;
  /** Measured value exactly as entered. */
  value: number;
  /** Unit carried from the marker (never converted). */
  unit: string;
}

export interface Tool039SeriesPoint extends Tool039ReadingPoint {
  /** Engine status for this marker (from the pipeline output). */
  status: string;
  /** Engine multiple of the reference limit for the latest reading. */
  ulnMultiple: number;
  /** True for the most recent reading of this marker. */
  isLatest: boolean;
  /** Change against the previous reading of the same marker (null for the first). */
  changeFromPrevious: number | null;
}

export interface Tool039MarkerSeries {
  marker: Tool039Marker;
  unit: string;
  /** Reference upper limit used by the engine (documented constant). */
  referenceLimit: number;
  /** Latest value from the pipeline output. */
  latestValue: number;
  /** Latest multiple of the reference limit from the pipeline output. */
  ulnMultiple: number;
  /** Engine status for this marker. */
  status: string;
  /** Real dated readings, oldest first. */
  points: Tool039SeriesPoint[];
  /** A line chart needs at least two dated readings. */
  hasTrend: boolean;
}

export interface Tool039BarRow {
  marker: Tool039Marker;
  unit: string;
  value: number;
  referenceLimit: number;
  /** value / referenceLimit, rounded to 2 decimals (the engine's own multiple). */
  ulnMultiple: number;
  status: string;
  /** Bar width as a percentage of the row's own scale (0-100). */
  fillPercent: number;
  /** Position of the reference-limit marker on the same scale (0-100). */
  referencePercent: number;
  /** Scale ceiling used for this row (its own marker scale — never shared). */
  scaleMax: number;
}

export interface Tool039TableRow {
  marker: Tool039Marker;
  value: string;
  unit: string;
  referenceLimit: string;
  ulnMultiple: string;
  status: string;
  readings: string;
}

export interface Tool039TooltipPayload {
  /** 1 = element name, 2 = meaning, 3 = value, 4 = unit, 5 = ratio/impact,
   *  6 = explanation, 7 = formula/method, 8 = source, 9 = warning, 10 = limits. */
  title: string;
  meaning: string;
  value: string;
  unit: string | null;
  ratio: string | null;
  explanation: string;
  formula: string | null;
  source: string;
  warning: string | null;
  limitation: string | null;
}

/** The five analytes this tool understands, with their engine unit. */
export const TOOL_039_VISUAL_MARKERS: readonly Tool039Marker[] = ['ALT', 'AST', 'GGT', 'ALP', 'bilirubin'];

/**
 * Custom event used to highlight a visual element ↔ its result box
 * (SPEC.md §7.2 — SVG arrows and colour-to-box relationships). The event is the
 * accessible alternative to a colour-only signal: a text label states the link
 * in the diagram and in the result box.
 */
export const TOOL_039_HIGHLIGHT_EVENT = 'r6:tool-039-highlight';

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

/**
 * Pie / Donut applicability decision (SPEC.md §7.1).
 *
 * Decision: NOT APPLICABLE for this tool.
 * Technical justification:
 *   - ALT, AST, GGT, ALP and bilirubin are measured in two different units
 *     (U/L and mg/dL) and describe different physiological axes (enzymes vs a
 *     pigment). They are not parts of one common whole.
 *   - A pie/donut encodes shares of a single total; there is no total here, and
 *     normalising the analytes into percentages would invent a quantity that
 *     has no clinical meaning and would hide the reference-limit comparison
 *     that actually matters.
 *   - The R6.1 closure layer forbids decorative visuals, and the shared phase-2
 *     manifest already records the same reason for this domain.
 * Alternative used instead: a per-marker bar/gauge against the documented
 * reference limit (each row on its own scale) plus a dated line chart of the
 * real readings.
 */
export const TOOL_039_PIE_DONUT_DECISION = {
  applicable: false as const,
  chart: 'none' as const,
  reason:
    'ALT, AST, GGT, ALP and bilirubin are different analytes in different units (U/L vs mg/dL); they are not parts of a common whole, so a pie/donut would invent percentages with no clinical meaning. The per-marker bar/gauge against the documented reference limit and the dated line chart of the real readings are used instead.',
} as const;

/**
 * Builds one series per marker from the validated input and the pipeline output.
 * The status, the multiple and the latest value always come from the engine.
 */
export function buildLiverTrackerSeries(
  input: { readings: Array<{ marker: string; value: number; unit: string; date: string }> },
  result: {
    markers: Array<{ marker: string; latest_value: number; unit: string; uln_multiple: number; status: string }>;
  },
): Tool039MarkerSeries[] {
  return result.markers.map((markerResult) => {
    const marker = markerResult.marker as Tool039Marker;
    const readings = input.readings
      .filter((reading) => reading.marker === marker)
      .slice()
      .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? -1 : 1));
    const points: Tool039SeriesPoint[] = readings.map((reading, index) => ({
      date: reading.date,
      value: reading.value,
      unit: reading.unit,
      status: markerResult.status,
      ulnMultiple: markerResult.uln_multiple,
      isLatest: index === readings.length - 1,
      changeFromPrevious: index === 0 ? null : reading.value - readings[index - 1].value,
    }));
    return {
      marker,
      unit: markerResult.unit,
      referenceLimit: TOOL_039_REFERENCE_LIMITS[marker]?.uln ?? 0,
      latestValue: markerResult.latest_value,
      ulnMultiple: markerResult.uln_multiple,
      status: markerResult.status,
      points,
      hasTrend: points.length >= 2,
    };
  });
}

/**
 * Per-marker bar rows. Each row has its OWN scale (never a shared one) so the
 * bar length means "fraction of this marker's own reference limit".
 */
export function buildLiverTrackerBars(series: Tool039MarkerSeries[]): Tool039BarRow[] {
  return series.map((entry) => {
    const scaleMax = Math.max(entry.referenceLimit, entry.latestValue) * 1.2;
    return {
      marker: entry.marker,
      unit: entry.unit,
      value: entry.latestValue,
      referenceLimit: entry.referenceLimit,
      ulnMultiple: entry.ulnMultiple,
      status: entry.status,
      fillPercent: scaleMax === 0 ? 0 : Math.min(100, (entry.latestValue / scaleMax) * 100),
      referencePercent: scaleMax === 0 ? 0 : Math.min(100, (entry.referenceLimit / scaleMax) * 100),
      scaleMax,
    };
  });
}

/** The textual equivalent of the charts (SPEC.md §15, ACC-R6.1-3.d). */
export function buildLiverTrackerTable(series: Tool039MarkerSeries[]): Tool039TableRow[] {
  return series.map((entry) => ({
    marker: entry.marker,
    value: formatNumber(entry.latestValue),
    unit: entry.unit,
    referenceLimit: formatNumber(entry.referenceLimit),
    ulnMultiple: `${entry.ulnMultiple.toFixed(2)}×`,
    status: entry.status,
    readings: entry.points.map((point) => `${point.date}: ${formatNumber(point.value)} ${point.unit}`).join(' · '),
  }));
}

/** Tooltip payload for a bar/gauge row (the marker's latest reading). */
export function buildLiverTrackerBarTooltip(
  bar: Tool039BarRow,
  text: {
    meaning: string;
    explanation: string;
    formula: string;
    source: string;
    warning: string | null;
    limitation: string | null;
  },
): Tool039TooltipPayload {
  return {
    title: bar.marker,
    meaning: text.meaning,
    value: formatNumber(bar.value),
    unit: bar.unit,
    ratio: `${bar.ulnMultiple.toFixed(2)}× ULN`,
    explanation: text.explanation,
    formula: text.formula,
    source: text.source,
    warning: text.warning,
    limitation: text.limitation,
  };
}

/** Tooltip payload for one point of the dated line chart. */
export function buildLiverTrackerPointTooltip(
  point: Tool039SeriesPoint,
  series: Tool039MarkerSeries,
  text: {
    meaning: string;
    explanation: string;
    formula: string;
    source: string;
    warning: string | null;
    limitation: string | null;
  },
): Tool039TooltipPayload {
  return {
    title: `${series.marker} · ${point.date}`,
    meaning: text.meaning,
    value: formatNumber(point.value),
    unit: point.unit,
    ratio: `${point.ulnMultiple.toFixed(2)}× ULN`,
    explanation: point.changeFromPrevious === null
      ? text.explanation
      : `${text.explanation} (${point.changeFromPrevious > 0 ? '+' : ''}${formatNumber(point.changeFromPrevious)} ${point.unit} vs the previous reading)`,
    formula: text.formula,
    source: text.source,
    warning: text.warning,
    limitation: text.limitation,
  };
}
