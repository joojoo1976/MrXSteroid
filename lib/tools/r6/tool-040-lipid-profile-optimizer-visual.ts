/**
 * lib/tools/r6/tool-040-lipid-profile-optimizer-visual.ts
 * ═══════════════════════════════════════════════════════════════════════════
 * Tool #040 — Lipid Profile Optimizer: visual data layer.
 *
 * PURE MODULE — no React, no DOM, no I/O, no clock. Every number it returns
 * comes from the engine result and from the R6.1 contract; nothing is
 * estimated, averaged or invented. There is no default dataset and no
 * fallback series: a marker that was not entered is simply not plotted.
 * ═══════════════════════════════════════════════════════════════════════════
 */
import {
  TOOL_040_BANDS,
  TOOL_040_GAUGE_MAX,
  TOOL_040_LIPID_UNIT,
  TOOL_040_REFERENCE_LIMITS,
  type Tool040Band,
  type Tool040Marker,
} from './tool-040-lipid-profile-optimizer-contract';

export interface Tool040PanelInput {
  ldl_mg_dl: number;
  hdl_mg_dl: number;
  triglycerides_mg_dl: number;
  total_cholesterol_mg_dl?: number;
}

export interface Tool040EngineResult {
  ldl_status: Tool040Band;
  hdl_status: Tool040Band;
  tg_status: Tool040Band;
  non_hdl: number;
  overall_band: Tool040Band;
  interventions: string[];
}

/** One plotted marker: the value the user entered, the band the engine gave it. */
export interface Tool040MarkerRow {
  marker: Tool040Marker;
  value: number;
  unit: string;
  /** The band the ENGINE produced for this marker. */
  band: Tool040Band;
  /** The edge of the optimal band, drawn as the reference marker. */
  referenceLimit: number;
  /** The scale ceiling of this gauge (its own scale, never shared). */
  scaleMax: number;
  /** Bar width as a percentage of this marker's own scale. */
  fillPercent: number;
  /** Position of the reference marker on the same scale. */
  referencePercent: number;
  /** True when a higher value is better (HDL). */
  higherIsBetter: boolean;
}

export interface Tool040TableRow {
  marker: string;
  value: string;
  unit: string;
  referenceLimit: string;
  band: string;
  reading: string;
}

export interface Tool040TooltipPayload {
  /** 1 = element name, 2 = meaning, 3 = value, 4 = unit, 5 = band, 6 = explanation,
   *  7 = formula/method, 8 = source, 9 = warning, 10 = limits. */
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

export interface Tool040LadderStep {
  band: Tool040Band;
  /** The threshold that opens this band, as it is shown to the user. */
  thresholdLabel: string;
  /** The marker whose band is used as the example for this step. */
  marker: Tool040Marker;
}

const formatNumber = (value: number): string => (Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2))));

/**
 * One row per marker, built ONLY from the engine result and the entered panel.
 */
export function buildLipidMarkerRows(panel: Tool040PanelInput, result: Tool040EngineResult): Tool040MarkerRow[] {
  const values: Record<Tool040Marker, number> = {
    LDL: panel.ldl_mg_dl,
    HDL: panel.hdl_mg_dl,
    TG: panel.triglycerides_mg_dl,
  };
  const bands: Record<Tool040Marker, Tool040Band> = {
    LDL: result.ldl_status,
    HDL: result.hdl_status,
    TG: result.tg_status,
  };

  return (['LDL', 'HDL', 'TG'] as const).map((marker) => {
    const value = values[marker];
    const referenceLimit = TOOL_040_REFERENCE_LIMITS[marker];
    const scaleMax = TOOL_040_GAUGE_MAX[marker];
    const higherIsBetter = TOOL_040_BANDS[marker][0].higherIsBetter;
    const fillPercent = Math.max(0, Math.min(100, (value / scaleMax) * 100));
    const referencePercent = Math.max(0, Math.min(100, (referenceLimit / scaleMax) * 100));
    return {
      marker,
      value,
      unit: TOOL_040_LIPID_UNIT,
      band: bands[marker],
      referenceLimit,
      scaleMax,
      fillPercent,
      referencePercent,
      higherIsBetter,
    };
  });
}

/** The textual equivalent of the gauges (SPEC §15, ACC-R6.1-3.d). */
export function buildLipidTableRows(rows: Tool040MarkerRow[]): Tool040TableRow[] {
  return rows.map((row) => ({
    marker: row.marker,
    value: formatNumber(row.value),
    unit: row.unit,
    referenceLimit: formatNumber(row.referenceLimit),
    band: row.band,
    reading: `${formatNumber(row.value)} ${row.unit} (${row.band})`,
  }));
}

/** The tooltip payload of one gauge row. */
export function buildLipidBarTooltip(
  row: Tool040MarkerRow,
  text: {
    meaning: string;
    explanation: string;
    formula: string;
    source: string;
    warning: string | null;
    limitation: string | null;
  },
): Tool040TooltipPayload {
  return {
    title: row.marker,
    meaning: text.meaning,
    value: formatNumber(row.value),
    unit: row.unit,
    ratio: `${row.band}`,
    explanation: text.explanation,
    formula: text.formula,
    source: text.source,
    warning: text.warning,
    limitation: text.limitation,
  };
}

/**
 * Pie / Donut applicability decision (SPEC §7.1).
 *
 * Decision: NOT APPLICABLE for this tool.
 * Technical justification:
 *   - LDL, HDL and TG are not shares of one measured total: the engine only
 *     approximates the total (Friedewald: LDL + HDL + TG/5), so TG/5 is a
 *     correction term and not a fraction of anything the user measured;
 *   - HDL is protective — a larger HDL is better — so a slice whose size means
 *     "more risk" would invert its own meaning;
 *   - the R6.1 closure layer forbids decorative visuals, and a donut here
 *     would hide the band thresholds that actually drive the advice.
 * Alternative used instead: one gauge per marker on its OWN scale, drawn
 * against the edge of its optimal band, plus the band ladder itself.
 */
export const TOOL_040_PIE_DONUT_DECISION = {
  applicable: false as const,
  chart: 'none' as const,
  reason:
    'LDL, HDL and TG are not shares of one measured total (the engine only approximates the total as LDL + HDL + TG/5, so TG/5 is a correction term, not a fraction), and HDL is protective — a larger HDL is better — so a slice whose size means "more risk" would invert its own meaning. The per-marker gauge against the edge of each optimal band, plus the band ladder itself, is used instead.',
} as const;

/** The band ladder shown in the explanation, with the real thresholds. */
export function buildLipidLadderSteps(): Tool040LadderStep[] {
  const ldl = TOOL_040_BANDS.LDL;
  return [
    { band: 'optimal', thresholdLabel: `< ${ldl[0].upperExclusive} mg/dL`, marker: 'LDL' },
    { band: 'borderline', thresholdLabel: `${ldl[1].lowerInclusive} – ${ldl[1].upperExclusive} mg/dL`, marker: 'LDL' },
    { band: 'high', thresholdLabel: `${ldl[2].lowerInclusive} – ${ldl[2].upperExclusive} mg/dL`, marker: 'LDL' },
    { band: 'very-high', thresholdLabel: `≥ ${ldl[3].lowerInclusive} mg/dL`, marker: 'LDL' },
  ];
}
