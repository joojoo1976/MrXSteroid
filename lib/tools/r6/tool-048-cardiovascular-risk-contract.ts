/**
 * lib/tools/r6/tool-048-cardiovascular-risk-contract.ts
 *
 * The tool-owned, non-clinical contract for Tool 048 — Cardiovascular Risk
 * Assessor.
 *
 * This module is the "content module" half of the same decision taken for Tool
 * 041 (OD-12 option B): it repeats the values the unchanged V6 engine already
 * uses (additive weights, ceilings, band cut-offs, driver thresholds,
 * mitigation mapping, warning triggers, input bounds) so the interface can
 * explain them, and a sync test proves the repeated values still describe the
 * engine's real behaviour. The engine, schema and adapter are not imported,
 * edited or re-implemented here.
 *
 * Nothing in this file is a new medical threshold, citation, prescription or
 * treatment recommendation. The engine's existing drivers, mitigations and
 * warnings are preserved and only mapped to localisation keys; every clinical
 * sentence that would need new wording is held as `NOT_AVAILABLE` until a
 * specialist approves it. The engine itself is explicitly an educational
 * heuristic and explicitly NOT the clinical ASCVD pooled-cohort equation.
 *
 * Pure module: no storage, no network, no session.
 */
import {
  CardioRiskInputSchema,
  CardioRiskResultSchema,
  type CardioRiskInput,
} from '@/lib/tools/schemas/tool-048-cardiovascular-risk';

/** The result shape, derived from the canonical schema (no engine import). */
export type CardioRiskResult = ReturnType<typeof CardioRiskResultSchema.parse>;

/* ── Input shape used by the UI while the user is still typing ─────────────── */

export type Tool048Sex = '' | 'male' | 'female';
export type Tool048Bool = '' | 'yes' | 'no';

export interface Tool048Draft {
  age: string;
  sex: Tool048Sex;
  smoker: Tool048Bool;
  systolicBp: string;
  totalCholesterol: string;
  hdl: string;
  onCycle: Tool048Bool;
}

export type Tool048UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool048FieldId =
  | 'age'
  | 'sex'
  | 'smoker'
  | 'systolicBp'
  | 'totalCholesterol'
  | 'hdl'
  | 'onCycle';

export type Tool048IssueCode =
  | 'invalid_number'
  | 'out_of_range'
  | 'required'
  | 'schema_mismatch';

export interface Tool048Issue {
  field: Tool048FieldId;
  code: Tool048IssueCode;
}

export interface Tool048Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool048Issue[];
  input: CardioRiskInput | null;
}

/* ── The values the engine already uses (mirrored, never re-derived) ───────── */

export const TOOL_048_LIMITS = {
  /** Input contract bounds. */
  ageMin: 18,
  ageMax: 90,
  systolicBpMin: 80,
  systolicBpMax: 220,
  totalCholesterolMin: 100,
  totalCholesterolMax: 400,
  hdlMin: 20,
  hdlMax: 110,
  /** Engine additive weights (percentage points). */
  agePerYear: 0.35,
  ageStartsAt: 18,
  systolicAbove: 120,
  systolicPerMmHg: 0.08,
  cholesterolAbove: 180,
  cholesterolPerMgDl: 0.04,
  hdlBelow: 45,
  hdlPerMgDl: 0.1,
  smokerPoints: 4,
  onCyclePoints: 3,
  malePoints: 1,
  /** Engine round + clamp. */
  riskFloorPct: 0,
  riskCeilingPct: 60,
  /** Engine band cut-offs: < 5 low, < 10 moderate, < 20 elevated, else high. */
  bandLowBelow: 5,
  bandModerateBelow: 10,
  bandElevatedBelow: 20,
  /** Engine driver thresholds. */
  driverAgeAtLeast: 45,
  driverSystolicAbove: 130,
  driverCholesterolAbove: 200,
  driverHdlBelow: 40,
  /** Engine warning trigger. */
  warningConsultAtLeastPct: 20,
  /** The engine's canonical unit. */
  unit: 'percent_10_year',
} as const;

/* ── Label maps (the engine emits codes, never display text) ───────────────── */

const BAND_KEYS: Record<string, string> = {
  low: 'band_low',
  moderate: 'band_moderate',
  elevated: 'band_elevated',
  high: 'band_high',
};

export function bandLabelKey(band: string): string {
  return BAND_KEYS[band] ?? 'band_unknown';
}

const DRIVER_KEYS: Record<string, string> = {
  age: 'driver_age',
  blood_pressure: 'driver_bp',
  total_cholesterol: 'driver_cholesterol',
  low_hdl: 'driver_low_hdl',
  smoking: 'driver_smoking',
  on_cycle_burden: 'driver_on_cycle',
};

export function driverLabelKey(code: string): string {
  return DRIVER_KEYS[code] ?? 'driver_unknown';
}

const MITIGATION_KEYS: Record<string, string> = {
  annual_bp_lipid_panels: 'mitigation_annual_panels',
  bp_management: 'mitigation_bp_management',
  lipid_optimization: 'mitigation_lipid',
  raise_hdl_cardio: 'mitigation_hdl',
  smoking_cessation: 'mitigation_smoking',
  cycle_responsibility_bp_lipid_monitoring: 'mitigation_cycle_monitoring',
};

export function mitigationLabelKey(code: string): string {
  return MITIGATION_KEYS[code] ?? 'mitigation_unknown';
}

const WARNING_KEYS: Record<string, string> = {
  educational_not_clinical_ascvd: 'warning_educational',
  consult_physician: 'warning_consult',
};

/**
 * Localised key for an engine warning code. An unknown code is never printed as
 * a raw code: it falls back to a neutral explanation.
 */
export function warningLabelKey(code: string): string {
  return WARNING_KEYS[code] ?? 'warning_unknown';
}

/* ── Mirrored arithmetic, used only to EXPLAIN the engine result ───────────── */

export interface Tool048Contribution {
  code: string;
  labelKey: string;
  points: number;
}

/**
 * The individual percentage-point contributions the engine adds before it
 * rounds and clamps. Used by C2 to explain the number, never to replace it: a
 * sync test asserts that the rounded, clamped sum equals the engine result.
 */
export function riskContributions(input: CardioRiskInput): Tool048Contribution[] {
  return [
    {
      code: 'age',
      labelKey: 'contribution_age',
      points: (input.age - TOOL_048_LIMITS.ageStartsAt) * TOOL_048_LIMITS.agePerYear,
    },
    {
      code: 'systolic',
      labelKey: 'contribution_systolic',
      points:
        Math.max(0, input.systolic_bp - TOOL_048_LIMITS.systolicAbove) *
        TOOL_048_LIMITS.systolicPerMmHg,
    },
    {
      code: 'cholesterol',
      labelKey: 'contribution_cholesterol',
      points:
        Math.max(0, input.total_cholesterol - TOOL_048_LIMITS.cholesterolAbove) *
        TOOL_048_LIMITS.cholesterolPerMgDl,
    },
    {
      code: 'hdl',
      labelKey: 'contribution_hdl',
      points:
        Math.max(0, TOOL_048_LIMITS.hdlBelow - input.hdl) * TOOL_048_LIMITS.hdlPerMgDl,
    },
    {
      code: 'smoking',
      labelKey: 'contribution_smoking',
      points: input.smoker ? TOOL_048_LIMITS.smokerPoints : 0,
    },
    {
      code: 'cycle',
      labelKey: 'contribution_cycle',
      points: input.on_cycle ? TOOL_048_LIMITS.onCyclePoints : 0,
    },
    {
      code: 'sex',
      labelKey: 'contribution_sex',
      points: input.sex === 'male' ? TOOL_048_LIMITS.malePoints : 0,
    },
  ];
}

/** The engine's rounded, clamped 10-year educational risk for an input. */
export function mirroredRiskPct(input: CardioRiskInput): number {
  const raw = riskContributions(input).reduce((sum, item) => sum + item.points, 0);
  return Math.min(
    TOOL_048_LIMITS.riskCeilingPct,
    Math.max(TOOL_048_LIMITS.riskFloorPct, Math.round(raw)),
  );
}

/** The engine's band for a risk percentage. */
export function bandForRisk(riskPct: number): string {
  if (riskPct < TOOL_048_LIMITS.bandLowBelow) return 'low';
  if (riskPct < TOOL_048_LIMITS.bandModerateBelow) return 'moderate';
  if (riskPct < TOOL_048_LIMITS.bandElevatedBelow) return 'elevated';
  return 'high';
}

/** A percentage with no invented precision (the engine rounds to whole %). */
export function formatPct(value: number): string {
  return Number.isFinite(value) ? `${Math.round(value)}%` : '—';
}

/** A signed contribution, so the explanation shows zero components too. */
export function formatPoints(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
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
  field: Tool048FieldId,
  min: number,
  max: number,
  issues: Tool048Issue[],
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
 */
export function evaluateCardioRiskDraft(draft: Tool048Draft): Tool048Evaluation {
  const issues: Tool048Issue[] = [];

  const age = rangeIssue(
    draft.age,
    'age',
    TOOL_048_LIMITS.ageMin,
    TOOL_048_LIMITS.ageMax,
    issues,
  );
  const systolicBp = rangeIssue(
    draft.systolicBp,
    'systolicBp',
    TOOL_048_LIMITS.systolicBpMin,
    TOOL_048_LIMITS.systolicBpMax,
    issues,
  );
  const totalCholesterol = rangeIssue(
    draft.totalCholesterol,
    'totalCholesterol',
    TOOL_048_LIMITS.totalCholesterolMin,
    TOOL_048_LIMITS.totalCholesterolMax,
    issues,
  );
  const hdl = rangeIssue(draft.hdl, 'hdl', TOOL_048_LIMITS.hdlMin, TOOL_048_LIMITS.hdlMax, issues);

  if (draft.sex !== '' && draft.sex !== 'male' && draft.sex !== 'female') {
    issues.push({ field: 'sex', code: 'out_of_range' });
  }
  if (draft.smoker !== '' && draft.smoker !== 'yes' && draft.smoker !== 'no') {
    issues.push({ field: 'smoker', code: 'out_of_range' });
  }
  if (draft.onCycle !== '' && draft.onCycle !== 'yes' && draft.onCycle !== 'no') {
    issues.push({ field: 'onCycle', code: 'out_of_range' });
  }

  const anyEntered =
    draft.age.trim() !== '' ||
    draft.sex !== '' ||
    draft.smoker !== '' ||
    draft.systolicBp.trim() !== '' ||
    draft.totalCholesterol.trim() !== '' ||
    draft.hdl.trim() !== '' ||
    draft.onCycle !== '';

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  const complete =
    age !== null &&
    draft.sex !== '' &&
    draft.smoker !== '' &&
    systolicBp !== null &&
    totalCholesterol !== null &&
    hdl !== null &&
    draft.onCycle !== '';

  if (!complete) return { state: 'PARTIAL', issues, input: null };

  const candidate: CardioRiskInput = {
    age: age as number,
    sex: draft.sex as 'male' | 'female',
    smoker: draft.smoker === 'yes',
    systolic_bp: systolicBp as number,
    total_cholesterol: totalCholesterol as number,
    hdl: hdl as number,
    on_cycle: draft.onCycle === 'yes',
  };

  const parsed = CardioRiskInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return { state: 'INVALID', issues: [{ field: 'age', code: 'schema_mismatch' }], input: null };
  }

  return { state: 'READY', issues, input: parsed.data };
}

/* ── Public reference sources (C4) ────────────────────────────────────────── */

export interface Tool048SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

/**
 * No approved source exists in the repository for Tool 048. The box therefore
 * renders `NOT_AVAILABLE — no approved source recorded` and this list stays
 * empty until the owner/specialist supplies a checked reference.
 */
export const TOOL_048_SOURCES: readonly Tool048SourceRef[] = [];

/* ── Cross-tool links (box 8) ─────────────────────────────────────────────── */

export interface Tool048MappedField {
  targetField: string;
  note: string;
}

export interface Tool048CrossToolLink {
  targetToolId: string;
  mappedFields: Tool048MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

/**
 * Related R6 tools that read the same blood-pressure / lipid facts by hand.
 * Nothing is transferred automatically while W18 is undecided; the freshness
 * anchor is the blood-draw date or the protocol start date typed in each tool.
 */
export const TOOL_048_CROSS_TOOL_LINKS: readonly Tool048CrossToolLink[] = [
  {
    targetToolId: 'tool-046-trt-lifetime',
    mappedFields: [
      {
        targetField: 'bloodwork_monitoring_context',
        note: 're-enter the monitoring cost and protocol start date by hand; nothing is copied',
      },
    ],
    freshnessRule: 'the comparison is valid only when both tools use the same protocol start date',
    transfer: 'manual-reentry',
  },
  {
    targetToolId: 'tool-041-hematocrit-monitor',
    mappedFields: [
      {
        targetField: 'blood_draw_date',
        note: 're-enter the blood-draw date by hand; nothing is copied',
      },
    ],
    freshnessRule: 'the comparison is valid only when both tools use the same blood-draw date',
    transfer: 'manual-reentry',
  },
];

/* ── CSV export (browser only) ────────────────────────────────────────────── */

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/**
 * CSV of the entered inputs and the engine result. Generated in the browser
 * only — no server call, no account, no secret, no session identifier.
 */
export function buildCardioRiskCsv(
  input: CardioRiskInput,
  result: CardioRiskResult,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-048-cardiovascular-risk'],
    ['calculated_at', calculatedAt],
    [],
    ['age', String(input.age)],
    ['sex', input.sex],
    ['smoker', String(input.smoker)],
    ['systolic_bp', String(input.systolic_bp)],
    ['total_cholesterol', String(input.total_cholesterol)],
    ['hdl', String(input.hdl)],
    ['on_cycle', String(input.on_cycle)],
    [],
    ['risk_pct_10yr', String(result.risk_pct_10yr)],
    ['band', result.band],
    ['drivers', result.drivers.join('|')],
    ['mitigations', result.mitigations.join('|')],
    ['warnings', result.warnings.join('|')],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
