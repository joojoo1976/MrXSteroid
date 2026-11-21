/**
 * lib/tools/r6/tool-023-trt-optimization-contract.ts
 * ═══════════════════════════════════════════════════
 * Tool #023 — TRT Optimization Engine: R6.1 input & parity contract.
 * PURE MODULE — zero React, DOM, I/O, or system clock dependencies.
 */

export const TOOL_023_DEBOUNCE_MS = 120;
export const TOOL_023_LAB_FRESHNESS_DAYS = 90;

export type Tool023Band = 'optimal' | 'borderline' | 'high' | 'low';

export const TOOL_023_REFERENCE_LIMITS = {
  troughT: {
    low: 300,
    optimalMin: 700,
    optimalMax: 1000,
    borderlineMax: 1200,
    high: 1200,
    unit: 'ng/dL',
  },
  e2: {
    low: 15,
    optimalMin: 20,
    optimalMax: 40,
    borderlineMax: 50,
    high: 50,
    unit: 'pg/mL',
  },
  hematocrit: {
    low: 36,
    optimalMin: 40,
    optimalMax: 50,
    borderlineMax: 54,
    high: 54,
    unit: '%',
  },
  peakTroughRatio: {
    optimalMin: 1.0,
    optimalMax: 1.5,
    high: 2.0,
    unit: 'ratio',
  },
} as const;

export type Tool023FieldId =
  | 'age'
  | 'troughT'
  | 'freeT'
  | 'symptoms'
  | 'hematocrit'
  | 'e2'
  | 'trtDuration'
  | 'administration'
  | 'panelDate';

export interface Tool023FieldContract {
  id: Tool023FieldId;
  required: boolean;
  minVal?: number;
  maxVal?: number;
  unit?: string;
}

export const TOOL_023_FIELD_CONTRACT: Record<Tool023FieldId, Tool023FieldContract> = {
  age:           { id: 'age',           required: true,  minVal: 18, maxVal: 80, unit: 'years' },
  troughT:       { id: 'troughT',       required: true,  minVal: 50, maxVal: 3000, unit: 'ng/dL' },
  freeT:         { id: 'freeT',         required: false, minVal: 1,  maxVal: 500, unit: 'pg/mL' },
  symptoms:      { id: 'symptoms',      required: true },
  hematocrit:    { id: 'hematocrit',    required: false, minVal: 20, maxVal: 70, unit: '%' },
  e2:            { id: 'e2',            required: false, minVal: 1,  maxVal: 300, unit: 'pg/mL' },
  trtDuration:   { id: 'trtDuration',   required: true,  minVal: 0,  maxVal: 600, unit: 'months' },
  administration:{ id: 'administration',required: true },
  panelDate:     { id: 'panelDate',     required: false },
};

export function isRealCalendarDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function labFreshness(dateStr: string): { fresh: boolean; days: number } {
  if (!isRealCalendarDate(dateStr)) return { fresh: false, days: -1 };
  const diff = (Date.now() - new Date(`${dateStr}T00:00:00.000Z`).getTime()) / 86_400_000;
  return { fresh: diff <= TOOL_023_LAB_FRESHNESS_DAYS, days: Math.floor(diff) };
}

export function getTroughTBand(val: number): Tool023Band {
  const lim = TOOL_023_REFERENCE_LIMITS.troughT;
  if (val < lim.low) return 'low';
  if (val >= lim.optimalMin && val <= lim.optimalMax) return 'optimal';
  if (val > lim.optimalMax && val <= lim.borderlineMax) return 'borderline';
  return 'high';
}

export function getE2Band(val: number): Tool023Band {
  const lim = TOOL_023_REFERENCE_LIMITS.e2;
  if (val < lim.low) return 'low';
  if (val >= lim.optimalMin && val <= lim.optimalMax) return 'optimal';
  if (val > lim.optimalMax && val <= lim.borderlineMax) return 'borderline';
  return 'high';
}

export function getHematocritBand(val: number): Tool023Band {
  const lim = TOOL_023_REFERENCE_LIMITS.hematocrit;
  if (val < lim.low) return 'low';
  if (val >= lim.optimalMin && val <= lim.optimalMax) return 'optimal';
  if (val > lim.optimalMax && val <= lim.borderlineMax) return 'borderline';
  return 'high';
}

export const TOOL_023_SOURCES = [
  {
    id: 'aua-2018',
    label: 'AUA Guidelines on Testosterone Deficiency (2018)',
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/testosterone-deficiency-guideline',
    level: 'A' as const,
  },
  {
    id: 'endocrine-society-2018',
    label: 'Endocrine Society Clinical Practice Guideline: Testosterone Therapy in Men (2018)',
    url: 'https://academic.oup.com/jcem/article/103/5/1715/4939465',
    level: 'A' as const,
  },
];

export const TOOL_023_CROSS_LINKS = [
  { slug: 'tool-006-estrogen-prolactin', label: 'Estradiol & Prolactin Monitor' },
  { slug: 'tool-015-shbg-modulator',     label: 'SHBG & Free Testosterone' },
  { slug: 'tool-040-lipid-profile-optimizer', label: 'Lipid Profile Optimizer' },
  { slug: 'tool-044-dht-side-effects',   label: 'DHT Side Effects Analyzer' },
];

export function buildTool023Csv(rows: Array<{ label: string; value: string; unit: string }>): string {
  const header = 'Field,Value,Unit\n';
  const body = rows.map(r => `"${r.label}","${r.value}","${r.unit}"`).join('\n');
  return header + body;
}
