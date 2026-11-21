/**
 * lib/tools/r6/tool-016-half-life-contract.ts
 *
 * Tool-owned non-clinical contract for Tool 016 — Half-Life Calculator.
 * Mirrors the values the unchanged V6 engine uses (bounds, scenario model,
 * assumptions) so the interface can explain them; a sync test proves the
 * repeated values still describe the engine's real behaviour.
 *
 * Engine, schema and adapter are not imported, edited or re-implemented here.
 * Pure module: no storage, no network, no session.
 */
import {
  HalfLifeInputSchema,
  type HalfLifeInput,
  type HalfLifeResult,
} from '@/lib/tools/schemas/tool-016-half-life-calculator';

export type { HalfLifeInput, HalfLifeResult };

export type Tool016CompoundDraft = {
  name: string;
  halfLifeDays: string;
  source: string;
};

export interface Tool016Draft {
  compounds: Tool016CompoundDraft[];
  remainingPercent: string;
}

export type Tool016UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool016FieldId = 'compounds' | 'remainingPercent';

export type Tool016IssueCode =
  | 'invalid_number'
  | 'out_of_range'
  | 'required'
  | 'schema_mismatch';

export interface Tool016Issue {
  field: Tool016FieldId;
  code: Tool016IssueCode;
  detail?: string;
}

export interface Tool016Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool016Issue[];
  input: HalfLifeInput | null;
}

export const TOOL_016_LIMITS = {
  compoundsMin: 1,
  compoundsMax: 12,
  halfLifeDaysMin: 0, // exclusive in schema (>0); 0 is invalid
  halfLifeDaysMax: 1_000_000,
  remainingPercentMin: 0, // exclusive (>0)
  remainingPercentMax: 100, // exclusive (<100)
  nameMin: 1,
  nameMax: 80,
  sourceMin: 5,
  sourceMax: 500,
  unit: 'day',
} as const;

export const TOOL_016_ASSUMPTIONS = [
  'constant_half_life',
  'independent_items',
  'not_clinical',
] as const;

export const TOOL_016_MODEL = 'SINGLE_EXPONENTIAL_ELIMINATION_SCENARIO';

/** Mirrored elapsed-days for a compound: half_life * log(remaining/100) / log(0.5). */
export function mirroredElapsedDays(halfLifeDays: number, remainingPercent: number): number {
  const remainingFraction = remainingPercent / 100;
  return halfLifeDays * Math.log(remainingFraction) / Math.log(0.5);
}

export function formatDays(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : '—';
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/* ── Draft evaluation ──────────────────────────────────────────────────────── */

function numeric(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export function evaluateHalfLifeDraft(draft: Tool016Draft): Tool016Evaluation {
  const issues: Tool016Issue[] = [];

  // Remaining percent.
  let remainingPercent: number | null = null;
  if (draft.remainingPercent.trim() !== '') {
    remainingPercent = numeric(draft.remainingPercent);
    if (remainingPercent === null) {
      issues.push({ field: 'remainingPercent', code: 'invalid_number' });
    } else if (remainingPercent <= 0 || remainingPercent >= 100) {
      issues.push({ field: 'remainingPercent', code: 'out_of_range' });
    }
  }

  // Compounds.
  const validCompounds: HalfLifeInput['compounds'] = [];
  const anyCompoundEntered = draft.compounds.some(
    (c) => c.name.trim() !== '' || c.halfLifeDays.trim() !== '' || c.source.trim() !== '',
  );

  for (const c of draft.compounds) {
    const entered = c.name.trim() !== '' || c.halfLifeDays.trim() !== '' || c.source.trim() !== '';
    if (!entered) continue;
    // Validate name.
    if (c.name.trim().length < 1 || c.name.trim().length > 80) {
      issues.push({ field: 'compounds', code: 'out_of_range', detail: 'name' });
    }
    // Validate half-life.
    const hl = numeric(c.halfLifeDays);
    if (hl === null && c.halfLifeDays.trim() !== '') {
      issues.push({ field: 'compounds', code: 'invalid_number', detail: 'half_life_days' });
    } else if (hl !== null && (hl <= 0 || hl > 1_000_000)) {
      issues.push({ field: 'compounds', code: 'out_of_range', detail: 'half_life_days' });
    }
    // Validate source.
    if (c.source.trim().length > 0 && (c.source.trim().length < 5 || c.source.trim().length > 500)) {
      issues.push({ field: 'compounds', code: 'out_of_range', detail: 'source' });
    }

    const allThree =
      c.name.trim().length >= 1 &&
      c.name.trim().length <= 80 &&
      hl !== null &&
      hl > 0 &&
      hl <= 1_000_000 &&
      c.source.trim().length >= 5 &&
      c.source.trim().length <= 500;

    if (allThree) {
      validCompounds.push({
        name: c.name.trim(),
        half_life_days: hl as number,
        source: c.source.trim(),
      });
    }
  }

  const anyEntered = anyCompoundEntered || draft.remainingPercent.trim() !== '';

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  // Partial until at least one complete compound and remaining percent.
  const hasCompleteCompound = validCompounds.length >= 1;
  const hasRemaining = remainingPercent !== null && remainingPercent > 0 && remainingPercent < 100;

  if (!hasCompleteCompound || !hasRemaining) return { state: 'PARTIAL', issues, input: null };

  const candidate: HalfLifeInput = {
    compounds: validCompounds,
    remaining_percent: remainingPercent as number,
  };

  const parsed = HalfLifeInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return { state: 'INVALID', issues: [{ field: 'compounds', code: 'schema_mismatch' }], input: null };
  }

  return { state: 'READY', issues, input: parsed.data };
}

/* ── Sources (C4) ─────────────────────────────────────────────────────────── */

export interface Tool016SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

export const TOOL_016_SOURCES: readonly Tool016SourceRef[] = [];

/* ── Cross-tool links (box 8) ─────────────────────────────────────────────── */

export interface Tool016MappedField {
  targetField: string;
  note: string;
}

export interface Tool016CrossToolLink {
  targetToolId: string;
  mappedFields: Tool016MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

export const TOOL_016_CROSS_TOOL_LINKS: readonly Tool016CrossToolLink[] = [
  {
    targetToolId: 'tool-034-compound-clearance',
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

export function buildHalfLifeCsv(
  input: HalfLifeInput,
  result: HalfLifeResult,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-016-half-life-calculator'],
    ['calculated_at', calculatedAt],
    [],
    ['remaining_percent', String(input.remaining_percent)],
    [],
    ['compound', 'half_life_days', 'source', 'elapsed_days'],
    ...result.compounds.map((c) => [c.name, String(c.half_life_days), c.source, String(c.elapsed_days)]),
    [],
    ['status', result.status],
    ['model', result.model],
    ['assumptions', result.assumptions.join('|')],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
