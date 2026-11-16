/**
 * lib/tools/r6/tool-047-fertility-preservation-contract.ts
 *
 * The tool-owned, non-clinical contract for Tool 047 — Fertility Preservation
 * Guide.
 *
 * This module is the "content module" half of the same decision taken for Tool
 * 041 (OD-12 option B): it repeats the values the unchanged V6 engine already
 * uses (impact tiers, HCG offsets, recovery bases, age offsets, planning
 * horizon, hint triggers, warning triggers, input bounds) so the interface can
 * explain them, and a sync test proves the repeated values still describe the
 * engine's real behaviour. The engine, schema and adapter are not imported,
 * edited or re-implemented here.
 *
 * Nothing in this file is a new medical threshold, citation, prescription or
 * treatment recommendation. The engine's existing hints and warnings are
 * preserved and only mapped to localisation keys; every clinical sentence that
 * would need new wording is held as `NOT_AVAILABLE` until a specialist
 * approves it.
 *
 * Pure module: no storage, no network, no session.
 */
import {
  FertilityInputSchema,
  FertilityResultSchema,
  type FertilityInput,
} from '@/lib/tools/schemas/tool-047-fertility-preservation';

/** The result shape, derived from the canonical schema (no engine import). */
export type FertilityResult = ReturnType<typeof FertilityResultSchema.parse>;

/* ── Input shape used by the UI while the user is still typing ─────────────── */

export type Tool047SuppressionLevel = '' | '1' | '2' | '3';
export type Tool047Hcg = '' | 'yes' | 'no';

export interface Tool047Draft {
  age: string;
  suppressionLevel: Tool047SuppressionLevel;
  usesHcg: Tool047Hcg;
  horizonMonths: string;
}

export type Tool047UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool047FieldId = 'age' | 'suppressionLevel' | 'usesHcg' | 'horizonMonths';

export type Tool047IssueCode =
  | 'invalid_number'
  | 'out_of_range'
  | 'required'
  | 'schema_mismatch';

export interface Tool047Issue {
  field: Tool047FieldId;
  code: Tool047IssueCode;
}

export interface Tool047Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool047Issue[];
  input: FertilityInput | null;
}

/* ── The values the engine already uses (mirrored, never re-derived) ───────── */

export const TOOL_047_LIMITS = {
  /** Input contract bounds. */
  ageMin: 18,
  ageMax: 60,
  horizonMin: 0,
  horizonMax: 36,
  /** Engine impact tier per suppression level. */
  impactByLevel: { 1: 40, 2: 65, 3: 85 } as const,
  /** Engine HCG impact offset (subtracted), with a floor of 10 %. */
  hcgImpactOffset: 15,
  impactFloorPct: 10,
  /** Engine recovery months per suppression level. */
  recoveryByLevel: { 1: 3, 2: 6, 3: 12 } as const,
  /** Engine HCG recovery offset (subtracted), with a floor of 1 month. */
  hcgRecoveryOffset: 2,
  recoveryFloorMonths: 1,
  /** Engine age offsets: > 35 → +3, > 28 → +1. */
  ageOffsetOver35: 3,
  ageOffsetOver28: 1,
  age35Exclusive: 35,
  age28Exclusive: 28,
  /** Engine warning triggers. */
  warningImpactAtLeastPct: 65,
  warningAgeAbove: 40,
  /** The engine's canonical unit. */
  unit: 'months',
} as const;

const HINT_KEYS: Record<string, string> = {
  off_cycle_semen_analysis_recommended: 'hint_semen_analysis',
  hcg_preservation_discussed: 'hint_hcg_discussed',
  limit_19nor_exposure: 'hint_limit_19nor',
  defer_cycle_until_family_planning_settled: 'hint_defer_cycle',
};

/** Localised key for an engine protocol hint. */
export function hintLabelKey(code: string): string {
  return HINT_KEYS[code] ?? 'hint_unknown';
}

const WARNING_KEYS: Record<string, string> = {
  high_suppression_impact_medical_consult: 'warning_high_impact',
  age_related_decline_not_modeled: 'warning_age_decline',
};

/**
 * Localised key for an engine warning code. An unknown code is never printed as
 * a raw code: it falls back to a neutral explanation.
 */
export function warningLabelKey(code: string): string {
  return WARNING_KEYS[code] ?? 'warning_unknown';
}

const LEVEL_KEYS: Record<string, string> = {
  '1': 'level_1',
  '2': 'level_2',
  '3': 'level_3',
};

/** Localisation key for the selected suppression level. */
export function suppressionLevelKey(level: number): string {
  return LEVEL_KEYS[String(level)] ?? 'level_unknown';
}

/** The engine's impact arithmetic, mirrored for the explanation box. */
export function impactPct(level: 1 | 2 | 3, usesHcg: boolean): number {
  return Math.max(
    TOOL_047_LIMITS.impactFloorPct,
    TOOL_047_LIMITS.impactByLevel[level] - (usesHcg ? TOOL_047_LIMITS.hcgImpactOffset : 0),
  );
}

/** The engine's recovery arithmetic, mirrored for the explanation box. */
export function recoveryMonths(level: 1 | 2 | 3, usesHcg: boolean, age: number): number {
  let months =
    TOOL_047_LIMITS.recoveryByLevel[level] -
    (usesHcg ? TOOL_047_LIMITS.hcgRecoveryOffset : 0);
  if (age > TOOL_047_LIMITS.age35Exclusive) months += TOOL_047_LIMITS.ageOffsetOver35;
  else if (age > TOOL_047_LIMITS.age28Exclusive) months += TOOL_047_LIMITS.ageOffsetOver28;
  return Math.max(TOOL_047_LIMITS.recoveryFloorMonths, months);
}

/** The engine's horizon test: a zero horizon never "fits". */
export function fitsHorizon(recovery: number, horizonMonths: number): boolean {
  return horizonMonths > 0 && recovery <= horizonMonths;
}

/** Percent with no invented precision (the engine returns whole numbers). */
export function formatPct(value: number): string {
  return Number.isFinite(value) ? `${Math.round(value)}%` : '—';
}

/** Whole months. */
export function formatMonths(value: number): string {
  return Number.isFinite(value) ? String(Math.round(value)) : '—';
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

/**
 * Evaluate the draft once, in the documented order:
 * EMPTY → INVALID → PARTIAL → READY. The READY candidate is parsed by the
 * canonical Zod input contract, so this function cannot drift from it.
 *
 * A typed `0` horizon is a real value (it means "no planning horizon"), never
 * "not answered".
 */
export function evaluateFertilityDraft(draft: Tool047Draft): Tool047Evaluation {
  const issues: Tool047Issue[] = [];

  const ageRaw = draft.age.trim();
  let age: number | null = null;
  if (ageRaw !== '') {
    age = numeric(ageRaw);
    if (age === null) {
      issues.push({ field: 'age', code: 'invalid_number' });
    } else if (age < TOOL_047_LIMITS.ageMin || age > TOOL_047_LIMITS.ageMax) {
      issues.push({ field: 'age', code: 'out_of_range' });
    }
  }

  if (
    draft.suppressionLevel !== '' &&
    draft.suppressionLevel !== '1' &&
    draft.suppressionLevel !== '2' &&
    draft.suppressionLevel !== '3'
  ) {
    issues.push({ field: 'suppressionLevel', code: 'out_of_range' });
  }

  if (draft.usesHcg !== '' && draft.usesHcg !== 'yes' && draft.usesHcg !== 'no') {
    issues.push({ field: 'usesHcg', code: 'out_of_range' });
  }

  const horizonRaw = draft.horizonMonths.trim();
  let horizon: number | null = null;
  if (horizonRaw !== '') {
    horizon = numeric(horizonRaw);
    if (horizon === null) {
      issues.push({ field: 'horizonMonths', code: 'invalid_number' });
    } else if (
      horizon < TOOL_047_LIMITS.horizonMin ||
      horizon > TOOL_047_LIMITS.horizonMax
    ) {
      issues.push({ field: 'horizonMonths', code: 'out_of_range' });
    }
  }

  const anyEntered =
    draft.age.trim() !== '' ||
    draft.suppressionLevel !== '' ||
    draft.usesHcg !== '' ||
    draft.horizonMonths.trim() !== '';

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  const complete =
    age !== null &&
    draft.suppressionLevel !== '' &&
    draft.usesHcg !== '' &&
    horizon !== null;

  if (!complete) return { state: 'PARTIAL', issues, input: null };

  const candidate: FertilityInput = {
    age: age as number,
    suppression_level: Number(draft.suppressionLevel) as 1 | 2 | 3,
    uses_hcg: draft.usesHcg === 'yes',
    planning_horizon_months: horizon as number,
  };

  const parsed = FertilityInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return { state: 'INVALID', issues: [{ field: 'age', code: 'schema_mismatch' }], input: null };
  }

  return { state: 'READY', issues, input: parsed.data };
}

/* ── Public reference sources (C4) ────────────────────────────────────────── */

export interface Tool047SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

/**
 * No approved source exists in the repository for Tool 047. The box therefore
 * renders `NOT_AVAILABLE — no approved source recorded` and this list stays
 * empty until the owner/specialist supplies a checked reference.
 */
export const TOOL_047_SOURCES: readonly Tool047SourceRef[] = [];

/* ── Cross-tool links (box 8) ─────────────────────────────────────────────── */

export interface Tool047MappedField {
  targetField: string;
  note: string;
}

export interface Tool047CrossToolLink {
  targetToolId: string;
  mappedFields: Tool047MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

/**
 * Related R6 tools that read the same suppression/recovery facts by hand.
 * Nothing is transferred automatically while W18 is undecided; the freshness
 * anchor is the protocol start date the user typed in each tool.
 */
export const TOOL_047_CROSS_TOOL_LINKS: readonly Tool047CrossToolLink[] = [
  {
    targetToolId: 'tool-023-trt-optimization',
    mappedFields: [
      {
        targetField: 'suppression_level',
        note: 're-enter the same suppression level by hand; nothing is copied',
      },
    ],
    freshnessRule: 'the comparison is valid only when both tools use the same protocol start date',
    transfer: 'manual-reentry',
  },
  {
    targetToolId: 'tool-045-cycle-break-planner',
    mappedFields: [
      {
        targetField: 'recovery_window',
        note: 're-enter the cycle length and last-dose date by hand',
      },
    ],
    freshnessRule: 'the comparison is valid only when both tools use the same last-dose date',
    transfer: 'manual-reentry',
  },
];

/* ── CSV export (browser only) ────────────────────────────────────────────── */

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/**
 * CSV of the entered inputs and the engine result. Generated in the browser
 * only — no server call, no account, no secret, no session identifier.
 */
export function buildFertilityCsv(
  input: FertilityInput,
  result: FertilityResult,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-047-fertility-preservation'],
    ['calculated_at', calculatedAt],
    [],
    ['age', String(input.age)],
    ['suppression_level', String(input.suppression_level)],
    ['uses_hcg', String(input.uses_hcg)],
    ['planning_horizon_months', String(input.planning_horizon_months)],
    [],
    ['fertility_impact_pct', String(result.fertility_impact_pct)],
    ['recovery_projection_months', String(result.recovery_projection_months)],
    ['within_horizon', String(result.within_horizon)],
    ['protocol_hints', result.protocol_hints.join('|')],
    ['warnings', result.warnings.join('|')],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
