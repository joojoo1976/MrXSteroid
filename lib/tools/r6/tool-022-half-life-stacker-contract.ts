/**
 * lib/tools/r6/tool-022-half-life-stacker-contract.ts
 */
import {
  StackTimingInputSchema,
  StackTimingResultSchema,
  type StackTimingInput,
  type StackTimingResult,
  type EsterCompound,
} from '@/lib/tools/schemas/tool-022-half-life-stacker';

export type { StackTimingInput, StackTimingResult };

export type Tool022Frequency = '' | 'daily' | 'every-other-day' | '2x-week' | '1x-week';

export interface Tool022Draft {
  selectedCompounds: Array<{
    id: number;
    name_en: string;
    name_ar: string;
    family: string;
    ester_type: any;
    half_life_days: number;
    release_rate: any;
    anabolic_score: number;
    androgenic_score: number;
    description_text: string;
  }>;
  cycleLengthWeeks: string;
  injectionFrequency: Tool022Frequency;
}

export type Tool022UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool022FieldId = 'selectedCompounds' | 'cycleLengthWeeks' | 'injectionFrequency';

export type Tool022IssueCode =
  | 'invalid_number'
  | 'out_of_range'
  | 'required'
  | 'schema_mismatch';

export interface Tool022Issue {
  field: Tool022FieldId;
  code: Tool022IssueCode;
}

export interface Tool022Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool022Issue[];
  input: StackTimingInput | null;
}

export const TOOL_022_LIMITS = {
  compoundsMin: 1,
  compoundsMax: 6,
  cycleLengthWeeksMin: 1,
  cycleLengthWeeksMax: 52,
  unit: 'day',
} as const;

export const TOOL_022_FREQUENCIES = ['daily', 'every-other-day', '2x-week', '1x-week'] as const;

export function formatDays(value: number): string {
  return Number.isFinite(value) ? String(Math.round(value)) : '—';
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

export function evaluateStackerDraft(draft: Tool022Draft): Tool022Evaluation {
  const issues: Tool022Issue[] = [];

  const cycleLength = numeric(draft.cycleLengthWeeks);
  if (draft.cycleLengthWeeks.trim() !== '' && cycleLength === null) {
    issues.push({ field: 'cycleLengthWeeks', code: 'invalid_number' });
  } else if (cycleLength !== null && (cycleLength < 1 || cycleLength > 52)) {
    issues.push({ field: 'cycleLengthWeeks', code: 'out_of_range' });
  }

  if (draft.injectionFrequency !== '' && !TOOL_022_FREQUENCIES.includes(draft.injectionFrequency as any)) {
    issues.push({ field: 'injectionFrequency', code: 'out_of_range' });
  }

  const anyEntered =
    draft.selectedCompounds.length > 0 ||
    draft.cycleLengthWeeks.trim() !== '' ||
    draft.injectionFrequency !== '';

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  const hasCompounds = draft.selectedCompounds.length >= 1 && draft.selectedCompounds.length <= 6;
  const hasCycle = cycleLength !== null && cycleLength >= 1 && cycleLength <= 52;
  const hasFreq = draft.injectionFrequency !== '';

  if (!hasCompounds || !hasCycle || !hasFreq) return { state: 'PARTIAL', issues, input: null };

  const candidate: StackTimingInput = {
    compounds: draft.selectedCompounds as StackTimingInput['compounds'],
    cycle_length_weeks: cycleLength as number,
    injection_frequency: draft.injectionFrequency as StackTimingInput['injection_frequency'],
  };

  const parsed = StackTimingInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return { state: 'INVALID', issues: [{ field: 'selectedCompounds', code: 'schema_mismatch' }], input: null };
  }

  return { state: 'READY', issues, input: parsed.data };
}

// Note: compound resolution happens in the component. The pipeline call is made
// by the component with resolved EsterCompound objects. The draft evaluation
// only validates the scalar fields; compound presence is checked via selectedCompounds length.

/* ── Sources (C4) ─────────────────────────────────────────────────────────── */

export interface Tool022SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

export const TOOL_022_SOURCES: readonly Tool022SourceRef[] = [];

/* ── Cross-tool links (box 8) ─────────────────────────────────────────────── */

export interface Tool022MappedField {
  targetField: string;
  note: string;
}

export interface Tool022CrossToolLink {
  targetToolId: string;
  mappedFields: Tool022MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

export const TOOL_022_CROSS_TOOL_LINKS: readonly Tool022CrossToolLink[] = [
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

export function buildStackerCsv(
  input: StackTimingInput,
  result: StackTimingResult,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-022-half-life-stacker'],
    ['calculated_at', calculatedAt],
    [],
    ['cycle_length_weeks', String(input.cycle_length_weeks)],
    ['injection_frequency', input.injection_frequency],
    ['compounds', input.compounds.map((c) => c.name_en).join('|')],
    [],
    ['peak_platform_days', String(result.peak_platform_days)],
    ['total_cycle_half_lives', String(result.total_cycle_half_lives)],
    ['recommended_pct_start_days', String(result.recommended_pct_start_days)],
    ['washout_complete_days', String(result.washout_complete_days)],
    ['ester_bottleneck', result.ester_bottleneck.name_en],
    ['compound_peak_times', Object.entries(result.compound_peak_times).map(([k, v]) => `${k}:${v}`).join('|')],
    ['optimal_injection_schedule', result.optimal_injection_schedule.join('|')],
    ['warnings', ''],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
