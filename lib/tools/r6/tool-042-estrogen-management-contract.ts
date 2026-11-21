/**
 * lib/tools/r6/tool-042-estrogen-management-contract.ts
 *
 * The tool-owned, non-clinical contract for Tool 042 — Estrogen Management Pro.
 *
 * This module is the "content module" half of the same decision taken for Tool
 * 041 (OD-12 option B): it repeats the values the unchanged V6 engine already
 * uses (E2 band edges, symptom-escalation threshold, AI-delta steps, warning
 * triggers, input bounds) so the interface can explain them, and a sync test
 * proves the repeated values still describe the engine's real behaviour. The
 * engine, schema and adapter are not imported, edited or re-implemented here.
 *
 * Nothing in this file is a new medical threshold, citation, prescription or
 * dosing recommendation. The engine's existing warnings and AI-delta hints are
 * preserved and only mapped to localisation keys; every clinical sentence that
 * would need new wording is held as `NOT_AVAILABLE` until a specialist
 * approves it.
 *
 * Pure module: no storage, no network, no session.
 */
import {
  EstrogenInputSchema,
  EstrogenResultSchema,
  type EstrogenInput,
} from '@/lib/tools/schemas/tool-042-estrogen-management';

/** The result shape, derived from the canonical schema (no engine import). */
type EstrogenResult = ReturnType<typeof EstrogenResultSchema.parse>;

/* ── Input shape used by the UI while the user is still typing ─────────────── */

export type Tool042Symptom =
  | 'nipple_sensitivity'
  | 'water_retention'
  | 'mood_swings'
  | 'low_libido'
  | 'edema';

export const TOOL_042_SYMPTOMS: readonly Tool042Symptom[] = [
  'nipple_sensitivity',
  'water_retention',
  'mood_swings',
  'low_libido',
  'edema',
];

export interface Tool042Draft {
  /** E2 as typed, so an empty field can stay empty (a typed 0 is not valid). */
  e2: string;
  weeklyTest: string;
  /** Tri-state so "not answered" is never silently treated as "no". */
  takingAi: '' | 'yes' | 'no';
  aiDose: string;
  bodyFat: string;
  symptoms: Tool042Symptom[];
}

export type Tool042UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool042FieldId = 'e2' | 'weeklyTest' | 'takingAi' | 'aiDose' | 'bodyFat' | 'symptoms';

export type Tool042IssueCode = 'invalid_number' | 'out_of_range' | 'required' | 'not_applicable';

export interface Tool042Issue {
  field: Tool042FieldId;
  code: Tool042IssueCode;
}

export interface Tool042Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool042Issue[];
  input: EstrogenInput | null;
}

/* ── The values the engine already uses (mirrored, never re-derived) ───────── */

export const TOOL_042_LIMITS = {
  /** Input contract bounds. */
  e2Min: 5,
  e2Max: 500,
  weeklyTestMin: 0,
  weeklyTestMax: 1000,
  aiDoseMin: 0,
  aiDoseMax: 7,
  bodyFatMin: 5,
  bodyFatMax: 60,
  /** Engine band edges (pg/mL). */
  optimalLow: 10,
  optimalHigh: 40,
  elevatedCeiling: 60,
  /** Above this value the engine adds `e2_extreme_seek_physician`. */
  extremeE2: 100,
  /** This many symptoms escalate an in-range reading to `elevated`. */
  symptomEscalationCount: 2,
  /** AI-delta steps suggested by the engine (mg/week of the CURRENT dose). */
  aiDeltaHigh: 0.5,
  aiDeltaElevated: 0.25,
  aiDeltaLow: -0.25,
  /** The engine only ever suggests ±1 mg/week and only for an existing AI. */
  aiDeltaCap: 1,
  /** The engine's unit. */
  unit: 'pg/mL',
} as const;

export const TOOL_042_BANDS = ['low', 'optimal', 'elevated', 'high'] as const;
export type Tool042Band = (typeof TOOL_042_BANDS)[number];

export const TOOL_042_ACTIONS = ['none', 'monitor', 'adjust_ai', 'reduce_test'] as const;
export type Tool042Action = (typeof TOOL_042_ACTIONS)[number];

const BAND_KEYS: Record<Tool042Band, string> = {
  low: 'band_low',
  optimal: 'band_optimal',
  elevated: 'band_elevated',
  high: 'band_high',
};

/** Localised key for a band; never returns the raw engine code. */
export function bandLabelKey(band: string): string {
  return BAND_KEYS[band as Tool042Band] ?? 'band_unknown';
}

const ACTION_KEYS: Record<Tool042Action, string> = {
  none: 'action_none',
  monitor: 'action_monitor',
  adjust_ai: 'action_adjust_ai',
  reduce_test: 'action_reduce_test',
};

/** Localised key for an action; never returns the raw engine code. */
export function actionLabelKey(action: string): string {
  return ACTION_KEYS[action as Tool042Action] ?? 'action_unknown';
}

const SYMPTOM_KEYS: Record<Tool042Symptom, string> = {
  nipple_sensitivity: 'symptom_nipple_sensitivity',
  water_retention: 'symptom_water_retention',
  mood_swings: 'symptom_mood_swings',
  low_libido: 'symptom_low_libido',
  edema: 'symptom_edema',
};

export function symptomLabelKey(symptom: Tool042Symptom): string {
  return SYMPTOM_KEYS[symptom];
}

const WARNING_KEYS: Record<string, string> = {
  elevated_e2_without_ai_discuss_with_prescriber: 'warning_elevated_e2_without_ai',
  ai_may_be_overshooting: 'warning_ai_may_be_overshooting',
  low_e2_without_ai_check_prolactin_lh: 'warning_low_e2_without_ai',
  e2_extreme_seek_physician: 'warning_e2_extreme',
};

/**
 * Localised key for an engine warning code. An unknown code is never printed as
 * a raw code: it falls back to a neutral explanation.
 */
export function warningLabelKey(code: string): string {
  return WARNING_KEYS[code] ?? 'warning_unknown';
}

/** One decimal, matching the precision the UI shows for E2. */
export function formatE2(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : '—';
}

/** Signed AI delta in mg/week, two decimals (the engine's steps are 0.25). */
export function formatAiDelta(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const rounded = Math.round(value * 100) / 100;
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(2)}`;
}

/* ── Draft evaluation (the five-state model) ───────────────────────────────── */

function numeric(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

/**
 * Evaluate the draft once, in the documented order:
 * EMPTY → INVALID → PARTIAL → READY. The READY candidate is parsed by the
 * canonical Zod input contract, so this function cannot drift from it.
 */
export function evaluateEstrogenDraft(draft: Tool042Draft): Tool042Evaluation {
  const issues: Tool042Issue[] = [];

  const e2Raw = draft.e2.trim();
  let e2: number | null = null;
  if (e2Raw !== '') {
    e2 = numeric(e2Raw);
    if (e2 === null) issues.push({ field: 'e2', code: 'invalid_number' });
    else if (e2 < TOOL_042_LIMITS.e2Min || e2 > TOOL_042_LIMITS.e2Max) {
      issues.push({ field: 'e2', code: 'out_of_range' });
    }
  }

  const testRaw = draft.weeklyTest.trim();
  let weeklyTest: number | null = null;
  if (testRaw !== '') {
    weeklyTest = numeric(testRaw);
    if (weeklyTest === null) issues.push({ field: 'weeklyTest', code: 'invalid_number' });
    else if (weeklyTest < TOOL_042_LIMITS.weeklyTestMin || weeklyTest > TOOL_042_LIMITS.weeklyTestMax) {
      issues.push({ field: 'weeklyTest', code: 'out_of_range' });
    }
  }

  const bodyFatRaw = draft.bodyFat.trim();
  let bodyFat: number | null = null;
  if (bodyFatRaw !== '') {
    bodyFat = numeric(bodyFatRaw);
    if (bodyFat === null) issues.push({ field: 'bodyFat', code: 'invalid_number' });
    else if (bodyFat < TOOL_042_LIMITS.bodyFatMin || bodyFat > TOOL_042_LIMITS.bodyFatMax) {
      issues.push({ field: 'bodyFat', code: 'out_of_range' });
    }
  }

  const doseRaw = draft.aiDose.trim();
  let aiDose: number | null = null;
  if (doseRaw !== '') {
    aiDose = numeric(doseRaw);
    if (aiDose === null) issues.push({ field: 'aiDose', code: 'invalid_number' });
    else if (aiDose < TOOL_042_LIMITS.aiDoseMin || aiDose > TOOL_042_LIMITS.aiDoseMax) {
      issues.push({ field: 'aiDose', code: 'out_of_range' });
    }
  }

  if (draft.takingAi === 'no' && doseRaw !== '' && aiDose !== 0) {
    // A dose was typed while the user says no AI is taken: say so instead of
    // silently discarding the value.
    issues.push({ field: 'aiDose', code: 'not_applicable' });
  }

  const anyEntered =
    e2Raw !== '' ||
    testRaw !== '' ||
    bodyFatRaw !== '' ||
    doseRaw !== '' ||
    draft.takingAi !== '' ||
    draft.symptoms.length > 0;

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  const complete = e2 !== null && weeklyTest !== null && bodyFat !== null && draft.takingAi !== '';
  const doseComplete = draft.takingAi !== 'yes' || aiDose !== null;

  if (!complete || !doseComplete) return { state: 'PARTIAL', issues, input: null };

  const candidate: EstrogenInput = {
    e2_pg_ml: e2 as number,
    weekly_testosterone_mg: weeklyTest as number,
    taking_ai: draft.takingAi === 'yes',
    weekly_ai_dose_mg: draft.takingAi === 'yes' ? (aiDose as number) : 0,
    symptoms: [...draft.symptoms],
    body_fat_pct: bodyFat as number,
  };

  const parsed = EstrogenInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return { state: 'INVALID', issues: [{ field: 'e2', code: 'out_of_range' }], input: null };
  }

  return { state: 'READY', issues, input: parsed.data };
}

/* ── Public reference sources (C4) ────────────────────────────────────────── */

export interface Tool042SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

/**
 * No approved source exists in the repository for Tool 042. The box therefore
 * renders `NOT_AVAILABLE — no approved source recorded` and this list stays
 * empty until the owner/specialist supplies a checked reference.
 */
export const TOOL_042_SOURCES: readonly Tool042SourceRef[] = [];

/* ── Cross-tool links (box 8) ─────────────────────────────────────────────── */

export interface Tool042MappedField {
  targetField: string;
  note: string;
}

export interface Tool042CrossToolLink {
  targetToolId: string;
  mappedFields: Tool042MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

/**
 * Related R6 tools that read the same blood panel by hand. Nothing is
 * transferred automatically while W18 is undecided; the freshness anchor is
 * the date the user typed in each tool.
 */
export const TOOL_042_CROSS_TOOL_LINKS: readonly Tool042CrossToolLink[] = [
  {
    targetToolId: 'tool-006-estrogen-prolactin',
    mappedFields: [
      { targetField: 'e2Level', note: 're-enter the same E2 value and unit by hand' },
    ],
    freshnessRule: 'the values are comparable only when both tools use the same blood-draw date',
    transfer: 'manual-reentry',
  },
  {
    targetToolId: 'tool-023-trt-optimization',
    mappedFields: [
      { targetField: 'e2_current_pg_mL', note: 're-enter the same E2 value by hand; it is optional there' },
    ],
    freshnessRule: 'the values are comparable only when both tools use the same blood-draw date',
    transfer: 'manual-reentry',
  },
];

/* ── CSV export (browser only) ────────────────────────────────────────────── */

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/**
 * CSV of the entered inputs and the engine result. Generated in the browser
 * only — no server call, no account, no secret, no session identifier.
 */
export function buildEstrogenCsv(
  input: EstrogenInput,
  result: EstrogenResult,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-042-estrogen-management'],
    ['calculated_at', calculatedAt],
    [],
    ['e2_pg_ml', String(input.e2_pg_ml)],
    ['weekly_testosterone_mg', String(input.weekly_testosterone_mg)],
    ['taking_ai', String(input.taking_ai)],
    ['weekly_ai_dose_mg', String(input.weekly_ai_dose_mg)],
    ['body_fat_pct', String(input.body_fat_pct)],
    ['symptoms', input.symptoms.join('|')],
    [],
    ['band', result.band],
    ['optimal_low_pg_ml', String(result.optimal_range.low)],
    ['optimal_high_pg_ml', String(result.optimal_range.high)],
    ['ai_delta_mg_per_week', String(result.ai_delta_mg)],
    ['action', result.action],
    ['warnings', result.warnings.join('|')],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
