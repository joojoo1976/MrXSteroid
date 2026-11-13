/**
 * lib/tools/r6/tool-039-liver-enzyme-tracker-history.ts
 * ═══════════════════════════════════════════════════════════════════════════
 * Tool #039 — Liver Enzyme Tracker: LOCAL history + rating data layer.
 *
 * Owner decision D-08 (2026-11-11, Option A): a limited exception to the W18
 * blocker that allows LOCAL, DEVICE-ONLY storage inside Tool 039 only. It does
 * NOT open W18 at project level and does NOT enable cloud sync, session
 * persistence or any shared storage between tools.
 *
 * PURE MODULE — no React, no DOM, no I/O, no clock. The clock is always
 * injected, so "stale at read time" and the retention window are testable
 * without pretending the current date is something else. The persistence
 * adapter lives in `tool-039-liver-enzyme-tracker-history-store.ts`.
 *
 * It stores ONLY what the V6 engine produced (`result`) plus the readings the
 * user typed. It never recomputes, re-derives or invents a clinical value
 * (SPEC-R6.1-1.f), and it never writes to a server.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { daysSinceDate, labFreshness } from './tool-039-liver-enzyme-tracker-contract';

/** How long a saved result is kept on the device. */
export const TOOL_039_HISTORY_RETENTION_DAYS = 365;

/** Upper bound on the number of saved results (device storage is finite). */
export const TOOL_039_HISTORY_MAX_ENTRIES = 100;

/** Upper bound on the free-text comment length. */
export const TOOL_039_COMMENT_MAX_LENGTH = 500;

/** The envelope schema version written to the device. */
export const TOOL_039_HISTORY_SCHEMA_VERSION = 1;

export interface Tool039HistoryReading {
  marker: string;
  value: number;
  unit: string;
  date: string;
}

export interface Tool039HistoryMarker {
  marker: string;
  latestValue: number;
  unit: string;
  ulnMultiple: number;
  status: string;
  trendPer30d: number;
}

/** One saved result. */
export interface Tool039HistoryEntry {
  id: string;
  schemaVersion: number;
  /** ISO date of the blood draw — the freshness anchor. */
  drawDate: string;
  /** ISO instant the entry was saved. */
  recordedAt: string;
  readings: Tool039HistoryReading[];
  overallStatus: string;
  stopOrals: boolean;
  markers: Tool039HistoryMarker[];
  /** 1..5, or null when the user has not rated this result. */
  rating: number | null;
  /** Free text, already sanitized and length-clamped. */
  comment: string | null;
}

/** What is written to the device. */
export interface Tool039HistoryEnvelope {
  schemaVersion: number;
  consented: boolean;
  entries: Tool039HistoryEntry[];
}

export interface Tool039HistoryResult {
  overall_status: string;
  stop_orals: boolean;
  markers: Array<{
    marker: string;
    latest_value: number;
    unit: string;
    uln_multiple: number;
    status: string;
    trend_per_30d: number;
  }>;
}

export interface Tool039HistoryInput {
  readings: Array<{ marker: string; value: number; unit: string; date: string }>;
}

/** The newest draw date in the entry — the anchor for freshness and retention. */
function newestDrawDate(readings: Tool039HistoryReading[]): string {
  if (readings.length === 0) return '';
  return readings
    .map((reading) => reading.date)
    .filter((date) => typeof date === 'string' && date.length > 0)
    .sort()
    .pop() ?? '';
}

/**
 * Build one entry from the engine result. The values are COPIED from the
 * engine output; nothing is recomputed here.
 */
export function buildHistoryEntry(params: {
  id: string;
  recordedAt: string;
  input: Tool039HistoryInput;
  result: Tool039HistoryResult;
}): Tool039HistoryEntry {
  const readings: Tool039HistoryReading[] = params.input.readings.map((reading) => ({
    marker: reading.marker,
    value: reading.value,
    unit: reading.unit,
    date: reading.date,
  }));

  return {
    id: params.id,
    schemaVersion: TOOL_039_HISTORY_SCHEMA_VERSION,
    drawDate: newestDrawDate(readings),
    recordedAt: params.recordedAt,
    readings,
    overallStatus: params.result.overall_status,
    stopOrals: params.result.stop_orals,
    markers: params.result.markers.map((marker) => ({
      marker: marker.marker,
      latestValue: marker.latest_value,
      unit: marker.unit,
      ulnMultiple: marker.uln_multiple,
      status: marker.status,
      trendPer30d: marker.trend_per_30d,
    })),
    rating: null,
    comment: null,
  };
}

/**
 * Freshness of a stored result, computed AT READ TIME from the draw date.
 * A result saved today but drawn long ago is stale immediately.
 */
export function historyEntryFreshness(
  entry: Tool039HistoryEntry,
  nowIso: string,
): { ageDays: number | null; stale: boolean } {
  return labFreshness(entry.drawDate, nowIso.slice(0, 10));
}

/**
 * Drop entries that fall outside the retention window, then cap the list at
 * the maximum number of entries, newest first.
 *
 * TWO INDEPENDENT CLOCKS, deliberately:
 *   - the RETENTION window (365 days) is measured from `recordedAt` — how long
 *     the entry has been sitting on this device;
 *   - the FRESHNESS verdict (90 days) is measured from `drawDate` — how old
 *     the lab data itself is.
 * A result drawn long ago but saved today is therefore RETAINED (the user
 * asked for it) and simultaneously marked STALE (the data is old).
 */
export function pruneHistoryEntries(
  entries: Tool039HistoryEntry[],
  nowIso: string,
): Tool039HistoryEntry[] {
  const referenceDate = nowIso.slice(0, 10);
  const kept = entries.filter((entry) => {
    const age = daysSinceDate(entry.recordedAt.slice(0, 10), referenceDate);
    if (age === null) return true;
    return age <= TOOL_039_HISTORY_RETENTION_DAYS;
  });

  const ordered = [...kept].sort((a, b) => {
    if (a.drawDate !== b.drawDate) return a.drawDate < b.drawDate ? 1 : -1;
    return a.recordedAt < b.recordedAt ? 1 : -1;
  });

  return ordered.slice(0, TOOL_039_HISTORY_MAX_ENTRIES);
}

/** True only for an integer 1..5. */
export function isValidRating(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
}

/** Trim and length-clamp a free-text comment. */
export function sanitizeComment(text: unknown): { value: string | null; truncated: boolean } {
  if (typeof text !== 'string') return { value: null, truncated: false };
  const trimmed = text.trim();
  if (trimmed.length === 0) return { value: null, truncated: false };
  if (trimmed.length <= TOOL_039_COMMENT_MAX_LENGTH) return { value: trimmed, truncated: false };
  return { value: trimmed.slice(0, TOOL_039_COMMENT_MAX_LENGTH), truncated: true };
}

/**
 * Apply a rating (and optional comment) to ONE entry, identified by its id.
 * An out-of-range rating or an unknown id leaves the list untouched.
 */
export function applyRatingToEntry(
  entries: Tool039HistoryEntry[],
  entryId: string,
  rating: unknown,
  comment: unknown,
): Tool039HistoryEntry[] {
  if (!isValidRating(rating)) return entries;
  if (!entries.some((entry) => entry.id === entryId)) return entries;
  const sanitized = sanitizeComment(comment);
  return entries.map((entry) =>
    entry.id === entryId ? { ...entry, rating: rating as number, comment: sanitized.value } : entry,
  );
}

/** Remove the rating and the comment from ONE entry. */
export function clearRatingFromEntry(
  entries: Tool039HistoryEntry[],
  entryId: string,
): Tool039HistoryEntry[] {
  if (!entries.some((entry) => entry.id === entryId)) return entries;
  return entries.map((entry) =>
    entry.id === entryId ? { ...entry, rating: null, comment: null } : entry,
  );
}

const csvCell = (value: string): string => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** Export the stored entries as CSV. */
export function buildHistoryCsv(entries: Tool039HistoryEntry[], nowIso: string): string {
  const rows: string[][] = [
    ['tool', 'tool-039-liver-enzyme-tracker'],
    ['saved_at', nowIso],
    [],
    ['entry_id', 'draw_date', 'marker', 'value', 'unit', 'uln_multiple', 'status', 'overall_status', 'age_days', 'stale', 'rating', 'comment'],
  ];

  for (const entry of entries) {
    const freshness = historyEntryFreshness(entry, nowIso);
    const age = freshness.ageDays === null ? '' : String(freshness.ageDays);
    if (entry.markers.length === 0) {
      rows.push([
        entry.id,
        entry.drawDate,
        '',
        '',
        '',
        '',
        '',
        entry.overallStatus,
        age,
        freshness.stale ? 'true' : 'false',
        entry.rating === null ? '' : String(entry.rating),
        entry.comment ?? '',
      ]);
      continue;
    }
    for (const marker of entry.markers) {
      rows.push([
        entry.id,
        entry.drawDate,
        marker.marker,
        String(marker.latestValue),
        marker.unit,
        marker.ulnMultiple.toFixed(2),
        marker.status,
        entry.overallStatus,
        age,
        freshness.stale ? 'true' : 'false',
        entry.rating === null ? '' : String(entry.rating),
        entry.comment ?? '',
      ]);
    }
  }

  return rows.map((row) => row.map(csvCell).join(',')).join('\n');
}

export type Tool039HistoryEnvelopeResult =
  | { ok: true; envelope: Tool039HistoryEnvelope }
  | { ok: false; reason: 'shape' };

/**
 * Fail-closed validation of what was read back from the device. A malformed
 * payload is rejected, never partially trusted.
 */
export function validateHistoryEnvelope(raw: unknown): Tool039HistoryEnvelopeResult {
  if (!raw || typeof raw !== 'object') return { ok: false, reason: 'shape' };
  const candidate = raw as Partial<Tool039HistoryEnvelope>;
  if (candidate.schemaVersion !== TOOL_039_HISTORY_SCHEMA_VERSION) return { ok: false, reason: 'shape' };
  if (typeof candidate.consented !== 'boolean') return { ok: false, reason: 'shape' };
  if (!Array.isArray(candidate.entries)) return { ok: false, reason: 'shape' };

  const entries: Tool039HistoryEntry[] = [];
  for (const entry of candidate.entries) {
    if (!entry || typeof entry !== 'object') return { ok: false, reason: 'shape' };
    const e = entry as Partial<Tool039HistoryEntry>;
    if (typeof e.id !== 'string' || e.id.length === 0) return { ok: false, reason: 'shape' };
    if (typeof e.drawDate !== 'string') return { ok: false, reason: 'shape' };
    if (typeof e.recordedAt !== 'string') return { ok: false, reason: 'shape' };
    if (typeof e.overallStatus !== 'string') return { ok: false, reason: 'shape' };
    if (typeof e.stopOrals !== 'boolean') return { ok: false, reason: 'shape' };
    if (!Array.isArray(e.readings) || !Array.isArray(e.markers)) return { ok: false, reason: 'shape' };
    if (e.rating !== null && !isValidRating(e.rating)) return { ok: false, reason: 'shape' };
    if (e.comment !== null && typeof e.comment !== 'string') return { ok: false, reason: 'shape' };
    entries.push(e as Tool039HistoryEntry);
  }

  return {
    ok: true,
    envelope: {
      schemaVersion: TOOL_039_HISTORY_SCHEMA_VERSION,
      consented: candidate.consented as boolean,
      entries,
    },
  };
}
