/**
 * lib/tools/r6/tool-046-trt-lifetime-contract.ts
 *
 * The tool-owned, non-clinical contract for Tool 046 — TRT Lifetime Calculator.
 *
 * This module is the "content module" half of the same decision taken for Tool
 * 041 (OD-12 option B): it repeats the values the unchanged V6 engine already
 * uses (monitoring cadence, dosing interval per method, age bands, cost
 * arithmetic, warning triggers, input bounds) so the interface can explain
 * them, and a sync test proves the repeated values still describe the engine's
 * real behaviour. The engine, schema and adapter are not imported, edited or
 * re-implemented here.
 *
 * Nothing in this file is a new medical threshold, citation, prescription or
 * dosing recommendation. The engine's existing warnings are preserved and only
 * mapped to localisation keys; every clinical sentence that would need new
 * wording is held as `NOT_AVAILABLE` until a specialist approves it.
 *
 * Pure module: no storage, no network, no session.
 */
import {
  TrtLifetimeInputSchema,
  TrtLifetimeResultSchema,
  type TrtLifetimeInput,
} from '@/lib/tools/schemas/tool-046-trt-lifetime';

/** The result shape, derived from the canonical schema (no engine import). */
export type TrtLifetimeResult = ReturnType<typeof TrtLifetimeResultSchema.parse>;

/* ── Input shape used by the UI while the user is still typing ─────────────── */

export type Tool046Method = '' | 'injection' | 'gel' | 'cream';

export interface Tool046Draft {
  age: string;
  method: Tool046Method;
  weeklyMg: string;
  yearsOnTrt: string;
  monthlyCost: string;
  monitoringCost: string;
}

export type Tool046UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool046FieldId =
  | 'age'
  | 'method'
  | 'weeklyMg'
  | 'yearsOnTrt'
  | 'monthlyCost'
  | 'monitoringCost';

export type Tool046IssueCode =
  | 'invalid_number'
  | 'out_of_range'
  | 'required'
  | 'schema_mismatch';

export interface Tool046Issue {
  field: Tool046FieldId;
  code: Tool046IssueCode;
}

export interface Tool046Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool046Issue[];
  input: TrtLifetimeInput | null;
}

/* ── The values the engine already uses (mirrored, never re-derived) ───────── */

export const TOOL_046_LIMITS = {
  /** Input contract bounds. */
  ageMin: 18,
  ageMax: 90,
  weeklyMgMin: 25,
  weeklyMgMax: 300,
  yearsOnTrtMin: 0,
  yearsOnTrtMax: 60,
  monthlyCostMin: 0,
  monthlyCostMax: 1000,
  monitoringCostMin: 0,
  monitoringCostMax: 5000,
  /** Engine dosing interval per method. */
  injectionIntervalDays: 3.5,
  transdermalIntervalDays: 1,
  /** Engine monitoring cadence: < 1 year → 3, < 3 years → 2, otherwise 1. */
  panelFirstYearCount: 3,
  panelEarlyYearsCount: 2,
  panelSteadyCount: 1,
  panelFirstYearUntilYears: 1,
  panelEarlyYearsUntilYears: 3,
  /** Engine age bands: < 40, < 55, otherwise 55+. */
  ageBandUnder40Until: 40,
  ageBand40to55Until: 55,
  /** Engine warning triggers. */
  warningAgeAtLeast: 40,
  warningYearsOnTrtAtLeast: 5,
  warningWeeklyMgAbove: 200,
  /** Cost arithmetic: monthly × 12 × years + monitoring × years. */
  monthsPerYear: 12,
  /** The result schema's display horizons. */
  horizons: [10, 20, 30] as const,
  unit: 'USD',
} as const;

const WARNING_KEYS: Record<string, string> = {
  age_40_plus_cardio_monitoring: 'warning_age_40_plus',
  long_term_annual_full_panel: 'warning_long_term_panel',
  high_dose_not_trt_range: 'warning_high_dose',
};

/**
 * Localised key for an engine warning code. An unknown code is never printed as
 * a raw code: it falls back to a neutral explanation.
 */
export function warningLabelKey(code: string): string {
  return WARNING_KEYS[code] ?? 'warning_unknown';
}

const AGE_BAND_KEYS: Record<string, string> = {
  'under-40': 'age_band_under_40',
  '40-55': 'age_band_40_55',
  '55-plus': 'age_band_55_plus',
};

/** Localisation key for the engine age band. */
export function ageBandLabelKey(band: string): string {
  return AGE_BAND_KEYS[band] ?? 'age_band_unknown';
}

/** The engine's monitoring cadence, mirrored for the explanation box. */
export function annualPanels(yearsOnTrt: number): number {
  if (yearsOnTrt < TOOL_046_LIMITS.panelFirstYearUntilYears) return TOOL_046_LIMITS.panelFirstYearCount;
  if (yearsOnTrt < TOOL_046_LIMITS.panelEarlyYearsUntilYears) return TOOL_046_LIMITS.panelEarlyYearsCount;
  return TOOL_046_LIMITS.panelSteadyCount;
}

/** The engine's dosing interval for a method. */
export function dosingIntervalDays(method: 'injection' | 'gel' | 'cream'): number {
  return method === 'injection'
    ? TOOL_046_LIMITS.injectionIntervalDays
    : TOOL_046_LIMITS.transdermalIntervalDays;
}

/** The engine's horizon cost arithmetic. */
export function horizonCost(
  monthlyCost: number,
  monitoringCost: number,
  years: number,
): number {
  return Math.round(
    monthlyCost * TOOL_046_LIMITS.monthsPerYear * years + monitoringCost * years,
  );
}

/** USD with no invented precision (the engine rounds to whole dollars). */
export function formatUsd(value: number): string {
  return Number.isFinite(value) ? `$${Math.round(value).toLocaleString('en-US')}` : '—';
}

/** A whole number of panels/panels-per-year. */
export function formatCount(value: number): string {
  return Number.isFinite(value) ? String(Math.round(value)) : '—';
}

/** The engine's interval can be fractional (3.5 days); show it as-is. */
export function formatInterval(value: number): string {
  return Number.isFinite(value) ? String(value) : '—';
}

/** Clamp a number into the engine's accepted window. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/* ── Draft evaluation (the five-state model) ───────────────────────────────── */

function numeric(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function rangeIssue(
  text: string,
  field: Tool046FieldId,
  min: number,
  max: number,
  issues: Tool046Issue[],
): number | null {
  if (text.trim() === '') return null;
  const value = numeric(text);
  if (value === null) {
    issues.push({ field, code: 'invalid_number' });
    return null;
  }
  if (value < min || value > max) {
    issues.push({ field, code: 'out_of_range' });
    return null;
  }
  return value;
}

/**
 * Evaluate the draft once, in the documented order:
 * EMPTY → INVALID → PARTIAL → READY. The READY candidate is parsed by the
 * canonical Zod input contract, so this function cannot drift from it.
 *
 * A typed `0` is a real value for years-on-TRT and both cost fields: it is
 * never treated as "not answered".
 */
export function evaluateTrtLifetimeDraft(draft: Tool046Draft): Tool046Evaluation {
  const issues: Tool046Issue[] = [];

  const age = rangeIssue(draft.age, 'age', TOOL_046_LIMITS.ageMin, TOOL_046_LIMITS.ageMax, issues);
  const weeklyMg = rangeIssue(
    draft.weeklyMg,
    'weeklyMg',
    TOOL_046_LIMITS.weeklyMgMin,
    TOOL_046_LIMITS.weeklyMgMax,
    issues,
  );
  const yearsOnTrt = rangeIssue(
    draft.yearsOnTrt,
    'yearsOnTrt',
    TOOL_046_LIMITS.yearsOnTrtMin,
    TOOL_046_LIMITS.yearsOnTrtMax,
    issues,
  );
  const monthlyCost = rangeIssue(
    draft.monthlyCost,
    'monthlyCost',
    TOOL_046_LIMITS.monthlyCostMin,
    TOOL_046_LIMITS.monthlyCostMax,
    issues,
  );
  const monitoringCost = rangeIssue(
    draft.monitoringCost,
    'monitoringCost',
    TOOL_046_LIMITS.monitoringCostMin,
    TOOL_046_LIMITS.monitoringCostMax,
    issues,
  );

  const method = draft.method;
  if (method !== '' && method !== 'injection' && method !== 'gel' && method !== 'cream') {
    issues.push({ field: 'method', code: 'out_of_range' });
  }

  const anyEntered =
    draft.age.trim() !== '' ||
    draft.method !== '' ||
    draft.weeklyMg.trim() !== '' ||
    draft.yearsOnTrt.trim() !== '' ||
    draft.monthlyCost.trim() !== '' ||
    draft.monitoringCost.trim() !== '';

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  const complete =
    age !== null &&
    method !== '' &&
    weeklyMg !== null &&
    yearsOnTrt !== null &&
    monthlyCost !== null &&
    monitoringCost !== null;

  if (!complete) return { state: 'PARTIAL', issues, input: null };

  const candidate: TrtLifetimeInput = {
    age: age as number,
    method: method as 'injection' | 'gel' | 'cream',
    weekly_testosterone_mg: weeklyMg as number,
    years_on_trt: yearsOnTrt as number,
    monthly_med_cost_usd: monthlyCost as number,
    monitoring_annual_cost_usd: monitoringCost as number,
  };

  const parsed = TrtLifetimeInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return { state: 'INVALID', issues: [{ field: 'age', code: 'schema_mismatch' }], input: null };
  }

  return { state: 'READY', issues, input: parsed.data };
}

/* ── Public reference sources (C4) ────────────────────────────────────────── */

export interface Tool046SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

/**
 * No approved source exists in the repository for Tool 046. The box therefore
 * renders `NOT_AVAILABLE — no approved source recorded` and this list stays
 * empty until the owner/specialist supplies a checked reference.
 */
export const TOOL_046_SOURCES: readonly Tool046SourceRef[] = [];

/* ── Cross-tool links (box 8) ─────────────────────────────────────────────── */

export interface Tool046MappedField {
  targetField: string;
  note: string;
}

export interface Tool046CrossToolLink {
  targetToolId: string;
  mappedFields: Tool046MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

/**
 * Related R6 tools that read the same protocol/cost facts by hand. Nothing is
 * transferred automatically while W18 is undecided; the freshness anchor is the
 * protocol start date the user typed in each tool.
 */
export const TOOL_046_CROSS_TOOL_LINKS: readonly Tool046CrossToolLink[] = [
  {
    targetToolId: 'tool-023-trt-optimization',
    mappedFields: [
      {
        targetField: 'weekly_testosterone_mg',
        note: 're-enter the weekly dose by hand; nothing is copied',
      },
    ],
    freshnessRule: 'the projection is comparable only when both tools use the same protocol start date',
    transfer: 'manual-reentry',
  },
  {
    targetToolId: 'tool-045-cycle-break-planner',
    mappedFields: [
      {
        targetField: 'cycle_break_context',
        note: 're-enter the cycle length and last-dose date by hand',
      },
    ],
    freshnessRule: 'the projection is comparable only when both tools use the same last-dose date',
    transfer: 'manual-reentry',
  },
];

/* ── CSV export (browser only) ────────────────────────────────────────────── */

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/**
 * CSV of the entered inputs and the engine result. Generated in the browser
 * only — no server call, no account, no secret, no session identifier.
 */
export function buildTrtLifetimeCsv(
  input: TrtLifetimeInput,
  result: TrtLifetimeResult,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-046-trt-lifetime'],
    ['calculated_at', calculatedAt],
    [],
    ['age', String(input.age)],
    ['method', input.method],
    ['weekly_testosterone_mg', String(input.weekly_testosterone_mg)],
    ['years_on_trt', String(input.years_on_trt)],
    ['monthly_med_cost_usd', String(input.monthly_med_cost_usd)],
    ['monitoring_annual_cost_usd', String(input.monitoring_annual_cost_usd)],
    [],
    ['injection_interval_days', String(result.injection_interval_days)],
    ['annual_bloodwork_panels', String(result.annual_bloodwork_panels)],
    ['age_band', result.age_band],
    ['lifetime_bloodwork_panels_10y', String(result.lifetime_bloodwork_panels_10y)],
    ['horizon_years', 'total_cost_usd'],
    [String(result.cost_projection.horizon10.horizon_years), String(result.cost_projection.horizon10.total_cost_usd)],
    [String(result.cost_projection.horizon20.horizon_years), String(result.cost_projection.horizon20.total_cost_usd)],
    [String(result.cost_projection.horizon30.horizon_years), String(result.cost_projection.horizon30.total_cost_usd)],
    ['warnings', result.warnings.join('|')],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
