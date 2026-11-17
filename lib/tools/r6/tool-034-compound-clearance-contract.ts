/**
 * lib/tools/r6/tool-034-compound-clearance-contract.ts
 */
import {
  ClearanceInputSchema,
  ClearanceResultSchema,
  type ClearanceInput,
  type ClearanceResult,
} from '@/lib/tools/schemas/tool-034-compound-clearance';

export type { ClearanceInput, ClearanceResult };

export interface Tool034Draft {
  compoundName: string;
  halfLifeDays: string;
  halfLifeSource: string;
  lastDoseDate: string;
  asOfDate: string;
  thresholdFraction: string;
}

export type Tool034UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool034FieldId =
  | 'compoundName'
  | 'halfLifeDays'
  | 'halfLifeSource'
  | 'lastDoseDate'
  | 'asOfDate'
  | 'thresholdFraction';

export type Tool034IssueCode =
  | 'invalid_number'
  | 'out_of_range'
  | 'required'
  | 'schema_mismatch';

export interface Tool034Issue {
  field: Tool034FieldId;
  code: Tool034IssueCode;
}

export interface Tool034Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool034Issue[];
  input: ClearanceInput | null;
}

export const TOOL_034_LIMITS = {
  halfLifeDaysMin: 0.5,
  halfLifeDaysMax: 365,
  thresholdFractionMin: 0.001,
  thresholdFractionMax: 0.2,
  compoundNameMin: 1,
  compoundNameMax: 80,
  halfLifeSourceMin: 3,
  halfLifeSourceMax: 500,
  unit: 'day',
} as const;

export function formatDays(value: number): string {
  return Number.isFinite(value) ? String(value) : '—';
}

export function formatPercent(value: number): string {
  return Number.isFinite(value) ? `${value}%` : '—';
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function numeric(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function isoDate(text: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(text.trim());
}

export function evaluateClearanceDraft(draft: Tool034Draft): Tool034Evaluation {
  const issues: Tool034Issue[] = [];

  if (draft.compoundName.trim() !== '' && (draft.compoundName.trim().length < 1 || draft.compoundName.trim().length > 80)) {
    issues.push({ field: 'compoundName', code: 'out_of_range' });
  }

  const halfLife = numeric(draft.halfLifeDays);
  if (draft.halfLifeDays.trim() !== '' && halfLife === null) {
    issues.push({ field: 'halfLifeDays', code: 'invalid_number' });
  } else if (halfLife !== null && (halfLife < 0.5 || halfLife > 365)) {
    issues.push({ field: 'halfLifeDays', code: 'out_of_range' });
  }

  if (draft.halfLifeSource.trim() !== '' && (draft.halfLifeSource.trim().length < 3 || draft.halfLifeSource.trim().length > 500)) {
    issues.push({ field: 'halfLifeSource', code: 'out_of_range' });
  }

  if (draft.lastDoseDate.trim() !== '' && !isoDate(draft.lastDoseDate)) {
    issues.push({ field: 'lastDoseDate', code: 'invalid_number' });
  }

  if (draft.asOfDate.trim() !== '' && !isoDate(draft.asOfDate)) {
    issues.push({ field: 'asOfDate', code: 'invalid_number' });
  }

  const threshold = numeric(draft.thresholdFraction);
  if (draft.thresholdFraction.trim() !== '' && threshold === null) {
    issues.push({ field: 'thresholdFraction', code: 'invalid_number' });
  } else if (threshold !== null && (threshold < 0.001 || threshold > 0.2)) {
    issues.push({ field: 'thresholdFraction', code: 'out_of_range' });
  }

  const anyEntered =
    draft.compoundName.trim() !== '' ||
    draft.halfLifeDays.trim() !== '' ||
    draft.halfLifeSource.trim() !== '' ||
    draft.lastDoseDate.trim() !== '' ||
    draft.asOfDate.trim() !== '' ||
    draft.thresholdFraction.trim() !== '';

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  const complete =
    draft.compoundName.trim().length >= 1 &&
    draft.compoundName.trim().length <= 80 &&
    halfLife !== null &&
    halfLife >= 0.5 &&
    halfLife <= 365 &&
    draft.halfLifeSource.trim().length >= 3 &&
    draft.halfLifeSource.trim().length <= 500 &&
    isoDate(draft.lastDoseDate) &&
    isoDate(draft.asOfDate) &&
    (threshold === null || (threshold >= 0.001 && threshold <= 0.2));

  if (!complete) return { state: 'PARTIAL', issues, input: null };

  const candidate: ClearanceInput = {
    compound_name: draft.compoundName.trim(),
    half_life_days: halfLife as number,
    half_life_source: draft.halfLifeSource.trim(),
    last_dose_date: draft.lastDoseDate.trim(),
    as_of_date: draft.asOfDate.trim(),
    threshold_fraction: threshold === null ? 0.01 : threshold,
  };

  const parsed = ClearanceInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return { state: 'INVALID', issues: [{ field: 'compoundName', code: 'schema_mismatch' }], input: null };
  }

  return { state: 'READY', issues, input: parsed.data };
}

/* ── Sources (C4) ─────────────────────────────────────────────────────────── */

export interface Tool034SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

export const TOOL_034_SOURCES: readonly Tool034SourceRef[] = [];

/* ── Cross-tool links (box 8) ─────────────────────────────────────────────── */

export interface Tool034MappedField {
  targetField: string;
  note: string;
}

export interface Tool034CrossToolLink {
  targetToolId: string;
  mappedFields: Tool034MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

export const TOOL_034_CROSS_TOOL_LINKS: readonly Tool034CrossToolLink[] = [
  {
    targetToolId: 'tool-016-half-life-calculator',
    mappedFields: [
      {
        targetField: 'half_life_days',
        note: 're-enter the half-life by hand; nothing is copied',
      },
    ],
    freshnessRule: 'the comparison is valid only when both tools use the same half-life value',
    transfer: 'manual-reentry',
  },
];

/* ── CSV export (browser only) ────────────────────────────────────────────── */

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function buildClearanceCsv(
  input: ClearanceInput,
  result: ClearanceResult,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-034-compound-clearance'],
    ['calculated_at', calculatedAt],
    [],
    ['compound_name', input.compound_name],
    ['half_life_days', String(input.half_life_days)],
    ['half_life_source', input.half_life_source],
    ['last_dose_date', input.last_dose_date],
    ['as_of_date', input.as_of_date],
    ['threshold_fraction', String(input.threshold_fraction ?? 0.01)],
    [],
    ['days_to_threshold', String(result.days_to_threshold)],
    ['threshold_date', result.threshold_date],
    ['days_elapsed', String(result.days_elapsed)],
    ['modeled_remaining_percent', String(result.modeled_remaining_percent)],
    ['threshold_reached', String(result.threshold_reached)],
    ['threshold_fraction', String(result.threshold_fraction)],
    ['curve', result.curve.map((p) => `${p.days_after_last_dose}:${p.remaining_percent}`).join('|')],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
