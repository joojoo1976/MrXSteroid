/**
 * lib/tools/r6/tool-045-cycle-break-planner-contract.ts
 *
 * The tool-owned, non-clinical contract for Tool 045 — Cycle Break Planner.
 *
 * This module is the "content module" half of the same decision taken for Tool
 * 041 (OD-12 option B): it repeats the values the unchanged V6 engine already
 * uses (5× half-life clearance rule, 7-day buffer, PCT window sizing by cycle
 * length, 4-week recheck offset, suppression warning trigger, input bounds) so
 * the interface can explain them, and a sync test proves the repeated values
 * still describe the engine's real behaviour. The engine, schema and adapter
 * are not imported, edited or re-implemented here.
 *
 * Nothing in this file is a new medical threshold, citation or prescription.
 * The engine's existing warnings are preserved and only mapped to localisation
 * keys; every clinical sentence that would need new wording is held as
 * `NOT_AVAILABLE` until a specialist approves it.
 *
 * Pure module: no storage, no network, no session.
 */
import type { CycleBreakResult } from '@/lib/tools/engines/tool-045-cycle-break-planner';
import { CycleBreakInputSchema, type CycleBreakInput } from '@/lib/tools/schemas/tool-045-cycle-break-planner';

/* ── Input shape used by the UI while the user is still typing ─────────────── */

export interface Tool045CompoundDraft {
  /** User-entered label. Empty means "not answered", never a fabricated name. */
  name: string;
  /** Half-life as typed, so an empty field can stay empty. */
  halfLife: string;
  /** Tri-state, so "not answered" is never silently treated as 1. */
  suppression: '' | '1' | '2' | '3';
}

export interface Tool045Draft {
  cycleWeeks: string;
  compounds: Tool045CompoundDraft[];
  /** Tri-state, so "not answered" is never silently treated as "no". */
  wantsBloodwork: '' | 'yes' | 'no';
}

export type Tool045UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool045FieldId =
  | 'cycleWeeks'
  | 'compoundName'
  | 'halfLife'
  | 'suppression'
  | 'wantsBloodwork';

export type Tool045IssueCode = 'invalid_number' | 'out_of_range' | 'required';

export interface Tool045Issue {
  /** Index of the compound row for per-row fields, `null` for the top fields. */
  compoundIndex: number | null;
  field: Tool045FieldId;
  code: Tool045IssueCode;
}

export interface Tool045Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool045Issue[];
  input: CycleBreakInput | null;
}

/* ── The values the engine already uses (mirrored, never re-derived) ───────── */

export const TOOL_045_LIMITS = {
  /** Input contract bounds. */
  cycleWeeksMin: 4,
  cycleWeeksMax: 52,
  halfLifeMin: 0.5,
  halfLifeMax: 30,
  suppressionMin: 1,
  suppressionMax: 3,
  minCompounds: 1,
  maxCompounds: 8,
  /** `days_to_full_clear = ceil(longest half-life × 5)`. */
  clearanceMultiplier: 5,
  /** `pct_start_day = days_to_full_clear + 7`. */
  pctBufferDays: 7,
  /** PCT duration: 4 weeks up to 8, 6 up to 12, otherwise 8. */
  pctShortCycleMaxWeeks: 8,
  pctMediumCycleMaxWeeks: 12,
  pctShortDurationWeeks: 4,
  pctMediumDurationWeeks: 6,
  pctLongDurationWeeks: 8,
  /** Bloodwork recheck is 4 weeks after the PCT window closes. */
  recheckOffsetWeeks: 4,
  /** A mirrored `suppression_factor` of 3 raises the engine warning. */
  heavilySuppressiveAt: 3,
  /** The result schema's display horizon. */
  resultMinDays: 1,
  resultMaxDays: 365,
  /** The engine's clearance unit. */
  unit: 'days',
} as const;

const WARNING_KEYS: Record<string, string> = {
  heavily_suppressive_stack_longer_recovery: 'warning_heavily_suppressive_stack',
  baseline_bloodwork_before_pct_recommended: 'warning_baseline_bloodwork',
};

/**
 * Localised key for an engine warning code. An unknown code is never printed as
 * a raw code: it falls back to a neutral explanation.
 */
export function warningLabelKey(code: string): string {
  return WARNING_KEYS[code] ?? 'warning_unknown';
}

/** The engine's clearance arithmetic, mirrored for the explanation box. */
export function clearanceDays(longestHalfLifeDays: number): number {
  return Math.ceil(longestHalfLifeDays * TOOL_045_LIMITS.clearanceMultiplier);
}

/** The engine's PCT duration for a given cycle length. */
export function pctDurationWeeks(cycleWeeks: number): number {
  if (cycleWeeks <= TOOL_045_LIMITS.pctShortCycleMaxWeeks) return TOOL_045_LIMITS.pctShortDurationWeeks;
  if (cycleWeeks <= TOOL_045_LIMITS.pctMediumCycleMaxWeeks) return TOOL_045_LIMITS.pctMediumDurationWeeks;
  return TOOL_045_LIMITS.pctLongDurationWeeks;
}

/** Whole days, matching the engine's integer output. */
export function formatDays(value: number): string {
  return Number.isFinite(value) ? String(Math.round(value)) : '—';
}

/** Whole weeks, matching the engine's integer output. */
export function formatWeeks(value: number): string {
  return Number.isFinite(value) ? String(Math.round(value)) : '—';
}

/** Clamp a number into the engine's accepted window. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Milestone labels are supplied by the engine in both locales. */
export function milestoneLabel(
  milestone: CycleBreakResult['recovery_milestones'][number],
  locale: 'ar' | 'en',
): string {
  return locale === 'ar' ? milestone.label_ar : milestone.label_en;
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
export function evaluateCycleBreakDraft(draft: Tool045Draft): Tool045Evaluation {
  const issues: Tool045Issue[] = [];

  const cycleRaw = draft.cycleWeeks.trim();
  let cycleWeeks: number | null = null;
  if (cycleRaw !== '') {
    cycleWeeks = numeric(cycleRaw);
    if (cycleWeeks === null) {
      issues.push({ compoundIndex: null, field: 'cycleWeeks', code: 'invalid_number' });
    } else if (
      !Number.isInteger(cycleWeeks) ||
      cycleWeeks < TOOL_045_LIMITS.cycleWeeksMin ||
      cycleWeeks > TOOL_045_LIMITS.cycleWeeksMax
    ) {
      issues.push({ compoundIndex: null, field: 'cycleWeeks', code: 'out_of_range' });
    }
  }

  draft.compounds.forEach((row, index) => {
    const name = row.name.trim();
    if (name.length > 80) {
      issues.push({ compoundIndex: index, field: 'compoundName', code: 'out_of_range' });
    }

    const halfRaw = row.halfLife.trim();
    if (halfRaw !== '') {
      const halfLife = numeric(halfRaw);
      if (halfLife === null) {
        issues.push({ compoundIndex: index, field: 'halfLife', code: 'invalid_number' });
      } else if (
        halfLife < TOOL_045_LIMITS.halfLifeMin ||
        halfLife > TOOL_045_LIMITS.halfLifeMax
      ) {
        issues.push({ compoundIndex: index, field: 'halfLife', code: 'out_of_range' });
      }
    }

    if (row.suppression !== '') {
      const suppression = Number(row.suppression);
      if (
        !Number.isInteger(suppression) ||
        suppression < TOOL_045_LIMITS.suppressionMin ||
        suppression > TOOL_045_LIMITS.suppressionMax
      ) {
        issues.push({ compoundIndex: index, field: 'suppression', code: 'out_of_range' });
      }
    }
  });

  const hasRowContent = (row: Tool045CompoundDraft): boolean =>
    row.name.trim() !== '' || row.halfLife.trim() !== '' || row.suppression !== '';

  const anyEntered =
    cycleRaw !== '' ||
    draft.wantsBloodwork !== '' ||
    draft.compounds.some(hasRowContent);

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  const filledRows = draft.compounds.filter(hasRowContent);
  const everyFilledRowComplete = filledRows.every(
    (row) => row.name.trim() !== '' && row.halfLife.trim() !== '' && row.suppression !== '',
  );

  const complete =
    cycleWeeks !== null &&
    draft.wantsBloodwork !== '' &&
    filledRows.length >= TOOL_045_LIMITS.minCompounds &&
    everyFilledRowComplete;

  if (!complete) return { state: 'PARTIAL', issues, input: null };

  const candidate: CycleBreakInput = {
    cycle_weeks_used: cycleWeeks as number,
    compounds: filledRows.map((row) => ({
      name_en: row.name.trim(),
      half_life_days: Number(row.halfLife.trim()),
      suppression_factor: Number(row.suppression),
    })),
    wants_bloodwork: draft.wantsBloodwork === 'yes',
  };

  const parsed = CycleBreakInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      state: 'INVALID',
      issues: [{ compoundIndex: null, field: 'cycleWeeks', code: 'out_of_range' }],
      input: null,
    };
  }

  return { state: 'READY', issues, input: parsed.data };
}

/* ── Public reference sources (C4) ────────────────────────────────────────── */

export interface Tool045SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

/**
 * No approved source exists in the repository for Tool 045. The box therefore
 * renders `NOT_AVAILABLE — no approved source recorded` and this list stays
 * empty until the owner/specialist supplies a checked reference.
 */
export const TOOL_045_SOURCES: readonly Tool045SourceRef[] = [];

/* ── Cross-tool links (box 8) ─────────────────────────────────────────────── */

export interface Tool045MappedField {
  targetField: string;
  note: string;
}

export interface Tool045CrossToolLink {
  targetToolId: string;
  mappedFields: Tool045MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

/**
 * Related R6 tools that read the same cycle/recovery facts by hand. Nothing is
 * transferred automatically while W18 is undecided; the freshness anchor is the
 * last-dose date the user typed in each tool.
 */
export const TOOL_045_CROSS_TOOL_LINKS: readonly Tool045CrossToolLink[] = [
  {
    targetToolId: 'tool-023-trt-optimization',
    mappedFields: [
      {
        targetField: 'trt_cycle_context',
        note: 're-enter the cycle length and last-dose date by hand',
      },
    ],
    freshnessRule: 'the values are comparable only when both tools use the same last-dose date',
    transfer: 'manual-reentry',
  },
  {
    targetToolId: 'tool-046-trt-lifetime',
    mappedFields: [
      {
        targetField: 'cycle_history_months',
        note: 're-enter the completed cycle length by hand; nothing is copied',
      },
    ],
    freshnessRule: 'the plan is comparable only when both tools use the same last-dose date',
    transfer: 'manual-reentry',
  },
];

/* ── CSV export (browser only) ────────────────────────────────────────────── */

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/**
 * CSV of the entered inputs and the engine result. Generated in the browser
 * only — no server call, no account, no secret, no session identifier.
 */
export function buildCycleBreakCsv(
  input: CycleBreakInput,
  result: CycleBreakResult,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-045-cycle-break-planner'],
    ['calculated_at', calculatedAt],
    [],
    ['cycle_weeks_used', String(input.cycle_weeks_used)],
    ['wants_bloodwork', String(input.wants_bloodwork)],
    [],
    ['compound_index', 'name_en', 'half_life_days', 'suppression_factor'],
    ...input.compounds.map((compound, index) => [
      String(index + 1),
      compound.name_en,
      String(compound.half_life_days),
      String(compound.suppression_factor),
    ]),
    [],
    ['days_to_full_clear', String(result.days_to_full_clear)],
    ['pct_start_day', String(result.pct_start_day)],
    ['pct_duration_weeks', String(result.pct_duration_weeks)],
    ['total_weeks_to_baseline', String(result.total_weeks_to_baseline)],
    ['warnings', result.warnings.join('|')],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
