/**
 * lib/tools/r6/tool-041-hematocrit-monitor-contract.ts
 *
 * The tool-owned, non-clinical contract for Tool 041 — Hematocrit Monitor.
 *
 * This module is the "content module" half of OD-12 option B: it repeats the
 * values the unchanged V6 engine already uses (upper reference, intervention
 * line, band offsets, projection horizon, rising-trend flag, donation offset)
 * so the interface can explain them, and a sync test proves the repeated
 * values still describe the engine's real behaviour. The engine itself is not
 * imported, edited or re-implemented here.
 *
 * Nothing in this file is a new medical threshold, citation or treatment
 * recommendation. Every clinical sentence is deliberately held as
 * `NOT_AVAILABLE` until a specialist approves approved wording (OD-13/OD-14).
 *
 * Pure module: no storage, no network, no session.
 */
import {
  HematocritInputSchema,
  HematocritResultSchema,
  type HematocritInput,
} from '@/lib/tools/schemas/tool-041-hematocrit-monitor';

/** The result shape, derived from the canonical schema (no engine import). */
type HematocritResult = ReturnType<typeof HematocritResultSchema.parse>;

/* ── Input shape used by the UI while the user is still typing ─────────────── */

export interface Tool041ReadingDraft {
  /** HCT as typed, so an empty field can stay empty (a typed 0 is not valid). */
  value: string;
  /** Draw date, `YYYY-MM-DD`. */
  date: string;
}

export interface Tool041Draft {
  readings: Tool041ReadingDraft[];
  sex: '' | 'male' | 'female';
  /** Tri-state so "not answered" is never silently treated as "no". */
  onCycle: '' | 'yes' | 'no';
  weeksRemaining: string;
}

export type Tool041UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool041FieldId = 'hct' | 'date' | 'sex' | 'onCycle' | 'weeksRemaining';

export type Tool041IssueCode = 'invalid_number' | 'out_of_range' | 'invalid_date' | 'required';

export interface Tool041Issue {
  /** Index of the reading for the per-row fields, `null` for the context fields. */
  readingIndex: number | null;
  field: Tool041FieldId;
  code: Tool041IssueCode;
}

export interface Tool041Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool041Issue[];
  input: HematocritInput | null;
}

/* ── The values the engine already uses (mirrored, never re-derived) ───────── */

export const TOOL_041_LIMITS = {
  male: { upper: 50, intervene: 54 },
  female: { upper: 44.5, intervene: 48 },
  /** `high` starts above `upper + 2` percentage points. */
  highBandOffset: 2,
  /** The projection is reported only inside this horizon. */
  projectionHorizonDays: 180,
  /** A 30-day slope above this value raises `rising_trend_30d`. */
  risingTrendPer30d: 1.5,
  /** `donate_eligible` is `latest >= intervene - 1`. */
  donationOffset: 1,
  /** The input contract's accepted HCT window. */
  inputMin: 20,
  inputMax: 70,
  minReadings: 2,
  maxReadings: 24,
  /** The engine's unit is percent. */
  unit: 'percent',
} as const;

export const TOOL_041_BANDS = ['normal', 'borderline', 'high', 'very-high'] as const;
export type Tool041Band = (typeof TOOL_041_BANDS)[number];

const BAND_KEYS: Record<Tool041Band, string> = {
  normal: 'band_normal',
  borderline: 'band_borderline',
  high: 'band_high',
  'very-high': 'band_very_high',
};

/** Localised key for a band; never returns the raw engine code. */
export function bandLabelKey(band: string): string {
  return BAND_KEYS[band as Tool041Band] ?? 'band_unknown';
}

const WARNING_KEYS: Record<string, string> = {
  on_cycle_elevated_hct: 'warning_on_cycle_elevated_hct',
  rising_trend_30d: 'warning_rising_trend_30d',
  above_intervention_line_seek_physician: 'warning_above_intervention_line_seek_physician',
  no_valid_readings: 'warning_no_valid_readings',
};

/**
 * Localised key for an engine warning code. An unknown code is never printed
 * as a raw code: it falls back to a neutral explanation.
 */
export function warningLabelKey(code: string): string {
  return WARNING_KEYS[code] ?? 'warning_unknown';
}

/** The engine's intervention line for the selected sex. */
export function interventionLine(sex: HematocritInput['sex']): number {
  return TOOL_041_LIMITS[sex].intervene;
}

/** The engine's upper reference for the selected sex. */
export function upperReference(sex: HematocritInput['sex']): number {
  return TOOL_041_LIMITS[sex].upper;
}

/** One decimal, matching the engine's reported precision. */
export function formatHct(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : '—';
}

/** Signed 30-day slope, one decimal. */
export function formatSlope(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const rounded = Math.round(value * 100) / 100;
  return `${rounded >= 0 ? '+' : ''}${rounded.toFixed(2)}`;
}

/* ── Draft evaluation (the five-state model) ───────────────────────────────── */

/**
 * True when the string is a REAL calendar date. `2026-02-30` is not: the
 * JavaScript Date constructor would roll it into March, so the check is done
 * here rather than trusting the parser.
 */
export function isRealCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (month < 1 || month > 12 || day < 1) return false;
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

function numeric(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

/**
 * Evaluate the draft exactly once, in the documented order:
 * EMPTY → INVALID → PARTIAL → READY. The final READY candidate is also parsed
 * by the canonical Zod input contract, so this function cannot drift from it.
 */
export function evaluateHematocritDraft(draft: Tool041Draft): Tool041Evaluation {
  const issues: Tool041Issue[] = [];
  const readings = draft.readings;

  readings.forEach((reading, index) => {
    const rawValue = reading.value.trim();
    if (rawValue !== '') {
      const value = numeric(rawValue);
      if (value === null) {
        issues.push({ readingIndex: index, field: 'hct', code: 'invalid_number' });
      } else if (value < TOOL_041_LIMITS.inputMin || value > TOOL_041_LIMITS.inputMax) {
        issues.push({ readingIndex: index, field: 'hct', code: 'out_of_range' });
      }
    }
    if (reading.date.trim() !== '' && !isRealCalendarDate(reading.date.trim())) {
      issues.push({ readingIndex: index, field: 'date', code: 'invalid_date' });
    }
  });

  const weeksRaw = draft.weeksRemaining.trim();
  if (weeksRaw !== '') {
    const weeks = numeric(weeksRaw);
    if (weeks === null) {
      issues.push({ readingIndex: null, field: 'weeksRemaining', code: 'invalid_number' });
    } else if (!Number.isInteger(weeks) || weeks < 0 || weeks > 52) {
      issues.push({ readingIndex: null, field: 'weeksRemaining', code: 'out_of_range' });
    }
  }

  const anyEntered =
    readings.some((reading) => reading.value.trim() !== '' || reading.date.trim() !== '') ||
    draft.sex !== '' ||
    draft.onCycle !== '' ||
    weeksRaw !== '';

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  const everyReadingComplete =
    readings.length >= TOOL_041_LIMITS.minReadings &&
    readings.every((reading) => reading.value.trim() !== '' && reading.date.trim() !== '');

  if (!everyReadingComplete || draft.sex === '' || draft.onCycle === '' || weeksRaw === '') {
    return { state: 'PARTIAL', issues, input: null };
  }

  const candidate: HematocritInput = {
    readings: readings.map((reading) => ({
      hct_pct: Number(reading.value.trim()),
      date: reading.date.trim(),
    })),
    sex: draft.sex,
    on_cycle: draft.onCycle === 'yes',
    weeks_remaining: Number(weeksRaw),
  };

  const parsed = HematocritInputSchema.safeParse(candidate);
  if (!parsed.success) {
    return {
      state: 'INVALID',
      issues: [{ readingIndex: null, field: 'hct', code: 'out_of_range' }],
      input: null,
    };
  }

  return { state: 'READY', issues, input: parsed.data };
}

/* ── Public reference sources (C4) ────────────────────────────────────────── */

export interface Tool041SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

/**
 * No approved source exists in the repository for Tool 041. The box therefore
 * renders `NOT_AVAILABLE — no approved source recorded` and this list stays
 * empty until the owner/specialist supplies a checked reference (OD-13).
 */
export const TOOL_041_SOURCES: readonly Tool041SourceRef[] = [];

/* ── Cross-tool links (box 8) ─────────────────────────────────────────────── */

export interface Tool041MappedField {
  targetField: string;
  note: string;
}

export interface Tool041CrossToolLink {
  targetToolId: string;
  mappedFields: Tool041MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

/**
 * Related R6 tools that read the same blood panel by hand. Nothing is
 * transferred automatically while W18 is undecided; the freshness anchor is
 * the draw date the user typed.
 */
export const TOOL_041_CROSS_TOOL_LINKS: readonly Tool041CrossToolLink[] = [
  {
    targetToolId: 'tool-023-trt-optimization',
    mappedFields: [
      { targetField: 'hematocrit_current', note: 're-enter the latest HCT by hand; it is an optional input there' },
    ],
    freshnessRule: 'the value is only comparable when both tools use the same blood-draw date',
    transfer: 'manual-reentry',
  },
  {
    targetToolId: 'tool-007-bloodwork-analyzer',
    mappedFields: [
      { targetField: 'CBC / hematocrit row', note: 'the same printed lab value is typed into each tool separately' },
    ],
    freshnessRule: 'the draw date printed on the report is the only freshness anchor',
    transfer: 'manual-reentry',
  },
];

/* ── CSV export (browser only) ────────────────────────────────────────────── */

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/**
 * CSV of the entered readings and the engine result. Generated in the browser
 * only — no server call, no account, no secret, no session identifier.
 */
export function buildHematocritCsv(
  input: HematocritInput,
  result: HematocritResult,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-041-hematocrit-monitor'],
    ['calculated_at', calculatedAt],
    [],
    ['reading_index', 'draw_date', 'hct_pct'],
    ...input.readings.map((reading, index) => [String(index + 1), reading.date, String(reading.hct_pct)]),
    [],
    ['sex', input.sex],
    ['on_cycle', String(input.on_cycle)],
    ['weeks_remaining', String(input.weeks_remaining)],
    [],
    ['latest_hct_pct', String(result.latest_hct_pct)],
    ['baseline_hct_pct', String(result.baseline_hct_pct)],
    ['slope_per_30d', String(result.slope_per_30d)],
    ['band', result.band],
    ['projected_threshold_date', result.projected_threshold_date ?? ''],
    ['donate_eligible', String(result.donate_eligible)],
    ['warnings', result.warnings.join('|')],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
