/**
 * lib/tools/r6/tool-044-dht-side-effects-contract.ts
 * Tool #044 — DHT Side Effects Analyzer: R6.1 parity contract.
 * PURE MODULE — zero React, DOM, I/O, or system clock dependencies.
 */

export const TOOL_044_DEBOUNCE_MS = 120;
export const TOOL_044_LAB_FRESHNESS_DAYS = 90;

export const TOOL_044_REFERENCE_LIMITS = {
  dht: {
    low: 5,
    reference_min: 30,
    optimalMin: 30,
    optimalMax: 85,
    borderlineMax: 100,
    high: 100,
    unit: 'ng/dL',
    anchor: 50,
  },
  psa: {
    normal_max_under_50: 2.5,
    normal_max_over_50: 4.0,
    unit: 'ng/mL',
  },
  dht_to_tt_ratio: {
    optimalMin: 0.05,
    optimalMax: 0.10,
    borderlineMax: 0.15,
    unit: 'ratio',
  },
} as const;

export type DhtBand = 'low' | 'moderate' | 'high';

export type Tool044FieldId =
  | 'dhtLevel'
  | 'usesDhtDerivative'
  | 'fiveAri'
  | 'familyHistoryHairloss'
  | 'age'
  | 'panelDate';

export interface Tool044FieldContract {
  id: Tool044FieldId;
  required: boolean;
  minVal?: number;
  maxVal?: number;
  unit?: string;
}

export const TOOL_044_FIELD_CONTRACT: Record<Tool044FieldId, Tool044FieldContract> = {
  dhtLevel:              { id: 'dhtLevel',              required: true,  minVal: 5,   maxVal: 300, unit: 'ng/dL' },
  usesDhtDerivative:     { id: 'usesDhtDerivative',     required: true },
  fiveAri:               { id: 'fiveAri',               required: true },
  familyHistoryHairloss: { id: 'familyHistoryHairloss', required: true },
  age:                   { id: 'age',                   required: true,  minVal: 18,  maxVal: 90, unit: 'years' },
  panelDate:             { id: 'panelDate',             required: false },
};

export function isRealCalendarDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00.000Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function labFreshness(dateStr: string): { fresh: boolean; days: number } {
  if (!isRealCalendarDate(dateStr)) return { fresh: false, days: -1 };
  const diff = (Date.now() - new Date(`${dateStr}T00:00:00.000Z`).getTime()) / 86_400_000;
  return { fresh: diff <= TOOL_044_LAB_FRESHNESS_DAYS, days: Math.floor(diff) };
}

export const TOOL_044_SOURCES = [
  {
    id: 'aua-psa-guidelines',
    label: 'AUA Guidelines: Early Detection of Prostate Cancer (2023)',
    url: 'https://www.auanet.org/guidelines-and-quality/guidelines/prostate-cancer-detection-guideline',
    level: 'A' as const,
  },
  {
    id: '5ari-hair-loss',
    label: 'Blumeyer A et al. Evidence-based (S3) guideline for the treatment of androgenetic alopecia (2011)',
    url: 'https://onlinelibrary.wiley.com/doi/10.1111/j.1610-0379.2011.07802.x',
    level: 'A' as const,
  },
];

export const TOOL_044_CROSS_LINKS = [
  { slug: 'tool-023-trt-optimization',   label: 'TRT Optimization Engine' },
  { slug: 'tool-015-shbg-modulator',     label: 'SHBG & Free Testosterone' },
  { slug: 'tool-035-hormone-conversion', label: 'Hormone Conversion Calculator' },
];

export function buildTool044Csv(rows: Array<{ label: string; value: string; unit: string }>): string {
  const header = 'Field,Value,Unit\n';
  const body = rows.map(r => `"${r.label}","${r.value}","${r.unit}"`).join('\n');
  return header + body;
}
