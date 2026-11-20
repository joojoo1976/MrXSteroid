/**
 * lib/tools/r6/tool-043-prolactin-management-contract.ts
 * Tool #043 — Prolactin Management Pro: R6.1 parity contract.
 * PURE MODULE — zero React, DOM, I/O, or system clock dependencies.
 */

export const TOOL_043_DEBOUNCE_MS = 120;
export const TOOL_043_LAB_FRESHNESS_DAYS = 90;

export type Tool043Band = 'normal' | 'borderline' | 'high' | 'very-high';

export const TOOL_043_REFERENCE_LIMITS = {
  prolactin: {
    normal_max: 20,
    borderline_max: 25,
    high_max: 50,
    very_high_min: 50,
    unit: 'ng/mL',
    // Adult male reference: Endocrine Society Guidelines on Hyperprolactinemia
    reference_max: 15, // strict clinical normal
    athlete_tolerance: 20,
  },
  cabergoline: {
    start_low_mcg: 250,
    typical_max_mcg: 1000,
    unit: 'mcg/week',
  },
} as const;

export type Tool043FieldId = 'prolactinLevel' | 'uses19Nor' | 'weeklyCabergolineMcg' | 'symptoms' | 'panelDate';

export interface Tool043FieldContract {
  id: Tool043FieldId;
  required: boolean;
  minVal?: number;
  maxVal?: number;
  unit?: string;
}

export const TOOL_043_FIELD_CONTRACT: Record<Tool043FieldId, Tool043FieldContract> = {
  prolactinLevel:       { id: 'prolactinLevel',       required: true,  minVal: 0.5, maxVal: 200, unit: 'ng/mL' },
  uses19Nor:            { id: 'uses19Nor',             required: true },
  weeklyCabergolineMcg: { id: 'weeklyCabergolineMcg', required: true,  minVal: 0,   maxVal: 1000, unit: 'mcg' },
  symptoms:             { id: 'symptoms',              required: false },
  panelDate:            { id: 'panelDate',             required: false },
};

export function isRealCalendarDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function labFreshness(dateStr: string): { fresh: boolean; days: number } {
  if (!isRealCalendarDate(dateStr)) return { fresh: false, days: -1 };
  const diff = (Date.now() - new Date(`${dateStr}T00:00:00.000Z`).getTime()) / 86_400_000;
  return { fresh: diff <= TOOL_043_LAB_FRESHNESS_DAYS, days: Math.floor(diff) };
}

export const TOOL_043_SOURCES = [
  {
    id: 'endocrine-society-hyperprolactinemia-2011',
    label: 'Endocrine Society Clinical Practice Guideline: Hyperprolactinemia (2011)',
    url: 'https://academic.oup.com/jcem/article/96/2/273/2597879',
    level: 'A' as const,
  },
  {
    id: 'molitch-2015',
    label: 'Molitch ME. Management of Medically Refractory Prolactinoma (2015)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26469190/',
    level: 'B' as const,
  },
];

export const TOOL_043_CROSS_LINKS = [
  { slug: 'tool-006-estrogen-prolactin', label: 'Estradiol & Prolactin Monitor' },
  { slug: 'tool-023-trt-optimization',   label: 'TRT Optimization Engine' },
];

export function buildTool043Csv(rows: Array<{ label: string; value: string; unit: string }>): string {
  const header = 'Field,Value,Unit\n';
  const body = rows.map(r => `"${r.label}","${r.value}","${r.unit}"`).join('\n');
  return header + body;
}
