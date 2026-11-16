/**
 * lib/tools/r6/tool-050-mental-health-contract.ts
 *
 * The tool-owned, non-clinical contract for Tool 050 — Mental Health Monitor.
 *
 * This module is the "content module" half of the same decision taken for Tool
 * 041 (OD-12 option B): it repeats the values the unchanged V6 engine already
 * uses (mood scale, trend thresholds, band cut-offs, red-flag and warning
 * triggers, input bounds) so the interface can explain them, and a sync test
 * proves the repeated values still describe the engine's real behaviour. The
 * engine, schema and adapter are not imported, edited or re-implemented here.
 *
 * Nothing in this file is a new medical threshold, citation, prescription or
 * treatment recommendation. The engine's existing warnings are preserved and
 * only mapped to localisation keys; crisis language stays as the engine's own
 * wording. Every clinical sentence that would need new wording is held as
 * `NOT_AVAILABLE` until a specialist approves it.
 *
 * Pure module: no storage, no network, no session.
 */
import {
  MentalHealthInputSchema,
  MentalHealthResultSchema,
  MoodScoreSchema,
  type MentalHealthInput,
} from '@/lib/tools/schemas/tool-050-mental-health';

/** The result shape, derived from the canonical schema (no engine import). */
export type MentalHealthResult = ReturnType<typeof MentalHealthResultSchema.parse>;

/* ── Input shape used by the UI while the user is still typing ─────────────── */

export type Tool050Bool = '' | 'yes' | 'no';

export interface Tool050MoodEntry {
  score: string;
  date: string;
}

export interface Tool050Draft {
  moodText: string;
  sleepHours: string;
  irritability: string;
  aggression: string;
  uses19Nor: Tool050Bool;
  redFlags: string[];
}

export type Tool050UiState = 'EMPTY' | 'PARTIAL' | 'INVALID' | 'FULL' | 'DEGRADED';

export type Tool050FieldId =
  | 'moodText'
  | 'sleepHours'
  | 'irritability'
  | 'aggression'
  | 'uses19Nor';

export type Tool050IssueCode =
  | 'invalid_number'
  | 'out_of_range'
  | 'required'
  | 'schema_mismatch';

export interface Tool050Issue {
  field: Tool050FieldId;
  code: Tool050IssueCode;
}

export interface Tool050Evaluation {
  state: 'EMPTY' | 'PARTIAL' | 'INVALID' | 'READY';
  issues: Tool050Issue[];
  input: MentalHealthInput | null;
}

/* ── The values the engine already uses (mirrored, never re-derived) ───────── */

export const TOOL_050_LIMITS = {
  /** Input contract bounds. */
  moodScoreMin: 1,
  moodScoreMax: 10,
  moodEntriesMin: 3,
  moodEntriesMax: 30,
  sleepHoursMin: 0,
  sleepHoursMax: 14,
  irritabilityMin: 0,
  irritabilityMax: 28,
  aggressionMin: 0,
  aggressionMax: 28,
  /** Engine trend thresholds (half-split means). */
  trendImprovingDelta: 0.5,
  trendDecliningDelta: -0.5,
  trendMinEntries: 4,
  /** Engine band cut-offs on average mood. */
  bandStableAtLeast: 7,
  bandWatchAtLeast: 5,
  bandConcernAtLeast: 3,
  /** Engine triggers. */
  sleepDebtBelowHours: 6,
  irritabilityFlagAtLeast: 3,
  aggressionFlagAtLeast: 1,
  redFlagCodes: ['self_harm_thoughts', 'rage_episodes', 'hopelessness'] as readonly string[],
  /** The engine's canonical unit. */
  unit: 'mood/10',
} as const;

/* ── Label maps (the engine emits codes, never display text) ───────────────── */

const TREND_KEYS: Record<string, string> = {
  improving: 'trend_improving',
  stable: 'trend_stable',
  declining: 'trend_declining',
};

export function trendLabelKey(trend: string): string {
  return TREND_KEYS[trend] ?? 'trend_unknown';
}

const BAND_KEYS: Record<string, string> = {
  stable: 'band_stable',
  watch: 'band_watch',
  concern: 'band_concern',
  critical: 'band_critical',
};

export function bandLabelKey(band: string): string {
  return BAND_KEYS[band] ?? 'band_unknown';
}

const RED_FLAG_KEYS: Record<string, string> = {
  self_harm_thoughts: 'rf_self_harm',
  rage_episodes: 'rf_rage',
  hopelessness: 'rf_hopelessness',
};

export function redFlagLabelKey(code: string): string {
  return RED_FLAG_KEYS[code] ?? 'rf_unknown';
}

const WARNING_KEYS: Record<string, string> = {
  red_flag_seek_immediate_help: 'warning_red_flag',
  crisis_line_988_us_or_local_emergency: 'warning_crisis',
  sleep_debt_pattern: 'warning_sleep',
  irritability_pattern: 'warning_irritability',
  aggression_episodes_reported: 'warning_aggression',
  '19nor_mood_flag': 'warning_19nor',
};

export function warningLabelKey(code: string): string {
  return WARNING_KEYS[code] ?? 'warning_unknown';
}

/* ── Mood text parsing ─────────────────────────────────────────────────────── */

export interface ParsedMoodEntry {
  score: number;
  date: string;
}

export interface MoodParseResult {
  entries: ParsedMoodEntry[];
  error: string | null;
}

/**
 * Parse a textarea of "score,date" lines (one per entry) into engine-shaped
 * entries. Returns an error string when any line is malformed; the caller
 * surfaces it as an INVALID state.
 */
export function parseMoodText(text: string): MoodParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return { entries: [], error: null };

  const entries: ParsedMoodEntry[] = [];
  for (const line of lines) {
    const parts = line.split(/[,\s]+/).filter((p) => p.length > 0);
    if (parts.length < 2) {
      return { entries: [], error: 'invalid_line' };
    }
    const score = Number(parts[0]);
    const date = parts[1];
    if (!Number.isFinite(score) || score < TOOL_050_LIMITS.moodScoreMin || score > TOOL_050_LIMITS.moodScoreMax) {
      return { entries: [], error: 'invalid_score' };
    }
    if (Number.isNaN(Date.parse(date))) {
      return { entries: [], error: 'invalid_date' };
    }
    entries.push({ score, date });
  }

  if (entries.length > TOOL_050_LIMITS.moodEntriesMax) {
    return { entries: [], error: 'too_many' };
  }

  return { entries, error: null };
}

/* ── Mirrored arithmetic, used only to EXPLAIN the engine result ───────────── */

export function mirroredAvgMood(entries: ParsedMoodEntry[]): number {
  if (entries.length === 0) return 0;
  const pts = entries
    .map((m) => ({ t: Date.parse(m.date), v: m.score }))
    .filter((p) => !Number.isNaN(p.t))
    .sort((a, b) => a.t - b.t);
  if (pts.length === 0) return 0;
  const mean = pts.reduce((s, p) => s + p.v, 0) / pts.length;
  return Math.round(mean * 10) / 10;
}

export function mirroredTrend(entries: ParsedMoodEntry[]): string {
  const pts = entries
    .map((m) => ({ t: Date.parse(m.date), v: m.score }))
    .filter((p) => !Number.isNaN(p.t))
    .sort((a, b) => a.t - b.t);
  if (pts.length < TOOL_050_LIMITS.trendMinEntries) return 'stable';
  const half = Math.floor(pts.length / 2);
  const first = pts.slice(0, half).reduce((s, p) => s + p.v, 0) / half;
  const second = pts.slice(half).reduce((s, p) => s + p.v, 0) / (pts.length - half);
  const delta = second - first;
  if (delta >= TOOL_050_LIMITS.trendImprovingDelta) return 'improving';
  if (delta <= TOOL_050_LIMITS.trendDecliningDelta) return 'declining';
  return 'stable';
}

export function mirroredBand(avgMood: number): string {
  if (avgMood >= TOOL_050_LIMITS.bandStableAtLeast) return 'stable';
  if (avgMood >= TOOL_050_LIMITS.bandWatchAtLeast) return 'watch';
  if (avgMood >= TOOL_050_LIMITS.bandConcernAtLeast) return 'concern';
  return 'critical';
}

export function mirroredEscalation(redFlags: string[]): boolean {
  return redFlags.length > 0;
}

export function mirroredSleepFlag(sleepHours: number): boolean {
  return sleepHours < TOOL_050_LIMITS.sleepDebtBelowHours;
}

export function mirroredIrritabilityFlag(irritability: number): boolean {
  return irritability >= TOOL_050_LIMITS.irritabilityFlagAtLeast;
}

export function mirroredWarnings(input: MentalHealthInput, avgMood: number, trend: string): string[] {
  const warnings: string[] = [];
  const escalation = input.red_flags.length > 0;
  const sleepFlag = input.sleep_hours_avg < TOOL_050_LIMITS.sleepDebtBelowHours;
  const irritabilityFlag = input.irritability_episodes >= TOOL_050_LIMITS.irritabilityFlagAtLeast;
  const band = mirroredBand(avgMood);
  if (escalation) {
    warnings.push('red_flag_seek_immediate_help');
    warnings.push('crisis_line_988_us_or_local_emergency');
  }
  if (sleepFlag) warnings.push('sleep_debt_pattern');
  if (irritabilityFlag) warnings.push('irritability_pattern');
  if (input.aggression_episodes >= TOOL_050_LIMITS.aggressionFlagAtLeast) {
    warnings.push('aggression_episodes_reported');
  }
  if (input.uses_19_nor && (band === 'concern' || band === 'critical' || trend === 'declining')) {
    warnings.push('19nor_mood_flag');
  }
  return [...new Set(warnings)];
}

export function formatMood(value: number): string {
  return Number.isFinite(value) ? `${value}/10` : '—';
}

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

export function evaluateMentalHealthDraft(draft: Tool050Draft): Tool050Evaluation {
  const issues: Tool050Issue[] = [];

  const parsed = parseMoodText(draft.moodText);
  if (parsed.error !== null) {
    issues.push({ field: 'moodText', code: 'invalid_number' });
  }

  const sleep = numeric(draft.sleepHours);
  if (draft.sleepHours.trim() !== '' && sleep === null) {
    issues.push({ field: 'sleepHours', code: 'invalid_number' });
  } else if (sleep !== null && (sleep < TOOL_050_LIMITS.sleepHoursMin || sleep > TOOL_050_LIMITS.sleepHoursMax)) {
    issues.push({ field: 'sleepHours', code: 'out_of_range' });
  }

  const irritability = numeric(draft.irritability);
  if (draft.irritability.trim() !== '' && irritability === null) {
    issues.push({ field: 'irritability', code: 'invalid_number' });
  } else if (irritability !== null && (irritability < TOOL_050_LIMITS.irritabilityMin || irritability > TOOL_050_LIMITS.irritabilityMax)) {
    issues.push({ field: 'irritability', code: 'out_of_range' });
  }

  const aggression = numeric(draft.aggression);
  if (draft.aggression.trim() !== '' && aggression === null) {
    issues.push({ field: 'aggression', code: 'invalid_number' });
  } else if (aggression !== null && (aggression < TOOL_050_LIMITS.aggressionMin || aggression > TOOL_050_LIMITS.aggressionMax)) {
    issues.push({ field: 'aggression', code: 'out_of_range' });
  }

  if (draft.uses19Nor !== '' && draft.uses19Nor !== 'yes' && draft.uses19Nor !== 'no') {
    issues.push({ field: 'uses19Nor', code: 'out_of_range' });
  }

  const anyEntered =
    draft.moodText.trim() !== '' ||
    draft.sleepHours.trim() !== '' ||
    draft.irritability.trim() !== '' ||
    draft.aggression.trim() !== '' ||
    draft.uses19Nor !== '' ||
    draft.redFlags.length > 0;

  if (!anyEntered) return { state: 'EMPTY', issues, input: null };
  if (issues.length > 0) return { state: 'INVALID', issues, input: null };

  // Partial until we have at least 3 mood entries and all required fields.
  const hasEnoughMoods = parsed.entries.length >= TOOL_050_LIMITS.moodEntriesMin;
  const allFields =
    sleep !== null &&
    irritability !== null &&
    aggression !== null &&
    draft.uses19Nor !== '';

  if (!hasEnoughMoods || !allFields) return { state: 'PARTIAL', issues, input: null };

  const candidate: MentalHealthInput = {
    mood_scores: parsed.entries.map((e) => ({ score: e.score, date: e.date })),
    sleep_hours_avg: sleep as number,
    irritability_episodes: irritability as number,
    aggression_episodes: aggression as number,
    uses_19_nor: draft.uses19Nor === 'yes',
    red_flags: draft.redFlags as MentalHealthInput['red_flags'],
  };

  const validated = MentalHealthInputSchema.safeParse(candidate);
  if (!validated.success) {
    return { state: 'INVALID', issues: [{ field: 'moodText', code: 'schema_mismatch' }], input: null };
  }

  return { state: 'READY', issues, input: validated.data };
}

/* ── Public reference sources (C4) ────────────────────────────────────────── */

export interface Tool050SourceRef {
  id: string;
  titleKey: string;
  publisher: string;
  reviewedOn: string;
  evidenceLevel: 'E1' | 'E2' | 'E3';
  url: string;
}

export const TOOL_050_SOURCES: readonly Tool050SourceRef[] = [];

/* ── Cross-tool links (box 8) ─────────────────────────────────────────────── */

export interface Tool050MappedField {
  targetField: string;
  note: string;
}

export interface Tool050CrossToolLink {
  targetToolId: string;
  mappedFields: Tool050MappedField[];
  freshnessRule: string;
  transfer: 'manual-reentry';
}

export const TOOL_050_CROSS_TOOL_LINKS: readonly Tool050CrossToolLink[] = [
  {
    targetToolId: 'tool-049-bone-density',
    mappedFields: [
      {
        targetField: 'ai_exposure_years',
        note: 're-enter the aromatase-inhibitor exposure years by hand; nothing is copied',
      },
    ],
    freshnessRule: 'the comparison is valid only when both tools use the same protocol start date',
    transfer: 'manual-reentry',
  },
  {
    targetToolId: 'tool-047-fertility-preservation',
    mappedFields: [
      {
        targetField: 'suppression_level',
        note: 're-enter the suppression level by hand; nothing is copied',
      },
    ],
    freshnessRule: 'the comparison is valid only when both tools use the same protocol start date',
    transfer: 'manual-reentry',
  },
];

/* ── CSV export (browser only) ────────────────────────────────────────────── */

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

export function buildMentalHealthCsv(
  input: MentalHealthInput,
  result: MentalHealthResult,
  calculatedAt: string,
): string {
  const rows: string[][] = [
    ['tool', 'tool-050-mental-health'],
    ['calculated_at', calculatedAt],
    [],
    ['mood_scores', input.mood_scores.map((m) => `${m.score}@${m.date}`).join('|')],
    ['sleep_hours_avg', String(input.sleep_hours_avg)],
    ['irritability_episodes', String(input.irritability_episodes)],
    ['aggression_episodes', String(input.aggression_episodes)],
    ['uses_19_nor', String(input.uses_19_nor)],
    ['red_flags', input.red_flags.join('|')],
    [],
    ['avg_mood', String(result.avg_mood)],
    ['trend', result.trend],
    ['band', result.band],
    ['escalation', String(result.escalation)],
    ['sleep_flag', String(result.sleep_flag)],
    ['irritability_flag', String(result.irritability_flag)],
    ['warnings', result.warnings.join('|')],
  ];
  return rows.map((row) => row.map((cell) => csvCell(cell)).join(',')).join('\n');
}
