/**
 * lib/tools/r6/tool-035-hormone-conversion-contract.ts
 * Tool #035 — Hormone Conversion Rate Calculator: R6.1 parity contract.
 * PURE MODULE — zero React, DOM, I/O, or system clock dependencies.
 */

export const TOOL_035_DEBOUNCE_MS = 120;
export const TOOL_035_LAB_FRESHNESS_DAYS = 90;

// Molar masses used in conversion (from engine source)
export const TESTOSTERONE_MOLAR_MASS_G_MOL = 288.4;
export const ESTRADIOL_MOLAR_MASS_G_MOL = 272.4;

export const TOOL_035_REFERENCE_LIMITS = {
  testosterone_ng_dL: {
    low: 300,
    optimalMin: 700,
    optimalMax: 1000,
    borderlineMax: 1200,
    high: 1200,
    unit: 'ng/dL',
  },
  testosterone_nmol_L: {
    low: 10.4,
    optimalMin: 24.3,
    optimalMax: 34.7,
    borderlineMax: 41.6,
    high: 41.6,
    unit: 'nmol/L',
  },
  estradiol_pg_mL: {
    low: 15,
    optimalMin: 20,
    optimalMax: 40,
    borderlineMax: 50,
    high: 50,
    unit: 'pg/mL',
  },
  estradiol_pmol_L: {
    low: 55,
    optimalMin: 73,
    optimalMax: 147,
    borderlineMax: 183,
    high: 183,
    unit: 'pmol/L',
  },
} as const;

export type Tool035FieldId = 'analyte' | 'value' | 'unit' | 'measurementDate' | 'readingSource';

export interface Tool035FieldContract {
  id: Tool035FieldId;
  required: boolean;
  minVal?: number;
  maxVal?: number;
}

export const TOOL_035_FIELD_CONTRACT: Record<Tool035FieldId, Tool035FieldContract> = {
  analyte:         { id: 'analyte',         required: true },
  value:           { id: 'value',           required: true, minVal: 0, maxVal: 10_000_000 },
  unit:            { id: 'unit',            required: true },
  measurementDate: { id: 'measurementDate', required: true },
  readingSource:   { id: 'readingSource',   required: true },
};

export function isRealCalendarDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function labFreshness(dateStr: string): { fresh: boolean; days: number } {
  if (!isRealCalendarDate(dateStr)) return { fresh: false, days: -1 };
  const diff = (Date.now() - new Date(`${dateStr}T00:00:00.000Z`).getTime()) / 86_400_000;
  return { fresh: diff <= TOOL_035_LAB_FRESHNESS_DAYS, days: Math.floor(diff) };
}

export const TOOL_035_SOURCES = [
  {
    id: 'bhasin-2010',
    label: 'Bhasin S et al. Testosterone Therapy in Men with Androgen Deficiency Syndromes (2010)',
    url: 'https://academic.oup.com/jcem/article/95/6/2536/2596202',
    level: 'A' as const,
  },
  {
    id: 'si-units',
    label: 'SI Unit Conversion: IUPAC/IFCC Recommendations',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4909110/',
    level: 'B' as const,
  },
];

export const TOOL_035_CROSS_LINKS = [
  { slug: 'tool-006-estrogen-prolactin', label: 'Estradiol & Prolactin Monitor' },
  { slug: 'tool-015-shbg-modulator',     label: 'SHBG & Free Testosterone' },
  { slug: 'tool-023-trt-optimization',   label: 'TRT Optimization Engine' },
];

export function buildTool035Csv(rows: Array<{ label: string; value: string; unit: string }>): string {
  const header = 'Field,Value,Unit\n';
  const body = rows.map(r => `"${r.label}","${r.value}","${r.unit}"`).join('\n');
  return header + body;
}
